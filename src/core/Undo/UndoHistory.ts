/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_FORMAT, type FileFormat } from "../../hooks/useFileFormat";
import { mergeDeep } from "../Util";

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;

const MAX_UNDO_HISTORY = 50;

export const undoHistory: Partial<FileFormat>[] = [initialData];
export const redoHistory: Partial<FileFormat>[] = [];

export function AddToUndoHistory(snapshot: Partial<FileFormat>) {
    console.log(snapshot);
    const previousState = undoHistory[undoHistory.length - 1] || {};
    const fullState = mergeDeep(previousState, snapshot);
    undoHistory.push(fullState);
    
    while (undoHistory.length > MAX_UNDO_HISTORY) {
        undoHistory.shift();
    }
    
    redoHistory.length = 0;
}