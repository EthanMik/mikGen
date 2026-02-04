import { INITIAL_DEFAULTS, type DefaultConstant } from "../core/InitialDefaults"
import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import { DEFAULT_COMMANDS, type Command } from "../core/Types/Command"
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
    commands: Command[],
}

export const DEFAULT_FORMAT: FileFormat = {
    format: "mikLib",
    field: "v5-match",
    defaults: INITIAL_DEFAULTS["mikLib"],
    path: { segments: [], name: "" },
    robot: defaultRobotConstants,
    commands: DEFAULT_COMMANDS["mikLib"]
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
            commands: Array.isArray(parsed.commands)
                ? parsed.commands
                : DEFAULT_FORMAT.commands,
        };
    } catch {
        return DEFAULT_FORMAT;
    }
}

export const VALIDATED_APP_STATE = loadValidatedAppState();
