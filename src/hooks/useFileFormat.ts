import { INITIAL_DEFAULTS, type DefaultConstant } from "../core/DefaultConstants"
import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import { createSharedState } from "../core/SharedState"
import type { Command } from "../core/Types/Command"
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
    commands: []
}

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;

export const useFileFormat = createSharedState<FileFormat>(initialData);