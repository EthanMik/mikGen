import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import type { revConstants } from "../../RevSim/RevConstants";
import { PID } from "../../RevSim/PID";
import { clamp_min_speed, line_crossed, slew, to_holonomic_voltage, wrap_angle_180 } from "../../RevSim/Util";

let lateralPID: PID;
let angularPID: PID;
let translationalPID: PID;
let start_x = 0;
let start_y = 0;
let target_angle = 0;
let line_angle = 0;
let prev_line_settled = false;
let crossed = false;
let prev_turn_error = 0;
let prev_drive_output = 0;
let prev_turn_output = 0;
let start = true;

export function reset_strafe_to_pose() {
    lateralPID?.reset();
    angularPID?.reset();
    translationalPID?.reset();
    start_x = 0;
    start_y = 0;
    target_angle = 0;
    line_angle = 0;
    prev_line_settled = false;
    crossed = false;
    prev_turn_error = 0;
    prev_drive_output = 0;
    prev_turn_output = 0;
    start = true;
}

export function strafe_to_pose(robot: Robot, dt: number, x: number, y: number, angle: number, p: revConstants[]): boolean {
    const lat = p[0];
    const ang = p[1];
    const trans = p[2];

    if (start) {
        lateralPID = new PID(dt, lat.kp, lat.ki, lat.kd, lat.kf, lat.start_i,
            lat.settle_error, lat.settle_time, lat.large_settle_error, lat.large_settle_time,
            lat.exit_error, lat.stall_timeout, lat.timeout);
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i,
            ang.settle_error, ang.settle_time, ang.large_settle_error, ang.large_settle_time,
            0, lat.stall_timeout, lat.timeout);
        translationalPID = new PID(dt, trans.kp, trans.ki, trans.kd, trans.kf, trans.start_i, 0, 0, 0, 0, 0, 0, 0);

        start_x = robot.getX();
        start_y = robot.getY();
        target_angle = angle;
        line_angle = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
        prev_line_settled = line_crossed(x, y, line_angle, robot.getX(), robot.getY(), lat.exit_error);
        crossed = false;
        prev_turn_error = 0;
        prev_drive_output = 0;
        prev_turn_output = 0;
        start = false;
    }

    if (lateralPID.isSettled() && (angularPID.isSettled() || (crossed && lat.min_speed > 0))) {
        reset_strafe_to_pose();
        return true;
    }

    const desired_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));

    const line_settled = line_crossed(x, y, desired_heading, robot.getX(), robot.getY(), lat.exit_error);
    if (line_settled !== prev_line_settled && lat.min_speed > 0) {
        reset_strafe_to_pose();
        return true;
    }
    prev_line_settled = line_settled;

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    const turn_error = wrap_angle_180(target_angle - robot.getAngle());
    const cross_error = (robot.getY() - start_y) * Math.sin(toRad(line_angle))
        - (robot.getX() - start_x) * Math.cos(toRad(line_angle));

    crossed = Math.sign(turn_error) !== Math.sign(prev_turn_error);
    prev_turn_error = turn_error;

    let drive_output = lateralPID.compute(drive_error);
    let turn_output = angularPID.compute(turn_error);
    let trans_output = translationalPID.compute(cross_error);

    drive_output = clamp(drive_output, -lat.max_speed, lat.max_speed);
    turn_output = clamp(turn_output, -ang.max_speed, ang.max_speed);
    trans_output = clamp(trans_output, -lat.max_speed, lat.max_speed);

    if (drive_error > lat.settle_error) drive_output = slew(drive_output, prev_drive_output, lat.slew);
    turn_output = slew(turn_output, prev_turn_output, ang.slew);

    drive_output = clamp_min_speed(drive_output, lat.min_speed);
    turn_output = clamp_min_speed(turn_output, lat.min_speed);

    prev_drive_output = drive_output;
    prev_turn_output = turn_output;

    const drive_x = drive_output * Math.sin(toRad(desired_heading));
    const drive_y = drive_output * Math.cos(toRad(desired_heading));
    const cross_x = trans_output * Math.cos(toRad(line_angle));
    const cross_y = -trans_output * Math.sin(toRad(line_angle));

    let total_x = drive_x + cross_x;
    let total_y = drive_y + cross_y;

    if (Math.hypot(total_x, total_y) > lat.max_speed) {
        const alignment = cross_x * drive_x + cross_y * drive_y;
        const overshoot = trans_output * trans_output - lat.max_speed * lat.max_speed;
        const drive_scale = clamp(
            (Math.sqrt(alignment * alignment - drive_output * drive_output * overshoot) - alignment)
            / (drive_output * drive_output),
            0, 1,
        );
        total_x = drive_x * drive_scale + cross_x;
        total_y = drive_y * drive_scale + cross_y;
    }

    const total_output = Math.hypot(total_x, total_y);
    const inv_sqrt2 = 1 / Math.SQRT2;
    const alpha = toRad(robot.getAngle()) + Math.atan2(total_y, total_x);
    const forward = inv_sqrt2 * total_output * Math.sin(alpha);
    const strafe = inv_sqrt2 * total_output * Math.cos(alpha);

    const [lf, lb, rf, rb] = to_holonomic_voltage(forward, strafe, turn_output);
    robot.mecanumDrive(lf, rf, lb, rb, dt);

    return false;
}
