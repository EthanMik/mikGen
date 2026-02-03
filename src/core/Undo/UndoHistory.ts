/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FileFormat } from "../../hooks/useFileFormat";
import { createStore } from "../Store";
import { mergeDeep } from "../Util";

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : {};

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