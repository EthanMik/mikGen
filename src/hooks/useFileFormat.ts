import type { DefaultConstant } from "../core/DefaultConstants"
import type { RobotConstants } from "../core/Robot"
import { createSharedState } from "../core/SharedState"
import type { Command } from "../core/Types/Command"
import type { Path } from "../core/Types/Path"
import type { Format } from "./useFormat"

export type FileFormat = {
    format: Format,
    field: string,
    defaults: DefaultConstant[Format],
    path: Path,
    robot: RobotConstants
    commands: Command[],
    // settings: 
}

export const useFileFormat = createSharedState<FileFormat | null>(null);