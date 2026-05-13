import type { Robot } from "../../../core/Robot";
import { toDeg } from "../../../core/Util";
import { type mikConstants } from "../MikConstants";
import { reduce_negative_180_to_180 } from "../Util";
import { swing_to_angle } from "./SwingToAngle";

let initialAngle: number | null = null;

export function swing_to_point(robot: Robot, dt: number, x: number, y: number, offset: number, swing_p: mikConstants[]) {
    if (initialAngle === null) {
        initialAngle = reduce_negative_180_to_180(
        toDeg(Math.atan2(
            x - robot.getX(),
            y - robot.getY()))
            + offset);
    }

    const out = swing_to_angle(robot, dt, initialAngle, swing_p);
    if (out) {
        initialAngle = null;
        return true;
    }
    return false;
}
