import type { DefaultConstant } from "../core/DefaultConstants"
import type { RobotConstants } from "../core/Robot"
import type { Command } from "../core/Types/Command"
import type { Path } from "../core/Types/Path"

type FileFormat = {
    field: string,
    default: DefaultConstant,
    path: Path,
    robot: RobotConstants
    commands: Command[],
    // settings: 
}