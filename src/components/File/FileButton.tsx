import { useEffect, useRef, useState } from "react";
import { usePath } from "../../hooks/usePath";
import FileRenamePopup from "./FileRenamePopup";
import { useGetFileFormat } from "../../hooks/useGetFileFormat";
import { useFormat } from "../../hooks/useFormat";
import { useFileFormat, type FileFormat } from "../../hooks/useFileFormat";
import { INITIAL_DEFAULTS } from "../../core/DefaultConstants";
import { defaultRobotConstants } from "../../core/Robot";
import { useField } from "../../hooks/useField";


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
    
    const fileText = useGetFileFormat();

    const [ label, setLabel ] = useState("");

    const getFileName = (fileName = ""): string => {
        const pathName = fileName === "" ? path.name : fileName;
        if (pathName === "" || pathName === null || pathName === undefined) {
            return format.slice(0, 3) + "Path";
        }

        return pathName;
    }   

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

    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }

    const handleNewFile = () => {
        setFileFormat({
                format: format,
                field: field,
                defaults: INITIAL_DEFAULTS[format],
                path: { segments: [], name: "" },
                robot: defaultRobotConstants,
                commands: []
            }
        );
        // Clear the file handle when creating a new file
        fileHandleRef.current = null;
        setOpen(false);
    }

    const handleOpenFile = async () => {
        setOpen(false);
        
        // Check if File System Access API is supported
        if (!('showOpenFilePicker' in window)) {
            console.error('File System Access API not supported');
            // Fallback to traditional file input
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

            // Store the file handle for future saves
            fileHandleRef.current = handle;

            const file = await handle.getFile();
            const content = await file.text();
            setFileFormat(JSON.parse(content) as FileFormat);
        } catch (error) {
            // User cancelled the open dialog or other error
            if ((error as Error).name !== 'AbortError') {
                console.error('Error opening file:', error);
            }
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setFileFormat(JSON.parse(content) as FileFormat);
            };
            reader.readAsText(file);
            
            // Clear file handle since we used the fallback method
            fileHandleRef.current = null;
        }
    }

    const handleSave = async () => {
        setOpen(false);
        
        // Check if File System Access API is supported
        if (!('showSaveFilePicker' in window)) {
            console.error('File System Access API not supported');
            // Fallback to download
            handleDownload();
            return;
        }

        try {
            // If we already have a file handle, use it
            if (fileHandleRef.current) {
                const writable = await fileHandleRef.current.createWritable();
                await writable.write(JSON.stringify(fileText));
                await writable.close();
            } else {
                // If no file handle exists, use Save As
                await handleSaveAs();
            }
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }

    const handleSaveAs = async () => {
        setOpen(false);
        setLabel("Save As:");
        // Check if File System Access API is supported
        if (!('showSaveFilePicker' in window)) {
            console.error('File System Access API not supported');
            // Fallback to download with rename
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

            // Store the file handle for future saves
            fileHandleRef.current = handle;
            
            // Extract the actual filename from the handle (without extension)
            const savedFileName = handle.name.replace(/\.[^/.]+$/, "");
            
            // Update the path with the saved filename
            setPath(prev => ({
                ...prev,
                name: savedFileName
            }));

            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(fileText));
            await writable.close();
        } catch (error) {
            // User cancelled the save dialog or other error
            if ((error as Error).name !== 'AbortError') {
                console.error('Error saving file:', error);
            }
        }
    }

    // Downloading text
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
    }

    const handleDownloadAs = async () => {
        setOpen(false);
        setLabel("Download As:");
        const name = await requestFileName();
        if (name === null) return; 
        
        downloadText(JSON.stringify(fileText), `${getFileName(name)}.txt`);
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                handleNewFile();
            } else if (event.ctrlKey && event.key === 'o') {
                event.preventDefault();
                handleOpenFile();
            } else if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                handleSaveAs();
            } else if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                handleSave();
            } else if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                handleDownloadAs();
            } else if (event.ctrlKey && event.key === 'd') {
                event.preventDefault();
                handleDownload();
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
                <span className="text-[20px]">File</span>
            </button>

        {popupOpen && <FileRenamePopup 
            label={label}
            open={popupOpen}
            setOpen={setPopupOpen}
            onEnter={updatePathName}
        />}

            {/* Hidden file input for opening files */}
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