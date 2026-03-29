import type { Robot } from "../../Robot";
import { clamp, toDeg } from "../../Util";
import { kMikLibSpeed, type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { angle_error, clamp_min_voltage, slew_scaling } from "../Util";

let crossed: boolean = false;
let prev_error: number = 0; 
let prev_raw_error: number = 0;
let prev_output: number = 0;
let turnPID: PID;

let start = true;

function resetTurnToPoint() {
    crossed = false;
    prev_error = 0;
    prev_output = 0;
    prev_raw_error = 0;
    turnPID.reset();
    start = true;
}

export function turnToPoint(robot: Robot, dt: number, x: number, y: number, offset: number, p: mikConstants) {
    const angle = toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) + offset;

    const raw_error = angle_error(angle - robot.getAngle(), null);
    let error = angle_error(angle - robot.getAngle(), p.turn_direction);

    if (start) {
        prev_error = error;
        prev_raw_error = raw_error;
        turnPID = new PID(p.kp, p.ki, p.kd, p.starti, p.settle_time, p.settle_error, p.timeout, p.min_voltage > 0 ? p.exit_error : 0);
        start = false;
    }

    if (Math.sign(raw_error) != Math.sign(prev_raw_error)) {
        crossed = true;
    }
    prev_raw_error = raw_error;

    if (crossed) {
        error = raw_error;
    } else {
        error = angle_error(angle - robot.getAngle(), p.turn_direction);
    }

    if (p.min_voltage != 0 && crossed && Math.sign(error) != Math.sign(prev_error)) {
        resetTurnToPoint();
        return true;
    }
    prev_error = error;

    let output = turnPID.compute(error);

    if (turnPID.isSettled()) {
        resetTurnToPoint();
        return true;
    }

    output = clamp(output, -p.maxSpeed, p.maxSpeed);
    output = slew_scaling(output, prev_output ?? 0, p.slew * (dt / 0.01), Math.abs(error) > 15);
    output = clamp_min_voltage(output, p.min_voltage);
    prev_output = output;

    robot.tankDrive(output / kMikLibSpeed, -output / kMikLibSpeed, dt);

    return false;
}