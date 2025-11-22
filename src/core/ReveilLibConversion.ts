import pathFormat from "../formats/ReveilLibPathFormat"
import type { Segment } from "./Path";

export function convertPath(): string[] {
    const lines = pathFormat.split(/\r?\n/);
    const fullLines = lines.filter(line => line.trim().length > 0);

    return fullLines;
}