import type { Robot } from "../../Robot";
import { clamp, toDeg } from "../../Util";
import type { PID } from "../PID";
import { reduce_negative_180_to_180 } from "../Util";

export function turnToPoint(robot: Robot, dt: number, x: number, y: number, offset: number, turnPID: PID) {
    const error = reduce_negative_180_to_180(
        toDeg(Math.atan2(
            x - robot.getX(), 
            y - robot.getY())) 
            - robot.getAngle() + offset);
            
    let output = turnPID.compute(error);
    
    if (turnPID.isSettled()) {
        turnPID.reset();
        return true;
    }

    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    robot.tankDrive(output / 12, -output / 12, dt);

    return false;
}