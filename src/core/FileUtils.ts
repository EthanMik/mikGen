import { fileFormatStore, type FileFormat, DEFAULT_FORMAT } from "../hooks/useFileFormat";
import { createStore } from "./Store";
import { FORMAT_REGISTRY, mergeFormatDef, getDefaultConstants, stripFormatDefForSave, type Format, type FormatDef, type SegmentKind } from "../simulation/FormatDefinition";
import { saveSnapshot, fileUndosStore } from "./Undo/UndoHistory";
import { defaultRobotConstants, type RobotConstants } from "./Robot";
import type { Path } from "./Types/Path";

export const fileSaveStore = createStore(0);
export const fileHandleStore = createStore<FileSystemFileHandle | null>(null);
export const dirHandleStore = createStore<FileSystemDirectoryHandle | null>(null);

export const FILE_VERSION = "mikGen v1.0.0";

export function serializeFile(fileFormat: FileFormat): string {
    const stripped = { ...fileFormat, formatDef: stripFormatDefForSave(fileFormat.formatDef) };
    return FILE_VERSION + "\n" + JSON.stringify(stripped);
}

function handleFileConversion(content: string): FileFormat {
    let raw: unknown;
    try {
        raw = JSON.parse(content);
    } catch {
        alert("File loading failed");
        throw new Error("Invalid JSON in legacy file");
    }

    if (!raw || typeof raw !== "object") throw new Error("Expected object");
    const p = raw as Record<string, unknown>;

    if (typeof p.format !== "string" || !(p.format in FORMAT_REGISTRY)) {
        alert("File loading failed");
        throw new Error(`Unknown format: ${p.format}`);
    }
    const format = p.format as Format;

    const rawPath = p.path && typeof p.path === "object" ? p.path as Record<string, unknown> : null;
    const rawSegments = rawPath && Array.isArray(rawPath.segments) ? rawPath.segments as unknown[] : [];
    const segments = rawSegments.map((seg) => {
        if (!seg || typeof seg !== "object") return seg;
        const s = seg as Record<string, unknown>;
        const kind = s.kind as SegmentKind;
        return { ...s, format, kind, constants: getDefaultConstants(undefined, format, kind) };
    });

    if (segments.length > 0 && (segments[0] as Record<string, unknown>)?.kind !== "start") {
        const s = segments[0] as Record<string, unknown>;
        segments[0] = { ...s, kind: "start", constants: getDefaultConstants(undefined, format, "start") };
    }

    const path = rawPath ? { ...(rawPath as object), segments } as Path : DEFAULT_FORMAT.path;
    return { ...DEFAULT_FORMAT, format, formatDef: FORMAT_REGISTRY[format] as FormatDef<Format>, path };
}

function validateRobot(raw: unknown): RobotConstants {
    if (!raw || typeof raw !== "object") return defaultRobotConstants;
    const robot = raw as Record<string, unknown>;
    for (const [key, def] of Object.entries(defaultRobotConstants)) {
        const value = robot[key];
        if (typeof value !== typeof def) return defaultRobotConstants;
        if (typeof value === "number" && !Number.isFinite(value)) return defaultRobotConstants;
    }
    return raw as RobotConstants;
}

export function deserializeFile(content: string): FileFormat {
    const newline = content.indexOf("\n");
    const firstLine = newline === -1 ? content : content.slice(0, newline);
    if (firstLine.trim() !== FILE_VERSION) {
        return handleFileConversion(content);
    }
    const parsed = JSON.parse(content.slice(newline + 1)) as FileFormat;
    return { ...parsed, robot: validateRobot(parsed.robot) };
}

export async function loadFromHandle(handle: FileSystemFileHandle): Promise<void> {
    if (fileUndosStore.getState() > 1) {
        const currentHandle = fileHandleStore.getState();
        if (currentHandle) {
            const choice = window.confirm("You have unsaved changes. Save before loading?");
            if (choice) {
                const writable = await currentHandle.createWritable();
                await writable.write(serializeFile(fileFormatStore.getState()));
                await writable.close();
                fileSaveStore.setState(n => n + 1);
            } else if (!window.confirm("Discard unsaved changes and load new file?")) {
                return;
            }
        } else {
            if (!window.confirm("You have unsaved changes. Discard and load new file?")) return;
        }
    }
    const file = await handle.getFile();
    const content = await file.text();
    const fileName = handle.name.replace(/\.[^/.]+$/, "");
    const parsed = deserializeFile(content);
    fileFormatStore.setState({
        ...parsed,
        formatDef: mergeFormatDef(FORMAT_REGISTRY[parsed.format] as FormatDef<typeof parsed.format>, parsed.formatDef),
        path: { ...parsed.path, name: fileName },
    });
    saveSnapshot();
    fileUndosStore.setState(0);
    fileHandleStore.setState(handle);
}

export async function loadFileFromEvent(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        const file = event.target.files?.[0];
        if (file) {
            if (fileUndosStore.getState() > 1) {
                if (!window.confirm("You have unsaved changes. Discard and load new file?")) {
                    event.target.value = '';
                    return;
                }
            }
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const parsed = deserializeFile(content);
                fileFormatStore.setState({
                    ...parsed,
                    formatDef: mergeFormatDef(FORMAT_REGISTRY[parsed.format] as FormatDef<typeof parsed.format>, parsed.formatDef),
                    path: { ...parsed.path, name: fileName },
                });
                saveSnapshot();
                fileUndosStore.setState(0);
            };
            reader.readAsText(file);
        }
        event.target.value = '';
}