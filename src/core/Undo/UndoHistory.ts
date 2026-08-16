import { createStore } from "../Store";
import { fileFormatStore } from "../../hooks/useFileFormat";
import { serializeFile, type FileFormat } from "../FileSchema";

const MAX_UNDO_HISTORY = 300;

export const undoHistory = createStore<FileFormat[]>([fileFormatStore.getState()]);
export const redoHistory = createStore<FileFormat[]>([]);
export const fileUndosStore = createStore(0);

export function saveSnapshot() {
    const snapshot = fileFormatStore.getState();
    const current = undoHistory.getState();
    undoHistory.setState([...current, snapshot].slice(-MAX_UNDO_HISTORY));
    redoHistory.setState([]);
    fileUndosStore.setState(n => n + 1);
    // Same bytes as an on-disk save, so the autosave and a real file are read back by one loader
    localStorage.setItem("appState", serializeFile(snapshot));
}
