import type { Robot } from "../../Robot";
import { toDeg } from "../../Util";
import { type mikConstants } from "../MikConstants";
import { reduce_negative_180_to_180 } from "../Util";
import { swingToAngle } from "./SwingToAngle";

let initialAngle: number | null = null;

export function swingToPoint(robot: Robot, dt: number, x: number, y: number, offset: number, p: mikConstants) {
    if (initialAngle === null) {
        initialAngle = reduce_negative_180_to_180(
        toDeg(Math.atan2(
            x - robot.getX(),
            y - robot.getY()))
            + offset);
    }

    const out = swingToAngle(robot, dt, initialAngle, p);
    if (out) {
        initialAngle = null;
        return true;
    }
    return false;
}
