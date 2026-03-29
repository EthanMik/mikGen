import type { Robot } from "../../Robot";
import { clamp } from "../../Util";
import { kMikLibSpeed, type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { angle_error, clamp_min_voltage, slew_scaling } from "../Util";

let crossed: boolean = false;
let prev_error: number = 0;
let prev_raw_error: number = 0;
let prev_output: number = 0;
let swingPID: PID;

let start = true;

function resetSwingToAngle() {
    crossed = false;
    prev_error = 0;
    prev_raw_error = 0;
    prev_output = 0;
    swingPID.reset();
    start = true;
}

export function swingToAngle(robot: Robot, dt: number, angle: number, p: mikConstants) {
    const raw_error = angle_error(angle - robot.getAngle(), null);
    let error = angle_error(angle - robot.getAngle(), p.turn_direction);

    if (start) {
        prev_error = error;
        prev_raw_error = raw_error;
        swingPID = new PID(p.kp, p.ki, p.kd, p.starti, p.settle_time, p.settle_error, p.timeout, p.min_voltage > 0 ? p.exit_error : 0);
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
        resetSwingToAngle();
        return true;
    }
    prev_error = error;

    let output = swingPID.compute(error);

    if (swingPID.isSettled()) {
        resetSwingToAngle();
        return true;
    }

    output = clamp(output, -p.maxSpeed, p.maxSpeed);
    output = slew_scaling(output, prev_output ?? 0, p.slew * (dt / 0.01), Math.abs(error) > p.starti);
    output = clamp_min_voltage(output, p.min_voltage);
    prev_output = output;

    const scale = output / p.maxSpeed;

    if (p.swing_direction === "left") {
        robot.tankDrive(output / kMikLibSpeed, (p.opposite_voltage * scale) / kMikLibSpeed, dt);
    } else {
        robot.tankDrive((-p.opposite_voltage * scale) / kMikLibSpeed, -output / kMikLibSpeed, dt);
    }

    return false;
}
