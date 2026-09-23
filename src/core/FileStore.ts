import { createStore } from "./Store";
import { fileFormatStore, ghostFilesStore } from "../hooks/useFileFormat";
import { deserializeToState, serializeFile } from "./FileSchema";
import { saveSnapshot, fileUndosStore } from "./Undo/UndoHistory";
import { get } from "idb-keyval"

/** Bumped on every write, so the folder browser knows to re-read the directory. */
export const fileSaveStore = createStore(0);
export const fileHandleStore = createStore<FileSystemFileHandle | null>(null);
export const dirHandleStore = createStore<FileSystemDirectoryHandle | null>(null);

/** Seeding cannot throw, so the only thing left to report is that the file needed fixing up. */
export function loadContentIntoState(content: string, fileName: string) {
    const repairs: string[] = [];
    fileFormatStore.setState(deserializeToState(content, fileName, repairs));
    if (repairs.length > 0) {
        console.warn(`Repaired "${fileName}":`, repairs);
        alert("Old file detected and repaired. Please re-save.");
    }
    saveSnapshot();
    fileUndosStore.setState(0);
}

/** Shared by the File menu and the folder browser, which opens files by handle directly. */
export async function loadFromHandle(handle: FileSystemFileHandle): Promise<void> {
    if (fileUndosStore.getState() > 1) {
        const currentHandle = fileHandleStore.getState();
        if (currentHandle) {
            if (window.confirm("You have unsaved changes. Save before loading?")) {
                const writable = await currentHandle.createWritable();
                await writable.write(serializeFile(fileFormatStore.getState()));
                await writable.close();
                fileSaveStore.setState(n => n + 1);
            } else if (!window.confirm("Discard unsaved changes and load new file?")) {
                return;
            }
        } else if (!window.confirm("You have unsaved changes. Discard and load new file?")) {
            return;
        }
    }
    const file = await handle.getFile();
    loadContentIntoState(await file.text(), handle.name.replace(/\.[^/.]+$/, ""));
    fileHandleStore.setState(handle);
}

export async function loadFromGhostHandle(handle: FileSystemFileHandle): Promise<void> {
    const file = await handle.getFile();
    const fileName = handle.name.replace(/\.[^/.]+$/, "");
    const fileFormat = deserializeToState(await file.text(), fileName, []);

    for (const g of ghostFilesStore.getState()) {
        if (g.handle && await g.handle.isSameEntry(handle)) {
            ghostFilesStore.setState(prev => prev.map(f => f === g ? { handle, fileFormat } : f));
            return;
        }
    }

    ghostFilesStore.setState(prev => [...prev, { handle, fileFormat }]);
}

export async function unloadFromGhostHandle(handle: FileSystemFileHandle): Promise<void> {
    for (const g of ghostFilesStore.getState()) {
        if (g.handle && await g.handle.isSameEntry(handle)) {
            ghostFilesStore.setState(prev => prev.filter(f => f !== g));
            return;
        }
    }
}

const getSavedHandle = async () => {
    const data = await get('saved');
    if (!(data instanceof FileSystemDirectoryHandle)) return;
    try {
        const first = await data.values().next();
        if (first.done) return;
    } catch {
        return;
    }
    dirHandleStore.setState(data);
}
getSavedHandle();