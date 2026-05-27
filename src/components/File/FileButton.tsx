import { useEffect, useRef, useState } from "react";
import FileRenamePopup from "./FileRenamePopup";
import { usePath, useFileFormat, fileFormatStore, type FileFormat } from "../../hooks/useFileFormat";
import { defaultRobotConstants } from "../../core/Robot";
import { saveSnapshot, undoHistory, fileUndosStore } from "../../core/Undo/UndoHistory";
import { FORMAT_REGISTRY, mergeFormatDef, type FormatDef } from "../../simulation/FormatDefinition";
import { deserializeFile, loadFromHandle, fileSaveStore, fileOpLock, fileHandleStore, dirHandleStore, serializeFile } from "../../core/FileUtils";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";

export default function FileButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const renameResolveRef = useRef<((name: string | null) => void) | null>(null);
    const underlineRef = useRef<((val: boolean) => void) | undefined>(undefined);

    const [popupOpen, setPopupOpen] = useState(false);
    const [path, setPath] = usePath();
    const [fileFormat] = useFileFormat();
    const { format, field } = fileFormat;
    const [isSaved, setIsSaved] = useState(true);
    const skipSave = useRef(true);

    const historyLength = undoHistory.useSelector(h => h.length);
    const fileText = fileFormat;
    const [label, setLabel] = useState("");

    useEffect(() => {
        underlineRef.current?.(!isSaved);
    }, [isSaved]);

    const getFileName = (fileName = ""): string => {
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
        if (fileUndosStore.getState() > 1) handleSaveAs();

        const newFileFormat = {
            format,
            field,
            formatDef: FORMAT_REGISTRY[format as keyof typeof FORMAT_REGISTRY],
            path: { segments: [], name: "" },
            robot: defaultRobotConstants,
        } as FileFormat;

        fileFormatStore.setState(newFileFormat);
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

        fileOpLock.acquire();
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
        } finally {
            fileOpLock.release();
        }
    };

    const handleOpenFolder = async () => {
        if (!('showDirectoryPicker' in window)) return;
        if (fileOpLock.isActive()) return;
        fileOpLock.acquire();
        try {
            // @ts-expect-error showDirectoryPicker not in all TS DOM libs
            const handle = await window.showDirectoryPicker({ mode: "read" });
            dirHandleStore.setState(handle);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error opening folder:', error);
            }
        } finally {
            fileOpLock.release();
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (fileUndosStore.getState() > 1) {
                if (!window.confirm("You have unsaved changes. Discard and load new file?")) {
                    event.target.value = '';
                    return;
                }
            }
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const parsed = deserializeFile(content);
                fileFormatStore.setState({
                    ...parsed,
                    formatDef: mergeFormatDef(FORMAT_REGISTRY[parsed.format] as FormatDef<typeof parsed.format>, parsed.formatDef),
                    path: { ...parsed.path, name: fileName },
                });
                saveSnapshot();
                fileUndosStore.setState(0);
            };
            reader.readAsText(file);
            fileHandleStore.setState(null);
        }
        event.target.value = '';
        fileHandleStore.setState(null);
        setIsSaved(true);
        skipSave.current = true;
    };

    const handleSave = async () => {
        if (!('showSaveFilePicker' in window)) {
            handleDownload();
            return;
        }
        try {
            const handle = fileHandleStore.getState();
            if (handle) {
                const writable = await handle.createWritable();
                await writable.write(serializeFile(fileText));
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
        setLabel("Save As:");
        if (!('showSaveFilePicker' in window)) {
            handleDownloadAs();
            return;
        }
        fileOpLock.acquire();
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
            await writable.write(serializeFile(fileText));
            await writable.close();
            setIsSaved(true);
            fileUndosStore.setState(0);
            fileSaveStore.setState(n => n + 1);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error saving file:', error);
            }
        } finally {
            fileOpLock.release();
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
        downloadText(serializeFile(fileText), `${getFileName()}.txt`);
        setIsSaved(true);
    };

    const handleDownloadAs = async () => {
        setLabel("Download As:");
        const name = await requestFileName();
        if (name === null) return;
        downloadText(serializeFile(fileText), `${getFileName(name)}.txt`);
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
            <MenuButtonTemplate title="File" underlineRef={underlineRef}>
                <MenuKeybindButton name="New File" keybind="Ctrl+P" callback={handleNewFile} />
                <Section />
                <MenuKeybindButton name="Open File" keybind="Ctrl+O" callback={handleOpenFile} />
                <MenuKeybindButton name="Open Folder" keybind="Ctrl+⇧O" callback={handleOpenFolder} />
                <Section />
                <MenuKeybindButton name="Save" keybind="Ctrl+S" callback={handleSave} />
                <MenuKeybindButton name="Save As" keybind="Ctrl+⇧S" callback={handleSaveAs} />
                <Section />
                <MenuKeybindButton name="Download" keybind="Ctrl+D" callback={handleDownload} />
                <MenuKeybindButton name="Download As" keybind="Ctrl+⇧D" callback={handleDownloadAs} />
            </MenuButtonTemplate>
        </>
    );
}
