import type { Robot } from "../../../core/Robot";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { clamp, normalizeDeg, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { clamp_max_slip, clamp_min_voltage, is_line_settled, left_voltage_scaling, overturn_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling, slew_scaling } from "../Util";

/** Inches further along the path the chased point is drawn from. */
const LOOKAHEAD_DISTANCE = 8;
/** Distance to the end at which the settle phase begins. */
const SETTLE_DISTANCE = 7;
/** Lower bound on the speed captured when settling starts, so it can still reach the end. */
const SETTLING_MIN_VOLTAGE = 6;

let path_points: Coordinate[] = [];
let path_lengths: number[] = [];
let total_distance: number = 0;
let final_tangent: number = 0;
let settle_heading: number = 0;
let start_line_settled: boolean = false;
let prev_drive_output: number = 0;
let prev_slew_output: number = 0;
let settling: boolean = false;
let settling_max_speed: number = 0;
let drivePID: PID;
let headingPID: PID;

let start = true;

export function reset_follow_path() {
    drivePID?.reset();
    headingPID?.reset();
    path_points = [];
    path_lengths = [];
    total_distance = 0;
    final_tangent = 0;
    settle_heading = 0;
    start_line_settled = false;
    prev_drive_output = 0;
    prev_slew_output = 0;
    settling = false;
    settling_max_speed = 0;
    start = true;
}

/** Arc length at each point, so path lookups are a walk rather than a search. */
function cumulativeLengths(points: Coordinate[]): number[] {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    }
    return lengths;
}

/**
 * Arc length of the robot projected onto the path. Rescanned every step rather than advanced from
 * where it was last time, since a progress that only moves forward strands the chased point ahead of
 * a robot that overshoots or gets pushed off the path.
 */
function pathProgress(x: number, y: number): number {
    let progress = 0;
    let closest_distance = Infinity;

    for (let i = 0; i < path_points.length - 1; i++) {
        const dx = path_points[i + 1].x - path_points[i].x;
        const dy = path_points[i + 1].y - path_points[i].y;
        const length = Math.hypot(dx, dy);
        if (length === 0) continue;

        const along = clamp(((x - path_points[i].x) * dx + (y - path_points[i].y) * dy) / length, 0, length);
        const distance = Math.hypot(path_points[i].x + dx * (along / length) - x, path_points[i].y + dy * (along / length) - y);
        if (distance < closest_distance) {
            closest_distance = distance;
            progress = path_lengths[i] + along;
        }
    }
    return progress;
}

/** Point and compass tangent of the path at an arc length along it. */
function pathPoseAt(s: number): { x: number, y: number, theta: number } {
    const arc = clamp(s, 0, total_distance);
    let i = 0;
    while (i < path_points.length - 2 && path_lengths[i + 1] < arc) i++;

    const length = path_lengths[i + 1] - path_lengths[i];
    const t = length > 0 ? (arc - path_lengths[i]) / length : 0;
    const dx = path_points[i + 1].x - path_points[i].x;
    const dy = path_points[i + 1].y - path_points[i].y;

    return { x: path_points[i].x + dx * t, y: path_points[i].y + dy * t, theta: toDeg(Math.atan2(dx, dy)) };
}

export function follow_path(robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: mikConstants[]): boolean {
    if (points.length < 2) return true;

    const drive_p = p[0];
    const heading_p = p[1];
    const reversed = drive_p.drive_direction === "reversed";

    if (start) {
        path_points = points;
        path_lengths = cumulativeLengths(path_points);
        total_distance = path_lengths[path_lengths.length - 1];
        final_tangent = pathPoseAt(total_distance).theta;
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, 0, 0, 0, 0);
        settling = false;
        settling_max_speed = 0;
        prev_drive_output = 0;
        prev_slew_output = 0;

        // Settle on the commanded heading, flipped when reversed, else lay the robot along the tangent
        settle_heading = end_angle === null ? final_tangent : (reversed ? normalizeDeg(end_angle + 180) : end_angle);

        const start_end = path_points[path_points.length - 1];
        start_line_settled = is_line_settled(start_end.x, start_end.y, final_tangent, robot.getX(), robot.getY(), drive_p.exit_error);
        start = false;
    }

    const end = path_points[path_points.length - 1];

    const traveled = pathProgress(robot.getX(), robot.getY());
    const look_arc = Math.min(traveled + LOOKAHEAD_DISTANCE, total_distance);
    const look = pathPoseAt(look_arc);

    const remaining_arc = total_distance - traveled;
    const target_distance = Math.hypot(end.x - robot.getX(), end.y - robot.getY());

    // Enter settling when both the path and the straight line to its end run out
    const settle_radius = Math.max(SETTLE_DISTANCE, drive_p.exit_error);
    if (remaining_arc < settle_radius && target_distance < settle_radius && !settling) {
        settling = true;
        settling_max_speed = Math.max(Math.abs(prev_drive_output), SETTLING_MIN_VOLTAGE);
    }

    const max_speed = settling ? settling_max_speed : drive_p.max_voltage;

    // Chain out once the robot crosses to the other side of the exit line it started on
    const line_settled = is_line_settled(end.x, end.y, final_tangent, robot.getX(), robot.getY(), drive_p.exit_error);

    if (drivePID.isSettled() || (line_settled !== start_line_settled && settling && drive_p.min_voltage > 0)) {
        reset_follow_path();
        return true;
    }

    const look_bearing = toDeg(Math.atan2(look.x - robot.getX(), look.y - robot.getY()));
    const end_bearing = toDeg(Math.atan2(end.x - robot.getX(), end.y - robot.getY()));
    const current_heading = robot.getAngle() + (reversed ? 180 : 0);

    // Distance to the chased point plus the path still left beyond it, so speed holds through the curve
    let drive_error = Math.hypot(look.x - robot.getX(), look.y - robot.getY()) + (total_distance - look_arc);
    let heading_error = reduce_negative_180_to_180(look_bearing - current_heading);

    if (settling) {
        drive_error = target_distance * Math.cos(toRad(reduce_negative_180_to_180(end_bearing - robot.getAngle())));
        heading_error = reduce_negative_180_to_180(settle_heading - current_heading);
    } else {
        // Sign the drive error by whether the robot faces toward the chased point or away from it
        drive_error *= Math.sign(Math.cos(toRad(reduce_negative_180_to_180(look_bearing - robot.getAngle()))));
    }

    // Let the robot pick whichever end faces the chased point when no direction is forced
    if (drive_p.drive_direction === "fastest") heading_error = reduce_negative_90_to_90(heading_error);

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    heading_output = clamp(heading_output, -heading_p.max_voltage, heading_p.max_voltage);
    drive_output = clamp(drive_output, -max_speed, max_speed);

    if (!settling) drive_output = slew_scaling(drive_output, prev_slew_output, drive_p.slew);
    prev_slew_output = drive_output;

    // Held to the chased point rather than to a carrot led off it
    drive_output = clamp_max_slip(drive_output, robot.getX(), robot.getY(), current_heading, settling ? end.x : look.x, settling ? end.y : look.y, drive_p.drift);
    drive_output = overturn_scaling(drive_output, heading_output, max_speed);

    if (drive_p.drive_direction === "forwards" && !settling) drive_output = Math.max(drive_output, 0);
    else if (reversed && !settling) drive_output = Math.min(drive_output, 0);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);

    prev_drive_output = drive_output;

    robot.tankDrive(
        left_voltage_scaling(drive_output, heading_output) / 12,
        right_voltage_scaling(drive_output, heading_output) / 12,
        dt
    );

    return false;
}
