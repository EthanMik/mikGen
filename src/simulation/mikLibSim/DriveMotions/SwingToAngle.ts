import type { Robot } from "../../../core/Robot";
import { clamp } from "../../../core/Util";
import { type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { angle_error, clamp_min_voltage, slew_scaling } from "../Util";

let crossed: boolean = false;
let prev_error: number = 0;
let prev_raw_error: number = 0;
let prev_output: number = 0;
let swingPID: PID;

let start = true;

function reset_swing_to_angle() {
    crossed = false;
    prev_error = 0;
    prev_raw_error = 0;
    prev_output = 0;
    swingPID.reset();
    start = true;
}

export function swing_to_angle(robot: Robot, dt: number, angle: number, p: mikConstants[]) {
    const turn_p = p[0];

    const raw_error = angle_error(angle - robot.getAngle(), "FASTEST");
    let error = angle_error(angle - robot.getAngle(), turn_p.turn_direction);

    if (start) {
        prev_error = error;
        prev_raw_error = raw_error;
        swingPID = new PID(turn_p.kp, turn_p.ki, turn_p.kd, turn_p.starti, turn_p.settle_time, turn_p.settle_error, turn_p.timeout, turn_p.min_voltage > 0 ? turn_p.exit_error : 0);
        start = false;
    }

    if (Math.sign(raw_error) != Math.sign(prev_raw_error)) {
        crossed = true;
    }
    prev_raw_error = raw_error;

    if (crossed) {
        error = raw_error;
    } else {
        error = angle_error(angle - robot.getAngle(), turn_p.turn_direction);
    }

    if (turn_p.min_voltage != 0 && crossed && Math.sign(error) != Math.sign(prev_error)) {
        reset_swing_to_angle();
        return true;
    }
    prev_error = error;

    let output = swingPID.compute(error);

    if (swingPID.isSettled()) {
        reset_swing_to_angle();
        return true;
    }

    output = clamp(output, -turn_p.max_voltage, turn_p.max_voltage);
    output = slew_scaling(output, prev_output ?? 0, turn_p.slew * (dt / 0.01), Math.abs(error) > turn_p.starti);
    output = clamp_min_voltage(output, turn_p.min_voltage);
    prev_output = output;

    const scale = output / turn_p.max_voltage;

    if (turn_p.swing_direction === "LEFT") {
        robot.tankDrive(output / 12, (turn_p.opposite_voltage * scale) / 12, dt);
    } else {
        robot.tankDrive((-turn_p.opposite_voltage * scale) / 12, -output / 12, dt);
    }

    return false;
}
