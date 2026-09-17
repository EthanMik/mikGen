import { useEffect, useRef, useState } from "react";
import FileRenamePopup from "./FileRenamePopup";
import { updatePath, fileFormatStore } from "../../hooks/useFileFormat";
import { newFileFormat, serializeFile } from "../../core/FileSchema";
import { saveSnapshot, undoHistory, fileUndosStore } from "../../core/Undo/UndoHistory";
import { loadContentIntoState, loadFromHandle, fileSaveStore, fileHandleStore, dirHandleStore } from "../../core/FileStore";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";

// Firefox has no File System Access API, so saving in place is impossible there and only downloading works
const canSaveToDisk = 'showSaveFilePicker' in window;

export default function FileButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const renameResolveRef = useRef<((name: string | null) => void) | null>(null);
    const underlineRef = useRef<((val: boolean) => void) | undefined>(undefined);

    const [popupOpen, setPopupOpen] = useState(false);
    // File state is only needed when a menu action fires, so read it at call time instead of
    // subscribing this always-mounted menu to every store write
    const setPath = updatePath;
    const [isSaved, setIsSaved] = useState(true);
    const skipSave = useRef(true);

    const historyLength = undoHistory.useSelector(h => h.length);
    const [label, setLabel] = useState("");

    useEffect(() => {
        underlineRef.current?.(!isSaved);
    }, [isSaved]);

    const getFileName = (fileName = ""): string => {
        const { path, format } = fileFormatStore.getState();
        const pathName = fileName === "" ? path.name : fileName;
        if (pathName === "" || pathName === null || pathName === undefined) {
            return format.slice(0, 3) + "Path";
        }
        return pathName;
    }

    useEffect(() => {
        if (skipSave.current) {
            skipSave.current = false;
            return;
        }
        setIsSaved(false);
    }, [historyLength]);

    // Reset isSaved when an external load (e.g. FolderButton) updates the file handle
    useEffect(() => {
        return fileHandleStore.subscribe(() => {
            skipSave.current = true;
            setIsSaved(true);
        });
    }, []);

    const updatePathName = (name: string) => {
        setPath(prev => ({ ...prev, name }));
        renameResolveRef.current?.(name);
        renameResolveRef.current = null;
    };

    const requestFileName = () => {
        setPopupOpen(true);
        return new Promise<string | null>((resolve) => {
            renameResolveRef.current = resolve;
        });
    };

    useEffect(() => {
        if (!popupOpen && renameResolveRef.current) {
            renameResolveRef.current(null);
            renameResolveRef.current = null;
        }
    }, [popupOpen]);

    const handleNewFile = () => {
        if (fileUndosStore.getState() > 1) {
            if (canSaveToDisk) handleSaveAs();
            else handleDownloadAs();
        }

        const { format, field } = fileFormatStore.getState();
        fileFormatStore.setState(newFileFormat(format, field));
        saveSnapshot();
        fileUndosStore.setState(0);
        fileHandleStore.setState(null);
        setIsSaved(true);
    };

    const handleOpenFile = async () => {
        if (!('showOpenFilePicker' in window)) {
            fileInputRef.current?.click();
            return;
        }

        try {
            // @ts-expect-error showOpenFilePicker not in all TS DOM libs
            const [handle] = await window.showOpenFilePicker({
                types: [
                    { description: 'Text Files', accept: { 'text/plain': ['.txt'] } },
                    { description: 'JSON Files', accept: { 'application/json': ['.json'] } },
                    { description: 'CSV Files', accept: { 'text/csv': ['.csv'] } },
                ],
                multiple: false,
            });

            await loadFromHandle(handle);
            setIsSaved(true);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error opening file:', error);
            }
        }
    };

    const handleOpenFolder = async () => {
        if (!('showDirectoryPicker' in window)) return;
        try {
            // @ts-expect-error showDirectoryPicker not in all TS DOM libs
            const handle = await window.showDirectoryPicker({ mode: "read" });
            dirHandleStore.setState(handle);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error opening folder:', error);
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) {
            if (fileUndosStore.getState() > 1 && !window.confirm("You have unsaved changes. Discard and load new file?")) return;
            const reader = new FileReader();
            reader.onload = e => loadContentIntoState(e.target?.result as string, file.name.replace(/\.[^/.]+$/, ""));
            reader.readAsText(file);
        }
        fileHandleStore.setState(null);
        setIsSaved(true);
        skipSave.current = true;
    };

    const handleSave = async () => {
        if (!canSaveToDisk) return;
        try {
            const handle = fileHandleStore.getState();
            if (handle) {
                const writable = await handle.createWritable();
                await writable.write(serializeFile(fileFormatStore.getState()));
                await writable.close();
                setIsSaved(true);
                fileUndosStore.setState(0);
                fileSaveStore.setState(n => n + 1);
            } else {
                await handleSaveAs();
            }
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    const handleSaveAs = async () => {
        if (!canSaveToDisk) return;
        setLabel("Save As:");
        try {
            const name = await requestFileName();
            if (name === null || name === "") return;

            // @ts-expect-error showSaveFilePicker not in all TS DOM libs
            const handle = await window.showSaveFilePicker({
                suggestedName: `${name}.txt`,
                types: [
                    { description: 'Text Files', accept: { 'text/plain': ['.txt'] } },
                    { description: 'JSON Files', accept: { 'application/json': ['.json'] } },
                ],
            });

            fileHandleStore.setState(handle);
            const savedFileName = handle.name.replace(/\.[^/.]+$/, "");
            setPath(prev => ({ ...prev, name: savedFileName }));

            const writable = await handle.createWritable();
            await writable.write(serializeFile(fileFormatStore.getState()));
            await writable.close();
            setIsSaved(true);
            fileUndosStore.setState(0);
            fileSaveStore.setState(n => n + 1);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error saving file:', error);
            }
        }
    };

    const downloadText = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = () => {
        downloadText(serializeFile(fileFormatStore.getState()), `${getFileName()}.txt`);
        setIsSaved(true);
    };

    const handleDownloadAs = async () => {
        setLabel("Download As:");
        const name = await requestFileName();
        if (name === null) return;
        downloadText(serializeFile(fileFormatStore.getState()), `${getFileName(name)}.txt`);
        setIsSaved(true);
    };

    const handleNewFileRef = useRef(handleNewFile);
    const handleOpenFileRef = useRef(handleOpenFile);
    const handleOpenFolderRef = useRef(handleOpenFolder);
    const handleSaveRef = useRef(handleSave);
    const handleSaveAsRef = useRef(handleSaveAs);
    const handleDownloadRef = useRef(handleDownload);
    const handleDownloadAsRef = useRef(handleDownloadAs);

    useEffect(() => {
        handleNewFileRef.current = handleNewFile;
        handleOpenFileRef.current = handleOpenFile;
        handleOpenFolderRef.current = handleOpenFolder;
        handleSaveRef.current = handleSave;
        handleSaveAsRef.current = handleSaveAs;
        handleDownloadRef.current = handleDownload;
        handleDownloadAsRef.current = handleDownloadAs;
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                handleNewFileRef.current();
            } else if (event.ctrlKey && event.key === 'o') {
                event.preventDefault();
                handleOpenFileRef.current();
            } else if (event.ctrlKey && event.shiftKey && event.key === 'O') {
                event.preventDefault();
                handleOpenFolderRef.current();
            } else if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                handleSaveAsRef.current();
            } else if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                handleSaveRef.current();
            } else if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                handleDownloadAsRef.current();
            } else if (event.ctrlKey && event.key === 'd') {
                event.preventDefault();
                handleDownloadRef.current();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {popupOpen && <FileRenamePopup
                label={label}
                open={popupOpen}
                setOpen={setPopupOpen}
                onEnter={updatePathName}
            />}
            <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json,.csv"
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />
            <MenuButtonTemplate title="File" underlineRef={underlineRef} width={44}>
                <MenuKeybindButton name="New File" keybind="Ctrl+P" callback={handleNewFile} />
                <Section />
                <MenuKeybindButton name="Open File" keybind="Ctrl+O" callback={handleOpenFile} />
                {'showDirectoryPicker' in window && <MenuKeybindButton name="Open Folder" keybind="Ctrl+⇧O" callback={handleOpenFolder} />}
                <Section />
                <MenuKeybindButton name="Save" keybind="Ctrl+S" callback={handleSave} disabled={!canSaveToDisk}
                    tooltip={canSaveToDisk ? undefined : "Your browser doesn't support file writing. Use Download instead."} />
                <MenuKeybindButton name="Save As" keybind="Ctrl+⇧S" callback={handleSaveAs} disabled={!canSaveToDisk}
                    tooltip={canSaveToDisk ? undefined : "Your browser doesn't support file writing. Use Download As instead."} />
                <Section />
                <MenuKeybindButton name="Download" keybind="Ctrl+D" callback={handleDownload} />
                <MenuKeybindButton name="Download As" keybind="Ctrl+⇧D" callback={handleDownloadAs} />
            </MenuButtonTemplate>
        </>
    );
}
