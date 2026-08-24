import type { Robot } from "../../../core/Robot";
import { clamp, toDeg } from "../../../core/Util";
import type { revConstants } from "../RevConstants";
import { PID } from "../PID";
import { angle_error, clamp_min_speed, slew } from "../Util";

const SETTLE_DISTANCE = 20;

let angularPID: PID;
let angle = 0;
let crossed = false;
let prev_raw_error = 0;
let prev_error = 0;
let prev_output = 0;
let start = true;

export function reset_swing_to_point() {
    angularPID?.reset();
    angle = 0;
    crossed = false;
    prev_raw_error = 0;
    prev_error = 0;
    prev_output = 0;
    start = true;
}

export function swing_to_point(robot: Robot, dt: number, x: number, y: number, offset: number, p: revConstants[]): boolean {
    const ang = p[0];

    if (start) {
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i,
            ang.settle_error, ang.settle_time, ang.large_settle_error, ang.large_settle_time,
            ang.exit_error, ang.stall_timeout, ang.timeout);

        angle = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
        crossed = false;
        prev_raw_error = angle_error(angle - robot.getAngle() + offset, "shortest");
        prev_error = angle_error(angle - robot.getAngle() + offset, ang.turn_direction);
        prev_output = 0;
        start = false;
    }

    const raw_error = angle_error(angle - robot.getAngle() + offset, "shortest");
    if (Math.sign(raw_error) !== Math.sign(prev_raw_error)) crossed = true;
    prev_raw_error = raw_error;

    const error = crossed ? raw_error : angle_error(angle - robot.getAngle() + offset, ang.turn_direction);

    if (angularPID.isSettled() || (ang.min_speed > 0 && Math.sign(error) !== Math.sign(prev_error))) {
        reset_swing_to_point();
        return true;
    }
    prev_error = error;

    let output = angularPID.compute(error);
    output = clamp(output, -ang.max_speed, ang.max_speed);

    if (Math.abs(error) > SETTLE_DISTANCE) output = slew(output, prev_output, ang.slew);

    output = clamp_min_speed(output, ang.min_speed);
    prev_output = output;

    const opposite_output = (ang.opposite_speed !== 0 && ang.max_speed !== 0)
        ? ang.opposite_speed * (output / ang.max_speed)
        : 0;

    if (ang.swing_side === "SwingSide::LEFT") robot.tankDrive(output, opposite_output, dt);
    else robot.tankDrive(-opposite_output, -output, dt);

    return false;
}
