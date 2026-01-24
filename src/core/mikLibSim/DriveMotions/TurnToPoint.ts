import type { Robot } from "../../Robot";
import { clamp, toDeg } from "../../Util";
import { kMikLibSpeed } from "../MikConstants";
import type { PID } from "../PID";
import { angle_error, clamp_min_voltage } from "../Util";

let crossed: boolean = false;
let prevError: number | null = null; 
let prevRawError: number | null = null;

function resetTurnToPoint(turnPID: PID) {
    crossed = false;
    prevError = null;
    prevRawError = null;
    turnPID.reset();
}

export function turnToPoint(robot: Robot, dt: number, x: number, y: number, offset: number, turnPID: PID) {
    const targetAngle = toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) + offset;

    const rawError = angle_error(targetAngle - robot.getAngle(), null);
    let error = angle_error(targetAngle - robot.getAngle(), turnPID.turnDirection);

    if (prevError === null || prevRawError === null) {
        prevError = error;
        prevRawError = rawError;
    }

    if (Math.sign(rawError) != Math.sign(prevRawError)) {
        crossed = true;
    }
    prevRawError = rawError;

    if (crossed) {
        error = rawError;
    } else {
        error = angle_error(targetAngle - robot.getAngle(), turnPID.turnDirection);
    }

    if (turnPID.minSpeed != 0 && crossed && Math.sign(error) != Math.sign(prevError)) {
        resetTurnToPoint(turnPID);
        return true;
    }
    prevError = error;

    let output = turnPID.compute(error);

    if (turnPID.isSettled()) {
        resetTurnToPoint(turnPID);
        return true;
    }

    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    output = clamp_min_voltage(output, turnPID.minSpeed);

    robot.tankDrive(output / kMikLibSpeed, -output / kMikLibSpeed, dt);

    return false;
}