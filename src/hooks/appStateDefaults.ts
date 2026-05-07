import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import type { Path } from "../core/Types/Path"
import { FORMAT_REGISTRY, type FormatDef } from "../simulation/FormatDefinition"
import type { Format } from "./useFormat"

export type FieldType = "v5-match" | "v5-skills" | "vexu-match" | "empty" | "separator"

export type FileFormat = {
    format: Format,
    field: FieldType,
    formatDef: FormatDef<Format>,
    path: Path,
    robot: RobotConstants
}

export const DEFAULT_FORMAT: FileFormat = {
    format: "mikLib",
    field: "v5-match",
    formatDef: FORMAT_REGISTRY["mikLib"] as FormatDef<Format>,
    path: { segments: [], name: "" },
    robot: defaultRobotConstants,
}

function loadValidatedAppState(): FileFormat {
    const saved = localStorage.getItem("appState");
    if (!saved) return DEFAULT_FORMAT;

    try {
        const parsed = JSON.parse(saved);
        return {
            format: parsed.format ?? DEFAULT_FORMAT.format,
            field: parsed.field ?? DEFAULT_FORMAT.field,
            formatDef: parsed.defaults ?? DEFAULT_FORMAT.formatDef,
            path: (parsed.path && Array.isArray(parsed.path.segments))
                ? parsed.path
                : DEFAULT_FORMAT.path,
            robot: parsed.robot ?? DEFAULT_FORMAT.robot,
        };
    } catch {
        return DEFAULT_FORMAT;
    }
}

export const VALIDATED_APP_STATE = loadValidatedAppState();
