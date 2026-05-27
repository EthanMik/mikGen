import { useState, useEffect, useRef } from "react";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import fileIcon from "../../assets/file.svg";
import folderIcon from "../../assets/folder.svg";
import back from "../../assets/back.svg";
import { loadFromHandle, fileSaveStore, fileHandleStore, dirHandleStore } from "../../core/FileUtils";
import refresh from "../../assets/cw.svg";
import check from "../../assets/check.svg"

type Entry = {
    name: string;
    kind: "file" | "directory";
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
};

async function readDirEntries(handle: FileSystemDirectoryHandle): Promise<Entry[]> {
    const result: Entry[] = [];
    // @ts-expect-error entries() not in all TS DOM libs
    for await (const [name, h] of handle.entries()) {
        const kind = h.kind as "file" | "directory";
        if (kind === "file") {
            const ext = name.slice(name.lastIndexOf("."));
            if (!(ext === ".txt")) continue;
        }
        result.push({ name, kind, handle: h });
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
    onEnterFolder: (handle: FileSystemDirectoryHandle) => void;
    onSelectFile: (handle: FileSystemFileHandle) => void;
};

function FolderEntry({ entry, isSelected, onEnterFolder, onSelectFile }: FolderEntryProps) {
    return (
        <button
            className="flex flex-row px-2 py-0.5 items-center justify-between cursor-pointer rounded-sm w-full text-left hover:bg-medlightgray"
            onClick={() => {
                if (entry.kind === "directory") {
                    onEnterFolder(entry.handle as FileSystemDirectoryHandle);
                } else {
                    onSelectFile(entry.handle as FileSystemFileHandle);
                }
            }}
        >
            <span className="text-[13px] truncate min-w-0">{entry.name}</span>
            <div className="flex items-center shrink-0 ml-1 gap-1">
                {isSelected && <img src={check} className="w-3 h-3" />}
                <img src={entry.kind === "file" ? fileIcon : folderIcon} className="w-3.5 h-3.5" />
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
        if (!prev) return;
        const result = await readDirEntries(prev);
        setHistory(h => h.slice(0, -1));
        setDirHandle(prev);
        setEntries(result);
    };

    const refreshDirRef = useRef(refreshDir);
    useEffect(() => { refreshDirRef.current = refreshDir; });

    const backButton = {
        icon: back,
        visible: history.length > 0,
        onClick: goBack,
        tooltip: "Go Back"
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
                        onEnterFolder={h => openDir(h)}
                        onSelectFile={loadFromHandle}
                    />
                ))
            }
        </ConfigButtonTemplate>
    );
}
