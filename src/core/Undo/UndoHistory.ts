import { DEFAULT_FORMAT, type FileFormat } from "../../hooks/useFileFormat";

// export const undoHistory: Partial<FileFormat>[] = new Proxy([DEFAULT_FORMAT], {
//   set(target, prop, value) {
//     console.log("[undoHistory changed]", String(prop), value, "len:", target.length);
//     console.trace();
//     target[prop] = value;
//     return true;
//   }
// });
export const undoHistory: Partial<FileFormat>[] = [DEFAULT_FORMAT];

export const redoHistory: Partial<FileFormat>[] = [];

export function AddToUndoHistory(snapshot: Partial<FileFormat>) {
    console.log(snapshot);
    
    const previousState = undoHistory[undoHistory.length - 1];
    const fullState = { ...previousState, ...snapshot };
    
    undoHistory.push(fullState)
    redoHistory.length = 0; 
}