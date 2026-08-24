import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import type { revConstants } from "../RevConstants";
import { PID } from "../PID";
import {
    clamp_max_slip, clamp_min_speed, clamp_overturn, line_crossed, slew,
    to_tank_voltage, wrap_angle_180, wrap_angle_360, wrap_angle_90,
} from "../Util";

const SETTLE_DISTANCE = 7;
const SETTLING_MAX_SPEED_FLOOR = 0.5;

let lateralPID: PID;
let angularPID: PID;
let angle = 0;
let settling = false;
let start_line_settled = false;
let prev_drive_output = 0;
let prev_slew_output = 0;
let settling_max_speed = 0;
let start = true;

export function reset_drive_to_pose() {
    lateralPID?.reset();
    angularPID?.reset();
    angle = 0;
    settling = false;
    start_line_settled = false;
    prev_drive_output = 0;
    prev_slew_output = 0;
    settling_max_speed = 0;
    start = true;
}

export function drive_to_pose(robot: Robot, dt: number, x: number, y: number, target_angle: number, p: revConstants[]): boolean {
    const lat = p[0];
    const ang = p[1];

    if (start) {
        lateralPID = new PID(dt, lat.kp, lat.ki, lat.kd, lat.kf, lat.start_i,
            lat.settle_error, lat.settle_time, lat.large_settle_error, lat.large_settle_time,
            lat.exit_error, lat.stall_timeout, lat.timeout);
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i, 0, 0, 0, 0, 0, 0, 0);

        angle = target_angle;
        if (lat.drive_direction === "reversed") angle = wrap_angle_360(angle + 180);

        settling = false;
        start_line_settled = line_crossed(x, y, angle, robot.getX(), robot.getY(), lat.exit_error);
        prev_drive_output = 0;
        prev_slew_output = 0;
        settling_max_speed = 0;
        start = false;
    }

    const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());
    let carrot_x = x - Math.sin(toRad(angle)) * (lat.lead * target_distance);
    let carrot_y = y - Math.cos(toRad(angle)) * (lat.lead * target_distance);

    if (target_distance < Math.max(SETTLE_DISTANCE, lat.exit_error) && !settling) {
        settling = true;
        settling_max_speed = Math.max(Math.abs(prev_drive_output), SETTLING_MAX_SPEED_FLOOR);
    }

    const max_speed = settling ? settling_max_speed : lat.max_speed;

    const line_settled = line_crossed(x, y, angle, robot.getX(), robot.getY(), lat.exit_error);

    if (lateralPID.isSettled() || (line_settled !== start_line_settled && settling && lat.min_speed > 0)) {
        reset_drive_to_pose();
        return true;
    }

    let drive_error = Math.hypot(carrot_x - robot.getX(), carrot_y - robot.getY());

    let current_heading = robot.getAngle();
    if (lat.drive_direction === "reversed") current_heading += 180;

    let heading_error = wrap_angle_180(toDeg(Math.atan2(carrot_x - robot.getX(), carrot_y - robot.getY())) - current_heading);

    if (settling) {
        drive_error = target_distance * Math.cos(toRad(wrap_angle_180(
            toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle())));
        heading_error = wrap_angle_180(angle - current_heading);
        carrot_x = x;
        carrot_y = y;
    } else {
        drive_error *= Math.sign(Math.cos(toRad(wrap_angle_180(
            toDeg(Math.atan2(carrot_x - robot.getX(), carrot_y - robot.getY())) - robot.getAngle()))));
    }

    if (lat.drive_direction === "fastest") heading_error = wrap_angle_90(heading_error);

    let drive_output = lateralPID.compute(drive_error);
    let heading_output = angularPID.compute(heading_error);

    heading_output = clamp(heading_output, -ang.max_speed, ang.max_speed);
    drive_output = clamp(drive_output, -max_speed, max_speed);

    if (!settling) drive_output = slew(drive_output, prev_slew_output, lat.slew);
    prev_slew_output = drive_output;

    drive_output = clamp_max_slip(drive_output, robot.getX(), robot.getY(), current_heading, carrot_x, carrot_y, lat.max_slip);
    drive_output = clamp_overturn(drive_output, heading_output, max_speed);

    if (lat.drive_direction === "forwards" && !settling) drive_output = Math.max(drive_output, 0);
    else if (lat.drive_direction === "reversed" && !settling) drive_output = Math.min(drive_output, 0);

    drive_output = clamp_min_speed(drive_output, lat.min_speed);

    prev_drive_output = drive_output;

    const [left, right] = to_tank_voltage(drive_output, heading_output);
    robot.tankDrive(left, right, dt);

    return false;
}
