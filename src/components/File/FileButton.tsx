import { useEffect, useRef, useState } from "react";
import FileRenamePopup from "./FileRenamePopup";
import { usePath, useFileFormat, fileFormatStore, type FileFormat, DEFAULT_FORMAT } from "../../hooks/useFileFormat";
import { defaultRobotConstants } from "../../core/Robot";
import { saveSnapshot, undoHistory } from "../../core/Undo/UndoHistory";
import { fileOpLock } from "../../core/FileOpLock";
import { FORMAT_REGISTRY, mergeFormatDef, stripFormatDefForSave, getDefaultConstants, type Format, type FormatDef, type SegmentKind } from "../../simulation/FormatDefinition";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";
import type { Path } from "../../core/Types/Path";


function handleFileConversion(content: string): FileFormat {
    let raw: unknown;
    try {
        raw = JSON.parse(content);
    } catch {
        alert("File loading failed")
        throw new Error("Invalid JSON in legacy file");
    }

    if (!raw || typeof raw !== 'object') throw new Error("Expected object");
    const p = raw as Record<string, unknown>;

    if (typeof p.format !== 'string' || !(p.format in FORMAT_REGISTRY)) {
        alert("File loading failed")
        throw new Error(`Unknown format: ${p.format}`);
    }
    const format = p.format as Format;

    const rawPath = p.path && typeof p.path === 'object' ? p.path as Record<string, unknown> : null;
    const rawSegments = rawPath && Array.isArray(rawPath.segments) ? rawPath.segments as unknown[] : [];
    const formatDef = FORMAT_REGISTRY[format] as FormatDef<Format>;
    const segments = rawSegments.map((seg) => {
        if (!seg || typeof seg !== 'object') return seg;
        const s = seg as Record<string, unknown>;
        const kind = s.kind as SegmentKind;
        return { ...s, format, kind, constants: getDefaultConstants(undefined, format, kind) };
    });

    if (segments.length > 0 && (segments[0] as Record<string, unknown>)?.kind !== 'start') {
        const s = segments[0] as Record<string, unknown>;
        segments[0] = { ...s, kind: 'start', constants: getDefaultConstants(undefined, format, 'start') };
    }

    const path = rawPath ? { ...(rawPath as object), segments } as Path : DEFAULT_FORMAT.path;

    return { ...DEFAULT_FORMAT, format, formatDef, path };
}


const FILE_VERSION = "mikGen v1.0.0";

function serializeFile(fileFormat: FileFormat): string {
    const stripped = { ...fileFormat, formatDef: stripFormatDefForSave(fileFormat.formatDef) };
    return FILE_VERSION + "\n" + JSON.stringify(stripped);
}

function deserializeFile(content: string): FileFormat {
    const newline = content.indexOf("\n");
    const firstLine = newline === -1 ? content : content.slice(0, newline);
    if (firstLine.trim() !== FILE_VERSION) {
        return handleFileConversion(content);
    }
    return JSON.parse(content.slice(newline + 1)) as FileFormat;
}

export default function FileButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const renameResolveRef = useRef<((name: string | null) => void) | null>(null);
    const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
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
        if (!isSaved) handleSaveAs();

        const newFileFormat = {
            format,
            field,
            formatDef: FORMAT_REGISTRY[format as keyof typeof FORMAT_REGISTRY],
            path: { segments: [], name: "" },
            robot: defaultRobotConstants,
        } as FileFormat;

        fileFormatStore.setState(newFileFormat);
        saveSnapshot();
        fileHandleRef.current = null;
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

            fileHandleRef.current = handle;

            const file = await handle.getFile();
            const content = await file.text();
            const fileName = handle.name.replace(/\.[^/.]+$/, "");
            const parsed = deserializeFile(content);

            fileFormatStore.setState({
                ...parsed,
                formatDef: mergeFormatDef(FORMAT_REGISTRY[parsed.format] as FormatDef<typeof parsed.format>, parsed.formatDef),
                path: { ...parsed.path, name: fileName },
            });
            saveSnapshot();
            setIsSaved(true);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error opening file:', error);
            }
        } finally {
            fileOpLock.release();
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
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
            };
            reader.readAsText(file);
            fileHandleRef.current = null;
        }
        event.target.value = '';
        setIsSaved(true);
        skipSave.current = true;
    };

    const handleSave = async () => {
        if (!('showSaveFilePicker' in window)) {
            handleDownload();
            return;
        }
        try {
            if (fileHandleRef.current) {
                const writable = await fileHandleRef.current.createWritable();
                await writable.write(serializeFile(fileText));
                await writable.close();
                setIsSaved(true);
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

            fileHandleRef.current = handle;
            const savedFileName = handle.name.replace(/\.[^/.]+$/, "");
            setPath(prev => ({ ...prev, name: savedFileName }));

            const writable = await handle.createWritable();
            await writable.write(serializeFile(fileText));
            await writable.close();
            setIsSaved(true);
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
    const handleSaveRef = useRef(handleSave);
    const handleSaveAsRef = useRef(handleSaveAs);
    const handleDownloadRef = useRef(handleDownload);
    const handleDownloadAsRef = useRef(handleDownloadAs);

    useEffect(() => {
        handleNewFileRef.current = handleNewFile;
        handleOpenFileRef.current = handleOpenFile;
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
