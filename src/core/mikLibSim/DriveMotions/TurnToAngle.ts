import type { Robot } from "../../Robot";
import { clamp } from "../../Util";
import type { PID } from "../PID";
import { reduce_negative_180_to_180 } from "../Util";

export function turnToAngle(robot: Robot, dt: number, angle: number, turnPID: PID) {
    const error = reduce_negative_180_to_180(angle - robot.getAngle());
    let output = turnPID.compute(error);
    
    if (turnPID.isSettled()) {
        turnPID.reset();
        return true;
    }

    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    robot.tankDrive(output / 12, -output / 12, dt);

    return false;
}