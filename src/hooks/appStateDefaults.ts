import { INITIAL_DEFAULTS, type DefaultConstant } from "../core/InitialDefaults"
import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import type { Path } from "../core/Types/Path"

// Types defined here to avoid circular dependencies
export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib" | "RW-Template"
export type FieldType = "v5-match" | "v5-skills" | "vexu-match" | "empty" | "separator"

export type FileFormat = {
    format: Format,
    field: FieldType,
    defaults: DefaultConstant[Format],
    path: Path,
    robot: RobotConstants
}

export const DEFAULT_FORMAT: FileFormat = {
    format: "mikLib",
    field: "v5-match",
    defaults: INITIAL_DEFAULTS["mikLib"],
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
            defaults: parsed.defaults ?? DEFAULT_FORMAT.defaults,
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
