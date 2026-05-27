import { useState, useEffect } from "react";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import fileIcon from "../../assets/file.svg";
import folderIcon from "../../assets/folder.svg";
import back from "../../assets/back.svg";
import { loadFromHandle, fileSaveStore, fileOpLock } from "../../core/FileUtils";
import refresh from "../../assets/cw.svg";

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
    onEnterFolder: (handle: FileSystemDirectoryHandle) => void;
    onSelectFile: (handle: FileSystemFileHandle) => void;
};

function FolderEntry({ entry, onEnterFolder, onSelectFile }: FolderEntryProps) {
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
            <span className="text-[13px] truncate">{entry.name}</span>
            <img src={entry.kind === "file" ? fileIcon : folderIcon} className="w-3.5 h-3.5 shrink-0 ml-1" />
        </button>
    );
}

type FolderButtonProps = {
    fileName: string;
};

export default function FolderButton({ fileName }: FolderButtonProps) {
    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [history, setHistory] = useState<FileSystemDirectoryHandle[]>([]);
    const saveCount = fileSaveStore.useStore();

    const refreshDir = () => {
        if (!dirHandle) return;
        readDirEntries(dirHandle).then(setEntries);
    }

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

    const handleOpen = async () => {
        if (dirHandle) return;
        if (fileOpLock.isActive()) return;
        fileOpLock.acquire();
        try {
            // @ts-expect-error showDirectoryPicker not in all TS DOM libs
            const handle = await window.showDirectoryPicker({ mode: "read" });
            await openDir(handle, false);
        } catch (e) {
            if ((e as Error).name !== "AbortError") console.error(e);
        } finally {
            fileOpLock.release();
        }
    };

    const backButton = {
        icon: back,
        visible: history.length > 0,
        onClick: goBack,
        tooltip: "Go Back"
    }

    const refreshButton = {
        icon: refresh,
        visible: true,
        onClick: refreshDir, 
        tooltip: "Refresh Folder"
    }

    return (
        <ConfigButtonTemplate title={dirHandle?.name ?? fileName} iconButtons={[backButton, refreshButton]} onOpen={handleOpen}>
            {entries.length === 0
                ? <span className="text-[12px] opacity-40 px-1">Empty folder</span>
                : entries.map(entry => (
                    <FolderEntry
                        key={entry.name}
                        entry={entry}
                        onEnterFolder={h => openDir(h)}
                        onSelectFile={loadFromHandle}
                    />
                ))
            }
        </ConfigButtonTemplate>
    );
}
