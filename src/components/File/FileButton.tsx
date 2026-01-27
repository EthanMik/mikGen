import { useEffect, useRef, useState } from "react";
import { usePath } from "../../hooks/usePath";
import FileRenamePopup from "./FileRenamePopup";
import { useGetFileFormat } from "../../hooks/useGetFileFormat";
import { useFormat } from "../../hooks/useFormat";
import { useFileFormat, type FileFormat } from "../../hooks/useFileFormat";
import { INITIAL_DEFAULTS } from "../../core/DefaultConstants";
import { defaultRobotConstants } from "../../core/Robot";
import { useField } from "../../hooks/useField";

const SAVED_SNAPSHOT_KEY = "savedSnapshot";

function getSaveableSnapshot(fileFormat: FileFormat): string {
    const stripped = {
        ...fileFormat,
        path: {
            ...fileFormat.path,
            segments: fileFormat.path.segments.map(segment => ({
                id: segment.id,
                groupId: segment.groupId,
                disabled: segment.disabled,
                locked: segment.locked,
                visible: segment.visible,
                pose: segment.pose,
                command: segment.command,
                format: segment.format,
                kind: segment.kind,
                constants: segment.constants,
            }))
        }
    };
    return JSON.stringify(stripped);
}

export default function FileButton() {
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const renameResolveRef = useRef<((name: string | null) => void) | null>(null);
    const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

    const [ isOpen, setOpen ] = useState(false);
    const [ popupOpen, setPopupOpen ] = useState(false);
    const [ path, setPath ] = usePath();
    const [ field, ] = useField();
    const [ format, ] = useFormat();
    const [ , setFileFormat ] = useFileFormat();
    const [ isSaved, setIsSaved ] = useState(() => {
        const saved = localStorage.getItem(SAVED_SNAPSHOT_KEY);
        return saved !== null;
    });
    const savedSnapshotRef = useRef<string | null>(localStorage.getItem(SAVED_SNAPSHOT_KEY));

    const fileText = useGetFileFormat();

    const [ label, setLabel ] = useState("");

    const getFileName = (fileName = ""): string => {
        const pathName = fileName === "" ? path.name : fileName;
        if (pathName === "" || pathName === null || pathName === undefined) {
            return format.slice(0, 3) + "Path";
        }

        return pathName;
    }

    useEffect(() => {
        const currentSnapshot = getSaveableSnapshot(fileText);
        if (savedSnapshotRef.current === null) {
            savedSnapshotRef.current = currentSnapshot;
            localStorage.setItem(SAVED_SNAPSHOT_KEY, currentSnapshot);
        }
        setIsSaved(currentSnapshot === savedSnapshotRef.current);
    }, [fileText])

    const updatePathName = (name: string) => {
        setPath(prev => ({
            ...prev,
            name: name
        }));

        renameResolveRef.current?.(name);
        renameResolveRef.current = null;
    } 

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

    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }

    const handleNewFile = () => {
        if (!isSaved) {
            handleSaveAs();
        }

        setFileFormat({
                format: format,
                field: field,
                defaults: INITIAL_DEFAULTS[format],
                path: { segments: [], name: "" },
                robot: defaultRobotConstants,
                commands: []
            }
        );
        fileHandleRef.current = null;
        setOpen(false);
        savedSnapshotRef.current = null;
        localStorage.removeItem(SAVED_SNAPSHOT_KEY);
    }

    const handleOpenFile = async () => {
        setOpen(false);
        
        if (!('showOpenFilePicker' in window)) {
            console.error('File System Access API not supported');
            fileInputRef.current?.click();
            return;
        }

        try {
            const [handle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Text Files',
                        accept: {
                            'text/plain': ['.txt'],
                        },
                    },
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json'],
                        },
                    },
                    {
                        description: 'CSV Files',
                        accept: {
                            'text/csv': ['.csv'],
                        },
                    },
                ],
                multiple: false,
            });

            fileHandleRef.current = handle;

            const file = await handle.getFile();
            const content = await file.text();
            
            const fileName = handle.name.replace(/\.[^/.]+$/, "");
            const parsed = JSON.parse(content) as FileFormat;
            
            setFileFormat({
                ...parsed,
                path: {
                    ...parsed.path,
                    name: fileName
                }
            });
            savedSnapshotRef.current = null;
            localStorage.removeItem(SAVED_SNAPSHOT_KEY);

        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error opening file:', error);
            }
        }
        
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content) as FileFormat;
                
                setFileFormat({
                    ...parsed,
                    path: {
                        ...parsed.path,
                        name: fileName
                    }
                });
            };
            reader.readAsText(file);

            fileHandleRef.current = null;
        }
        
        event.target.value = '';
    }

    const handleSave = async () => {
        setOpen(false);
        
        if (!('showSaveFilePicker' in window)) {
            console.error('File System Access API not supported');
            handleDownload();
            return;
        }

        try {
            if (fileHandleRef.current) {
                const writable = await fileHandleRef.current.createWritable();
                await writable.write(JSON.stringify(fileText));
                await writable.close();
                const snapshot = getSaveableSnapshot(fileText);
                savedSnapshotRef.current = snapshot;
                localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
                setIsSaved(true);
            } else {
                await handleSaveAs();
            }
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }

    const handleSaveAs = async () => {
        setOpen(false);
        setLabel("Save As:");
        if (!('showSaveFilePicker' in window)) {
            console.error('File System Access API not supported');
            handleDownloadAs();
            return;
        }

        try {
            const name = await requestFileName();
            if (name === null || name === "") return;
            
            const handle = await window.showSaveFilePicker({
                suggestedName: `${name}.txt`,
                types: [
                    {
                        description: 'Text Files',
                        accept: {
                            'text/plain': ['.txt'],
                        },
                    },
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json'],
                        },
                    },
                ],
            });

            fileHandleRef.current = handle;

            const savedFileName = handle.name.replace(/\.[^/.]+$/, "");

            setPath(prev => ({
                ...prev,
                name: savedFileName
            }));

            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(fileText));
            await writable.close();

            const snapshot = getSaveableSnapshot(fileText);
            savedSnapshotRef.current = snapshot;
            localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
            setIsSaved(true);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error saving file:', error);
            }
        }
    }

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
        downloadText(JSON.stringify(fileText), `${getFileName()}.txt`)
        setOpen(false);
        const snapshot = getSaveableSnapshot(fileText);
        savedSnapshotRef.current = snapshot;
        localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
        setIsSaved(true);
    }

    const handleDownloadAs = async () => {
        setOpen(false);
        setLabel("Download As:");
        const name = await requestFileName();
        if (name === null) return;

        downloadText(JSON.stringify(fileText), `${getFileName(name)}.txt`);
        const snapshot = getSaveableSnapshot(fileText);
        savedSnapshotRef.current = snapshot;
        localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
        setIsSaved(true);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }

    }, []);

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
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div
            ref={menuRef}
            className={`relative ${
                isOpen ? "bg-medgray_hover" : "bg-none"
            } hover:bg-medgray_hover rounded-sm`}
        >
            <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
                <span className={`text-[20px] ${!isSaved ? "underline" : ""}`}>File</span>
            </button>

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

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-55 z-40
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2">
                        <div className="flex flex-col">

                            <button 
                                onClick={handleNewFile}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">New File</span>
                                <span className="text-lightgray text-[14px]">Ctrl+P</span>
                            </button>
                            
                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>

                            <button 
                                onClick={handleOpenFile}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Open File</span>
                                <span className="text-lightgray text-[14px]">Ctrl+O</span>
                            </button>

                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>

                            <button
                                onClick={handleSave}
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Save</span>
                                <span className="text-lightgray text-[14px]">Ctrl+S</span>
                            </button>

                            <button
                                onClick={handleSaveAs} 
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Save As</span>
                                <span className="text-lightgray text-[14px]">Shift+Ctrl+S</span>
                            </button>

                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>

                            <button
                                onClick={handleDownload}
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Download</span>
                                <span className="text-lightgray text-[14px]">Ctrl+D</span>
                            </button>

                            <button 
                                onClick={handleDownloadAs} 
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Download As</span>
                                <span className="text-lightgray text-[14px]">Shift+Ctrl+D</span>
                            </button>
                        </div>
        
                    </div>
                </div>
            )}
        </div>
    )
}