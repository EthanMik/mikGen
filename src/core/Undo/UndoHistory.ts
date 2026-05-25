import { createStore } from "../Store";
import { fileFormatStore } from "../../hooks/useFileFormat";
import type { FileFormat } from "../../hooks/useFileFormat";

const MAX_UNDO_HISTORY = 300;

export const undoHistory = createStore<FileFormat[]>([fileFormatStore.getState()]);
export const redoHistory = createStore<FileFormat[]>([]);

export function saveSnapshot() {
    const snapshot = fileFormatStore.getState();
    const current = undoHistory.getState();
    undoHistory.setState([...current, snapshot].slice(-MAX_UNDO_HISTORY));
    redoHistory.setState([]);
    // console.log(snapshot);
    localStorage.setItem("appState", JSON.stringify(snapshot));
}
