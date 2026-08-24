import type { Robot } from "../../../core/Robot";
import { clamp } from "../../../core/Util";
import type { revConstants } from "../RevConstants";
import { PID } from "../PID";
import { angle_error, clamp_min_speed, slew, to_tank_voltage } from "../Util";

const SETTLE_DISTANCE = 20;

let angularPID: PID;
let crossed = false;
let prev_raw_error = 0;
let prev_error = 0;
let prev_output = 0;
let start = true;

export function reset_turn_to_angle() {
    angularPID?.reset();
    crossed = false;
    prev_raw_error = 0;
    prev_error = 0;
    prev_output = 0;
    start = true;
}

export function turn_to_angle(robot: Robot, dt: number, angle: number, p: revConstants[]): boolean {
    const ang = p[0];

    if (start) {
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i,
            ang.settle_error, ang.settle_time, ang.large_settle_error, ang.large_settle_time,
            ang.exit_error, ang.stall_timeout, ang.timeout);

        crossed = false;
        prev_raw_error = angle_error(angle - robot.getAngle(), "shortest");
        prev_error = angle_error(angle - robot.getAngle(), ang.turn_direction);
        prev_output = 0;
        start = false;
    }

    const raw_error = angle_error(angle - robot.getAngle(), "shortest");
    if (Math.sign(raw_error) !== Math.sign(prev_raw_error)) crossed = true;
    prev_raw_error = raw_error;

    const error = crossed ? raw_error : angle_error(angle - robot.getAngle(), ang.turn_direction);

    if (angularPID.isSettled() || (ang.min_speed > 0 && Math.sign(error) !== Math.sign(prev_error))) {
        reset_turn_to_angle();
        return true;
    }
    prev_error = error;

    let output = angularPID.compute(error);
    output = clamp(output, -ang.max_speed, ang.max_speed);

    if (Math.abs(error) > SETTLE_DISTANCE) output = slew(output, prev_output, ang.slew);

    output = clamp_min_speed(output, ang.min_speed);
    prev_output = output;

    const [left, right] = to_tank_voltage(0, output);
    robot.tankDrive(left, right, dt);

    return false;
}
