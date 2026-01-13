/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_FORMAT, type FileFormat } from "../../hooks/useFileFormat";
import { mergeDeep } from "../Util";

export const undoHistory: Partial<FileFormat>[] = [DEFAULT_FORMAT];

export const redoHistory: Partial<FileFormat>[] = [];

export function AddToUndoHistory(snapshot: Partial<FileFormat>) {
    console.log(snapshot);
    
    const previousState = undoHistory[undoHistory.length - 1] || {};

    const fullState = mergeDeep(previousState, snapshot);

    undoHistory.push(fullState);
    redoHistory.length = 0;
}