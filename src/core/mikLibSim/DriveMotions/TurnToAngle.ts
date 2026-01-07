import type { Robot } from "../../Robot";
import { clamp } from "../../Util";
import type { PID } from "../PID";
import { angle_error, clamp_min_voltage } from "../Util";

let crossed: boolean = false;
let prevError: number | null = null; 
let prevRawError: number | null = null;

function resetTurnToAngle(turnPID: PID) {
    crossed = false;
    prevError = null;
    prevRawError = null;
    turnPID.reset();
}

export function turnToAngle(robot: Robot, dt: number, angle: number, turnPID: PID) {
    const rawError = angle_error(angle - robot.getAngle(), null);
    let error = angle_error(angle - robot.getAngle(), turnPID.turnDirection);

    if (prevError === null || prevRawError === null) {
        prevError = error;
        prevRawError = rawError
    }
    
    if (Math.sign(rawError) != Math.sign(prevRawError)) {
        crossed = true
    }
    prevRawError = rawError;
    
    if (crossed) {
        error = rawError;
    } else {
        error = angle_error(angle - robot.getAngle(), turnPID.turnDirection);
    }
    
    if (turnPID.minSpeed != 0 && crossed && Math.sign(error) != Math.sign(prevError)) {
        resetTurnToAngle(turnPID);
        return true;
    }
    prevError = error;
    
    let output = turnPID.compute(error);
    
    if (turnPID.isSettled()) {
        resetTurnToAngle(turnPID);
        return true;
    }

    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    output = clamp_min_voltage(output, turnPID.minSpeed);

    robot.tankDrive(output / 12, -output / 12, dt);

    return false;
}