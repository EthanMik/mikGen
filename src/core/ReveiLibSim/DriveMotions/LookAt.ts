import type { Robot } from "../../Robot";
import { toDeg } from "../../Util";
import type { ReveilLibConstants } from "../RevConstants";
import { wrapDeg180 } from "../Util";
import { turnSegment } from "./TurnSegment";

let lookAtAngle: number | null = null;

export function lookAt(robot: Robot, dt: number, x: number, y: number, offset: number, constants: ReveilLibConstants) {
    if (lookAtAngle === null) {
        const computedAngle = wrapDeg180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) + offset);
        const angle1 = wrapDeg180(computedAngle - (constants.dropEarly ?? 0));
        const angle2 = wrapDeg180(computedAngle + (constants.dropEarly ?? 0));
    
        const offset1 = angle1 - robot.getAngle();
        const offset2 = angle2 - robot.getAngle();
    
        lookAtAngle = (Math.abs(offset1) < Math.abs(offset2)) ? angle1 : angle2;
        console.log(lookAtAngle);
    }

    const state = turnSegment(robot, dt, lookAtAngle, constants); 

    if (state) {
        lookAtAngle = null;
        return true
    }

    return false;
}