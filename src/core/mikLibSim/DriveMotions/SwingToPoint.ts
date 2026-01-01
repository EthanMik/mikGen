import type { Robot } from "../../Robot";
import { clamp, toDeg } from "../../Util";
import type { PID } from "../PID";
import { reduce_negative_180_to_180 } from "../Util";

export function swingToPoint(robot: Robot, dt: number, x: number, y: number, offset: number, swingPID: PID) {
    const error = reduce_negative_180_to_180(
        toDeg(Math.atan2(
            x - robot.getX(), 
            y - robot.getY())) 
            - robot.getAngle() + offset);

    let output = swingPID.compute(error);

    if (swingPID.isSettled()) {
        swingPID.reset();
        return true;
    }

    output = clamp(output, -swingPID.maxSpeed, swingPID.maxSpeed);
    
    if (swingPID.swingDirection === "left") {
        robot.tankDrive(output / 12, 0, dt);
    } else { // Swing right
        robot.tankDrive(0, -output / 12, dt);
    }
    
    return false;
}

