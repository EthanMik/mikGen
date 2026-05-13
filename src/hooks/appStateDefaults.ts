import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import type { Path } from "../core/Types/Path"
import { FORMAT_REGISTRY, mergeFormatDef, type FormatDef } from "../simulation/FormatDefinition"
import type { Format } from "../simulation/FormatDefinition"

export type FieldType = "v5-match" | "v5-skills" | "vexu-match" | "empty" | "separator"

export type FileFormat = {
    format: Format,
    field: FieldType,
    formatDef: FormatDef<Format>,
    path: Path,
    robot: RobotConstants
}

export const DEFAULT_FORMAT: FileFormat = {
    format: "LemLib",
    field: "v5-match",
    formatDef: FORMAT_REGISTRY["LemLib"] as FormatDef<Format>,
    path: { segments: [], name: "" },
    robot: defaultRobotConstants,
}

function loadValidatedAppState(): FileFormat {
    const saved = localStorage.getItem("appState");
    if (!saved) return DEFAULT_FORMAT;

    try {
        const parsed = JSON.parse(saved);
        console.log(parsed);
        const format: Format = parsed.format ?? DEFAULT_FORMAT.format;
        return {
            format,
            field: parsed.field ?? DEFAULT_FORMAT.field,
            formatDef: mergeFormatDef(FORMAT_REGISTRY[format] as FormatDef<Format>, parsed.formatDef ?? parsed.defaults),
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
