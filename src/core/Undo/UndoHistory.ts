/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_FORMAT, type FileFormat } from "../../hooks/useFileFormat";
import { createStore } from "../Store";
import { mergeDeep } from "../Util";

const saved = localStorage.getItem("appState");
const parsed = saved ? JSON.parse(saved) : {};

const initialData: Partial<FileFormat> = {
  ...parsed,
  path: parsed.path && Array.isArray(parsed.path.segments)
    ? parsed.path
    : DEFAULT_FORMAT.path,
};

const MAX_UNDO_HISTORY = 50;

export const undoHistory = createStore<Partial<FileFormat>[]>([initialData]);
export const redoHistory = createStore<Partial<FileFormat>[]>([]);

export function AddToUndoHistory(snapshot: Partial<FileFormat>) {
    console.log(snapshot);
    const current = undoHistory.getState();
    const previousState = current[current.length - 1] || {};
    const fullState = mergeDeep(previousState, snapshot);

    if (snapshot.defaults !== undefined) {
        fullState.defaults = snapshot.defaults;
    }

    let newHistory = [...current, fullState];
    
    while (newHistory.length > MAX_UNDO_HISTORY) {
        newHistory = newHistory.slice(1);
    }
    
    undoHistory.setState(newHistory);
    redoHistory.setState([]);
}