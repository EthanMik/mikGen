import { useState, useEffect, useRef } from "react";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import fileIcon from "../../assets/icons/files/file.svg";
import folderIcon from "../../assets/icons/files/folder.svg";
import back from "../../assets/icons/ui/back.svg";
import { loadFromHandle, fileSaveStore, fileHandleStore, dirHandleStore, loadFromGhostHandle, unloadFromGhostHandle } from "../../core/FileStore";
import refresh from "../../assets/icons/files/refresh.svg";
import check from "../../assets/icons/ui/check.svg";
import eyeOpen from "../../assets/icons/toggles/eye-open.svg";
import eyeClose from "../../assets/icons/toggles/eye-closed.svg";
import { ghostFilesStore } from "../../hooks/useFileFormat";

type Entry = {
    name: string;
    kind: "file" | "directory";
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
};

async function readDirEntries(handle: FileSystemDirectoryHandle): Promise<Entry[]> {
    const result: Entry[] = [];
    for await (const [name, h] of handle.entries()) {
        const kind = h.kind as "file" | "directory";
        if (kind === "file") {
            const ext = name.slice(name.lastIndexOf("."));
            if (!(ext === ".txt")) continue;
        }
        result.push({ name, kind, handle: h as FileSystemFileHandle | FileSystemDirectoryHandle });
    }
    result.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
    return result;
}

type FolderEntryProps = {
    entry: Entry;
    isSelected: boolean;
    isGhostSelected: boolean;
    onEnterFolder: (handle: FileSystemDirectoryHandle) => void;
    onSelectFile: (handle: FileSystemFileHandle) => void;
    onOpenGhostFile: (handle: FileSystemFileHandle) => void;
    onCloseGhostFile: (handle: FileSystemFileHandle) => void;
};

function FolderEntry({ entry, isSelected, isGhostSelected, onEnterFolder, onSelectFile, onOpenGhostFile, onCloseGhostFile }: FolderEntryProps) {

    return (
        <button
            className={`flex flex-row px-2 py-0.5 items-center justify-between rounded-sm w-full 
            text-left bg-medgray hover:brightness-92 ${isSelected ? "bg-medlightgray" : ""}`}
            onClick={() => {
                if (entry.kind === "directory") {
                    onEnterFolder(entry.handle as FileSystemDirectoryHandle);
                } else {
                    onSelectFile(entry.handle as FileSystemFileHandle);
                    onCloseGhostFile(entry.handle as FileSystemFileHandle);
                }
            }}
        >
            <span className="text-[13px] truncate min-w-0">{entry.name}</span>
            <div className="flex items-center shrink-0 ml-1 gap-1">
                <img src={entry.kind === "file" ? fileIcon : folderIcon} className="w-3.5 h-3.5" />
                {(entry.kind === "file" && !isSelected) &&
                    <button className="w-3.5 h-3.5 cursor-pointer" onClick={(e) => {
                        const handle = entry.handle as FileSystemFileHandle;
                        if (isGhostSelected) onCloseGhostFile(handle);
                        else onOpenGhostFile(handle);
                        e.stopPropagation();
                    }}>
                        <img src={isGhostSelected ? eyeOpen : eyeClose} />
                    </button>
                }
                {isSelected && <img src={check} className="w-3.5 h-3.5" />}
            </div>
        </button>
    );
}

type FolderButtonProps = {
    fileName: string;
};

export default function FolderButton({ fileName }: FolderButtonProps) {
    const rootHandle = dirHandleStore.useStore();
    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(rootHandle);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [history, setHistory] = useState<FileSystemDirectoryHandle[]>([]);
    const saveCount = fileSaveStore.useStore();
    const currentHandle = fileHandleStore.useStore();
    const ghostFiles = ghostFilesStore.useStore();

    // Reset navigation whenever the root folder changes
    useEffect(() => {
        setDirHandle(rootHandle);
        setHistory([]);
        if (!rootHandle) setEntries([]);
    }, [rootHandle]);

    const refreshDir = (handle: FileSystemDirectoryHandle | null = dirHandle) => {
        if (!handle) return;
        readDirEntries(handle).then(setEntries);
    };

    useEffect(() => {
        refreshDir();
    }, [saveCount, dirHandle]);

    const openDir = async (handle: FileSystemDirectoryHandle, pushCurrent = true) => {
        const result = await readDirEntries(handle);
        if (pushCurrent && dirHandle) setHistory(prev => [...prev, dirHandle]);
        setDirHandle(handle);
        setEntries(result);
    };

    const goBack = async () => {
        const prev = history[history.length - 1];
        if (!prev) {
            // At the root, going back closes the folder, which unmounts this component
            if (window.confirm("Are you sure you want to close this folder?")) {
                dirHandleStore.setState(null);
            }
            return;
        }
        const result = await readDirEntries(prev);
        setHistory(h => h.slice(0, -1));
        setDirHandle(prev);
        setEntries(result);
    };

    const refreshDirRef = useRef(refreshDir);
    useEffect(() => { refreshDirRef.current = refreshDir; });

    const backButton = {
        icon: back,
        visible: true,
        onClick: goBack,
        tooltip: history.length > 0 ? "Go Back" : "Close Folder"
    };

    const refreshButton = {
        icon: refresh,
        visible: true,
        onClick: () => refreshDirRef.current(),
        tooltip: "Refresh Folder"
    };

    return (
        <ConfigButtonTemplate title={dirHandle?.name ?? fileName} iconButtons={[backButton, refreshButton]}>
            {entries.length === 0
                ? <span className="text-[12px] opacity-40 px-1">Empty folder</span>
                : entries.map(entry => (
                    <FolderEntry
                        key={entry.name}
                        entry={entry}
                        isSelected={entry.kind === "file" && currentHandle?.name === entry.name}
                        isGhostSelected={entry.kind === "file" && ghostFiles.some(g => g.handle?.name === entry.name)}
                        onEnterFolder={h => openDir(h)}
                        onSelectFile={loadFromHandle}
                        onOpenGhostFile={loadFromGhostHandle}
                        onCloseGhostFile={unloadFromGhostHandle}
                    />
                ))
            }
        </ConfigButtonTemplate>
    );
}
