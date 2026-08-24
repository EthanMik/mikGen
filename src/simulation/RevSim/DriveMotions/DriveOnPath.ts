import type { Robot } from "../../../core/Robot";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { clamp, toDeg, toRad } from "../../../core/Util";
import type { revConstants } from "../RevConstants";
import { PID } from "../PID";
import {
    clamp_max_slip, clamp_min_speed, clamp_overturn, cumulative_lengths, line_crossed,
    path_pose_at, path_progress, slew, to_tank_voltage, wrap_angle_180, wrap_angle_360, wrap_angle_90,
} from "../Util";

const SETTLE_DISTANCE = 7;
const SETTLING_MAX_SPEED_FLOOR = 0.5;

let lateralPID: PID;
let angularPID: PID;
let path_points: Coordinate[] = [];
let path_lengths: number[] = [];
let total_distance = 0;
let final_tangent = 0;
let settle_heading = 0;
let settling = false;
let start_line_settled = false;
let prev_drive_output = 0;
let prev_slew_output = 0;
let settling_max_speed = 0;
let start = true;

export function reset_drive_on_path() {
    lateralPID?.reset();
    angularPID?.reset();
    path_points = [];
    path_lengths = [];
    total_distance = 0;
    final_tangent = 0;
    settle_heading = 0;
    settling = false;
    start_line_settled = false;
    prev_drive_output = 0;
    prev_slew_output = 0;
    settling_max_speed = 0;
    start = true;
}

export function drive_on_path(robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: revConstants[]): boolean {
    const lat = p[0];
    const ang = p[1];

    if (start) {
        lateralPID = new PID(dt, lat.kp, lat.ki, lat.kd, lat.kf, lat.start_i,
            lat.settle_error, lat.settle_time, lat.large_settle_error, lat.large_settle_time,
            lat.exit_error, lat.stall_timeout, lat.timeout);
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i, 0, 0, 0, 0, 0, 0, 0);

        path_points = points;
        path_lengths = cumulative_lengths(path_points);
        settling = false;
        prev_drive_output = 0;
        prev_slew_output = 0;
        settling_max_speed = 0;
        start = false;

        if (path_points.length >= 2) {
            const end = path_points[path_points.length - 1];
            total_distance = path_lengths[path_lengths.length - 1];
            final_tangent = path_pose_at(path_points, path_lengths, total_distance).theta;

            settle_heading = final_tangent;
            if (end_angle !== null) {
                settle_heading = end_angle;
                if (lat.drive_direction === "reversed") settle_heading = wrap_angle_360(end_angle + 180);
            }

            start_line_settled = line_crossed(end.x, end.y, final_tangent, robot.getX(), robot.getY(), lat.exit_error);
        }
    }

    if (path_points.length < 2) {
        reset_drive_on_path();
        return true;
    }

    const end = path_points[path_points.length - 1];

    const traveled = path_progress(path_points, path_lengths, { x: robot.getX(), y: robot.getY() });
    const look_arc = Math.min(traveled + lat.lookahead, total_distance);
    const look = path_pose_at(path_points, path_lengths, look_arc);

    const remaining_arc = total_distance - traveled;
    const target_distance = Math.hypot(end.x - robot.getX(), end.y - robot.getY());

    const settle_radius = Math.max(SETTLE_DISTANCE, lat.exit_error);
    if (remaining_arc < settle_radius && target_distance < settle_radius && !settling) {
        settling = true;
        settling_max_speed = Math.max(Math.abs(prev_drive_output), SETTLING_MAX_SPEED_FLOOR);
    }

    const max_speed = settling ? settling_max_speed : lat.max_speed;

    const line_settled = line_crossed(end.x, end.y, final_tangent, robot.getX(), robot.getY(), lat.exit_error);

    if (lateralPID.isSettled() || (line_settled !== start_line_settled && settling && lat.min_speed > 0)) {
        reset_drive_on_path();
        return true;
    }

    let drive_error = Math.hypot(look.x - robot.getX(), look.y - robot.getY()) + (total_distance - look_arc);

    let current_heading = robot.getAngle();
    if (lat.drive_direction === "reversed") current_heading += 180;

    let heading_error = wrap_angle_180(toDeg(Math.atan2(look.x - robot.getX(), look.y - robot.getY())) - current_heading);

    if (settling) {
        drive_error = target_distance * Math.cos(toRad(wrap_angle_180(
            toDeg(Math.atan2(end.x - robot.getX(), end.y - robot.getY())) - robot.getAngle())));
        heading_error = wrap_angle_180(settle_heading - current_heading);
    } else {
        drive_error *= Math.sign(Math.cos(toRad(wrap_angle_180(
            toDeg(Math.atan2(look.x - robot.getX(), look.y - robot.getY())) - robot.getAngle()))));
    }

    if (lat.drive_direction === "fastest") heading_error = wrap_angle_90(heading_error);

    let drive_output = lateralPID.compute(drive_error);
    let heading_output = angularPID.compute(heading_error);

    heading_output = clamp(heading_output, -ang.max_speed, ang.max_speed);
    drive_output = clamp(drive_output, -max_speed, max_speed);

    if (!settling) drive_output = slew(drive_output, prev_slew_output, lat.slew);
    prev_slew_output = drive_output;

    drive_output = clamp_max_slip(
        drive_output, robot.getX(), robot.getY(), current_heading,
        settling ? end.x : look.x, settling ? end.y : look.y, lat.max_slip,
    );
    drive_output = clamp_overturn(drive_output, heading_output, max_speed);

    if (lat.drive_direction === "forwards" && !settling) drive_output = Math.max(drive_output, 0);
    else if (lat.drive_direction === "reversed" && !settling) drive_output = Math.min(drive_output, 0);

    drive_output = clamp_min_speed(drive_output, lat.min_speed);

    prev_drive_output = drive_output;

    const [left, right] = to_tank_voltage(drive_output, heading_output);
    robot.tankDrive(left, right, dt);

    return false;
}
