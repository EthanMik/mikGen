import type { Robot } from "../../../core/Robot";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling, slew_scaling } from "../Util";

const DRIVE_LARGE_SETTLE_ERROR = 6;
/** Inches ahead of the robot the carrot point sits. Hardcoded for now. */
const LOOKAHEAD_DISTANCE = 8;

let desired_heading: number = 0;
let prev_line_settled: boolean = false;
let prev_drive_output: number = 0;
let prev_heading_output: number = 0;
let heading_locked: boolean = false;
let locked_heading: number = 0;
let closest_idx: number = 0;
let drivePID: PID;
let headingPID: PID;

let start = true;

export function reset_follow_path() {
    drivePID?.reset();
    headingPID?.reset();
    desired_heading = 0;
    prev_line_settled = false;
    prev_drive_output = 0;
    prev_heading_output = 0;
    heading_locked = false;
    locked_heading = 0;
    closest_idx = 0;
    start = true;
}

/** Cumulative arc length at each sample, so remaining distance is a lookup rather than a scan. */
function cumulativeLengths(points: Coordinate[]): number[] {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    }
    return lengths;
}

/** Advances monotonically so the robot never snaps back to an earlier part of the curve. */
function advanceClosestIdx(points: Coordinate[], x: number, y: number): number {
    let bestIdx = closest_idx;
    let bestDist = Infinity;
    for (let i = closest_idx; i < points.length; i++) {
        const dist = Math.hypot(points[i].x - x, points[i].y - y);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    closest_idx = bestIdx;
    return bestIdx;
}

function carrotPoint(points: Coordinate[], lengths: number[], fromIdx: number): Coordinate {
    const target = lengths[fromIdx] + LOOKAHEAD_DISTANCE;
    for (let i = fromIdx; i < points.length; i++) {
        if (lengths[i] >= target) return points[i];
    }
    return points[points.length - 1];
}

export function follow_path(robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: mikConstants[]) {
    if (points.length < 2) return true;

    const drive_p = p[0];
    const heading_p = p[1];

    const end = points[points.length - 1];
    const final_tangent = toDeg(Math.atan2(end.x - points[points.length - 2].x, end.y - points[points.length - 2].y));

    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, 0, 0, 0, 0);
        desired_heading = toDeg(Math.atan2(points[1].x - robot.getX(), points[1].y - robot.getY()));
        start = false;
    }

    if (drivePID.isSettled()) {
        reset_follow_path();
        return true;
    }

    const line_settled = is_line_settled(end.x, end.y, final_tangent, robot.getX(), robot.getY(), drive_p.exit_error);
    if (!(line_settled === prev_line_settled) && drive_p.min_voltage > 0) {
        reset_follow_path();
        return true;
    }

    prev_line_settled = line_settled;

    const lengths = cumulativeLengths(points);
    const idx = advanceClosestIdx(points, robot.getX(), robot.getY());
    const carrot = carrotPoint(points, lengths, idx);

    desired_heading = toDeg(Math.atan2(carrot.x - robot.getX(), carrot.y - robot.getY()));
    const reversed_heading = desired_heading + (drive_p.drive_direction === "reversed" ? 180 : 0);

    // Distance still to travel along the curve, not to the carrot, so the PID settles at the end
    const remaining_arc = lengths[lengths.length - 1] - lengths[idx];
    const straight_to_end = Math.hypot(end.x - robot.getX(), end.y - robot.getY());
    const drive_error = Math.max(remaining_arc, straight_to_end);

    let heading_error = reduce_negative_180_to_180(reversed_heading - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);

    const heading_scale_factor = Math.cos(toRad(reduce_negative_180_to_180(desired_heading - robot.getAngle())));

    drive_output *= heading_scale_factor;

    if (drive_error < DRIVE_LARGE_SETTLE_ERROR) {
        if (!heading_locked) {
            // A commanded end heading wins; without one the final tangent is held
            const target = end_angle ?? final_tangent;
            locked_heading = target + (drive_p.drive_direction === "reversed" && end_angle === null ? 180 : 0);
            heading_locked = true;
        }
        heading_error = reduce_negative_180_to_180(locked_heading - robot.getAngle());
    }

    if (drive_p.drive_direction === "fastest") {
        heading_error = reduce_negative_90_to_90(heading_error);
    }

    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drive_p.max_voltage, Math.abs(heading_scale_factor) * drive_p.max_voltage);
    heading_output = clamp(heading_output, -heading_p.max_voltage, heading_p.max_voltage);

    drive_output = slew_scaling(drive_output, prev_drive_output, drive_p.slew * (dt / 0.01), !heading_locked);
    heading_output = slew_scaling(heading_output, prev_heading_output, heading_p.slew * (dt / 0.01));

    if (drive_p.drive_direction === "forwards" && !heading_locked) drive_output = Math.max(drive_output, 0);
    else if (drive_p.drive_direction === "reversed" && !heading_locked) drive_output = Math.min(drive_output, 0);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);

    prev_drive_output = drive_output;
    prev_heading_output = heading_output;

    const leftVoltage = left_voltage_scaling(drive_output, heading_output) / 12;
    const rightVoltage = right_voltage_scaling(drive_output, heading_output) / 12;

    robot.tankDrive(leftVoltage, rightVoltage, dt);

    return false;
}
