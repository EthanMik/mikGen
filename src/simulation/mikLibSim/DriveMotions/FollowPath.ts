import type { Robot } from "../../../core/Robot";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { resamplePolyline } from "../../../core/Types/Bezier";
import { clamp, normalizeDeg, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { clamp_max_slip, clamp_min_voltage, is_line_settled, left_voltage_scaling, overturn_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling, slew_scaling } from "../Util";

const DRIVE_LARGE_SETTLE_ERROR = 6;
const BOOMERANG_MIN_VOLTAGE = 6;
const POINT_DENSITY = 1;
const LOOKAHEAD_DISTANCE = 8;

let path_points: Coordinate[] = [];
let path_lengths: number[] = [];
let start_line_settled: boolean = false;
let prev_drive_output: number = 0;
let prev_slew_output: number = 0;
let settling: boolean = false;
let drive_max_speed: number = 0;
let drivePID: PID;
let headingPID: PID;

let start = true;

export function reset_follow_path() {
    drivePID?.reset();
    headingPID?.reset();
    path_points = [];
    path_lengths = [];
    start_line_settled = false;
    prev_drive_output = 0;
    prev_slew_output = 0;
    settling = false;
    start = true;
}

/** Cumulative arc length at each point, so remaining distance is a lookup rather than a scan. */
function cumulativeLengths(points: Coordinate[]): number[] {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    }
    return lengths;
}

/** The point LOOKAHEAD_DISTANCE further along the path, clamped to the end. */
function carrotIdxFrom(fromIdx: number): number {
    return Math.min(fromIdx + Math.round(LOOKAHEAD_DISTANCE / POINT_DENSITY), path_points.length - 1);
}

/**
 * Rescanned every tick rather than advanced from where it was last time. A stored index that only
 * moves forward strands the carrot ahead of a robot that overshoots or gets pushed off the curve,
 * leaving it no way back onto the path.
 */
function closestIdx(points: Coordinate[], x: number, y: number): number {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
        const dist = Math.hypot(points[i].x - x, points[i].y - y);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    return bestIdx;
}

export function follow_path(robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: mikConstants[]): boolean {
    if (points.length < 2) return true;

    const drive_p = p[0];
    const heading_p = p[1];

    const first_tick = start;
    if (start) {
        path_points = resamplePolyline(points, POINT_DENSITY);
        path_lengths = cumulativeLengths(path_points);
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, 0, 0, 0, 0);
        drive_max_speed = drive_p.max_voltage;
        settling = false;
        prev_drive_output = 0;
        prev_slew_output = 0;
        start = false;
    }

    if (drivePID.isSettled()) {
        reset_follow_path();
        return true;
    }

    const last = path_points.length - 1;
    const end = path_points[last];
    const final_tangent = toDeg(Math.atan2(end.x - path_points[last - 1].x, end.y - path_points[last - 1].y));

    const reversed = drive_p.drive_direction === "reversed";

    let settle_heading = end_angle ?? normalizeDeg(final_tangent + (reversed ? 180 : 0));
    if (reversed) settle_heading = normalizeDeg(settle_heading + 180);

    const closest = closestIdx(path_points, robot.getX(), robot.getY());
    const carrotIdx = carrotIdxFrom(closest);
    let carrot_X = path_points[carrotIdx].x;
    let carrot_Y = path_points[carrotIdx].y;

    const remaining_arc = path_lengths[last] - path_lengths[closest];
    const target_distance = Math.hypot(end.x - robot.getX(), end.y - robot.getY());

    if (remaining_arc < DRIVE_LARGE_SETTLE_ERROR && target_distance < DRIVE_LARGE_SETTLE_ERROR && !settling) {
        settling = true;
        drive_max_speed = Math.max(Math.abs(prev_drive_output), BOOMERANG_MIN_VOLTAGE);
    }

    const line_settled = is_line_settled(end.x, end.y, final_tangent, robot.getX(), robot.getY(), drive_p.exit_error);
    if (first_tick) start_line_settled = line_settled;

    if (line_settled !== start_line_settled && settling && drive_p.min_voltage > 0) {
        reset_follow_path();
        return true;
    }
    let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY()) + (path_lengths[last] - path_lengths[carrotIdx]);
    let current_angle = robot.getAngle();
    if (reversed) current_angle = current_angle + 180;

    let heading_error = reduce_negative_180_to_180(toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - current_angle);

    if (settling) {
        drive_error = target_distance;
        heading_error = reduce_negative_180_to_180(settle_heading - current_angle);
        drive_error *= Math.cos(toRad(reduce_negative_180_to_180(toDeg(Math.atan2(end.x - robot.getX(), end.y - robot.getY())) - robot.getAngle())));
        carrot_X = end.x;
        carrot_Y = end.y;
    } else {
        drive_error *= Math.sign(Math.cos(toRad(reduce_negative_180_to_180(toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle()))));
    }

    if (drive_p.drive_direction === "fastest") {
        heading_error = reduce_negative_90_to_90(heading_error);
    }

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    heading_output = clamp(heading_output, -heading_p.max_voltage, heading_p.max_voltage);

    drive_output = clamp(drive_output, -drive_max_speed, drive_max_speed);
    drive_output = slew_scaling(drive_output, prev_slew_output, drive_p.slew * (dt / 0.01), !settling);
    prev_slew_output = drive_output;

    drive_output = clamp_max_slip(drive_output, robot.getX(), robot.getY(), current_angle, carrot_X, carrot_Y, drive_p.drift);
    drive_output = overturn_scaling(drive_output, heading_output, drive_max_speed);

    if (drive_p.drive_direction === "forwards" && !settling) drive_output = Math.max(drive_output, 0);
    else if (drive_p.drive_direction === "reversed" && !settling) drive_output = Math.min(drive_output, 0);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);

    prev_drive_output = drive_output;

    robot.tankDrive(
        left_voltage_scaling(drive_output, heading_output) / 12,
        right_voltage_scaling(drive_output, heading_output) / 12,
        dt
    );

    return false;
}
