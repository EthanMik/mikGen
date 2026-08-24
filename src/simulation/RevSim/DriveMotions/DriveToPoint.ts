import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import type { revConstants } from "../RevConstants";
import { PID } from "../PID";
import { clamp_min_speed, line_crossed, slew, to_tank_voltage, wrap_angle_180, wrap_angle_90 } from "../Util";

const SETTLE_DISTANCE = 7;

let lateralPID: PID;
let angularPID: PID;
let desired_heading = 0;
let heading_locked = false;
let locked_heading = 0;
let prev_line_settled = false;
let prev_drive_output = 0;
let prev_heading_output = 0;
let start = true;

export function reset_drive_to_point() {
    lateralPID?.reset();
    angularPID?.reset();
    desired_heading = 0;
    heading_locked = false;
    locked_heading = 0;
    prev_line_settled = false;
    prev_drive_output = 0;
    prev_heading_output = 0;
    start = true;
}

export function drive_to_point(robot: Robot, dt: number, x: number, y: number, p: revConstants[]): boolean {
    const lat = p[0];
    const ang = p[1];

    if (start) {
        lateralPID = new PID(dt, lat.kp, lat.ki, lat.kd, lat.kf, lat.start_i,
            lat.settle_error, lat.settle_time, lat.large_settle_error, lat.large_settle_time,
            lat.exit_error, lat.stall_timeout, lat.timeout);
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i, 0, 0, 0, 0, 0, 0, 0);

        desired_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
        heading_locked = false;
        locked_heading = 0;
        prev_line_settled = line_crossed(x, y, desired_heading, robot.getX(), robot.getY(), lat.exit_error);
        prev_drive_output = 0;
        prev_heading_output = 0;
        start = false;
    }

    const line_settled = line_crossed(x, y, desired_heading, robot.getX(), robot.getY(), lat.exit_error);
    if ((line_settled !== prev_line_settled && lat.min_speed > 0) || lateralPID.isSettled()) {
        reset_drive_to_point();
        return true;
    }
    prev_line_settled = line_settled;

    const target_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
    const reversed_heading = target_heading + (lat.drive_direction === "reversed" ? 180 : 0);
    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());

    let heading_error = wrap_angle_180(reversed_heading - robot.getAngle());
    const heading_scale_factor = Math.cos(toRad(wrap_angle_180(target_heading - robot.getAngle())));

    let drive_output = lateralPID.compute(drive_error) * heading_scale_factor;

    if (drive_error < SETTLE_DISTANCE) {
        if (!heading_locked) {
            locked_heading = reversed_heading;
            heading_locked = true;
        }
        heading_error = wrap_angle_180(locked_heading - robot.getAngle());
    }
    if (lat.drive_direction === "fastest") heading_error = wrap_angle_90(heading_error);
    let heading_output = angularPID.compute(heading_error);

    drive_output = clamp(drive_output,
        -Math.abs(heading_scale_factor) * lat.max_speed,
        Math.abs(heading_scale_factor) * lat.max_speed);
    heading_output = clamp(heading_output, -ang.max_speed, ang.max_speed);

    if (!heading_locked) drive_output = slew(drive_output, prev_drive_output, lat.slew);
    heading_output = slew(heading_output, prev_heading_output, ang.slew);

    if (lat.drive_direction === "forwards" && !heading_locked) drive_output = Math.max(drive_output, 0);
    else if (lat.drive_direction === "reversed" && !heading_locked) drive_output = Math.min(drive_output, 0);

    drive_output = clamp_min_speed(drive_output, lat.min_speed);

    prev_drive_output = drive_output;
    prev_heading_output = heading_output;

    const [left, right] = to_tank_voltage(drive_output, heading_output);
    robot.tankDrive(left, right, dt);

    return false;
}
