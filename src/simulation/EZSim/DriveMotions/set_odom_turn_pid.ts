import type { Robot } from "../../../core/Robot";
import { toDeg } from "../../../core/Util";
import type { EZconstants } from "../EZConstants";
import { pid_turn_set, resetTurnPid } from "./set_turn_pid";

let turn_start = true;
let target = 0;

export function resetOdomTurnPid() { turn_start = true; resetTurnPid(); }

export function pid_odom_turn_set(robot: Robot, dt: number, x: number, y: number, p: EZconstants[]) {
    const turn_p = p[0];

    if (turn_start) {
        turn_start = false;
        target = toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) + (turn_p.drive_directions === "rev" ? 180 : 0);

        return pid_turn_set(robot, dt, target, p);
    }
    
    const output = pid_turn_set(robot, dt, target, p);
    if (output) {
        turn_start = true;
        return output
    }
    return output;
}
