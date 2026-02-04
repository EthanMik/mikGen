import { INITIAL_DEFAULTS, type DefaultConstant } from "../core/DefaultConstants"
import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import { createSharedState } from "../core/SharedState"
import { DEFAULT_COMMANDS, type Command } from "../core/Types/Command"
import type { Path } from "../core/Types/Path"
import type { FieldType } from "./useField"
import type { Format } from "./useFormat"

export type FileFormat = {
    format: Format,
    field: FieldType,
    defaults: DefaultConstant[Format],
    path: Path,
    robot: RobotConstants
    commands: Command[],
    // settings: 
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

export const useFileFormat = createSharedState<FileFormat>(VALIDATED_APP_STATE);