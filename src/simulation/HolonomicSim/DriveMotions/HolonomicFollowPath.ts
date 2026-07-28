import type { Robot } from "../../../core/Robot";
import { resamplePolyline } from "../../../core/Types/Bezier";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, reduce_negative_180_to_180, slew_scaling } from "../../mikLibSim/Util";

/** Inches between path points, so an index step is a known arc length. */
const POINT_DENSITY = 1;
/** Inches along the path past the closest point that the carrot sits. */
const LOOKAHEAD_DISTANCE = 8;

let path_points: Coordinate[] = [];
let path_lengths: number[] = [];
let prev_drive_output: number = 0;
let prev_turn_output: number = 0;
let prev_line_settled: boolean = false;
let drivePID: PID;
let turnPID: PID;

let start = true;

export function reset_holonomic_follow_path() {
    drivePID?.reset();
    turnPID?.reset();
    path_points = [];
    path_lengths = [];
    prev_drive_output = 0;
    prev_turn_output = 0;
    prev_line_settled = false;
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

/** Heading of the path at a point, taken off the chord leaving it. */
function tangentAt(idx: number): number {
    const from = path_points[Math.min(idx, path_points.length - 2)];
    const to = path_points[Math.min(idx, path_points.length - 2) + 1];
    return toDeg(Math.atan2(to.x - from.x, to.y - from.y));
}

export function holonomic_follow_path(robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: mikConstants[]): boolean {
    if (points.length < 2) return true;

    const drive_p = p[0];
    const heading_p = p[1];

    if (start) {
        path_points = resamplePolyline(points, POINT_DENSITY);
        path_lengths = cumulativeLengths(path_points);
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        start = false;

        const end = path_points[path_points.length - 1];
        prev_line_settled = is_line_settled(end.x, end.y, tangentAt(path_points.length - 1), robot.getX(), robot.getY(), drive_p.exit_error);
    }

    if (drivePID.isSettled() && turnPID.isSettled()) {
        reset_holonomic_follow_path();
        return true;
    }

    const last = path_points.length - 1;
    const end = path_points[last];

    const closest = closestIdx(path_points, robot.getX(), robot.getY());
    const carrotIdx = carrotIdxFrom(closest);
    const carrot = path_points[carrotIdx];

    // The exit plane is fixed by the direction the path arrives from, not by the commanded heading,
    // since a holonomic chassis can cross it facing any way at all
    const line_settled = is_line_settled(end.x, end.y, tangentAt(last), robot.getX(), robot.getY(), drive_p.exit_error);
    if (!(line_settled === prev_line_settled) && drive_p.min_voltage > 0) {
        reset_holonomic_follow_path();
        return true;
    }
    prev_line_settled = line_settled;

    // Carrot distance plus the arc left beyond it, so the PID decelerates into the end of the path
    // rather than holding a constant lookahead sized error
    const drive_error = Math.hypot(carrot.x - robot.getX(), carrot.y - robot.getY()) + (path_lengths[last] - path_lengths[carrotIdx]);

    // Turning runs the whole way rather than only at the end. A commanded angle is held from the
    // first tick; without one the robot rides the tangent at the carrot, so it rotates into each
    // bend slightly before it arrives there.
    const desired_angle = end_angle ?? tangentAt(carrotIdx);
    const turn_error = reduce_negative_180_to_180(desired_angle - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);

    drive_output = clamp(drive_output, -drive_p.max_voltage, drive_p.max_voltage);
    turn_output = clamp(turn_output, -heading_p.max_voltage, heading_p.max_voltage);

    drive_output = slew_scaling(drive_output, prev_drive_output, drive_p.slew * (dt / 0.01), Math.abs(drive_error) > drive_p.settle_error);
    turn_output = slew_scaling(turn_output, prev_turn_output, heading_p.slew * (dt / 0.01));

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);
    turn_output = clamp_min_voltage(turn_output, heading_p.min_voltage);

    // Field relative direction of travel: the drive vector points at the carrot, the heading is free
    const heading_error = Math.atan2(carrot.y - robot.getY(), carrot.x - robot.getX());

    const left_front_output  = (drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) + turn_output) / 12;
    const left_back_output   = (drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) + turn_output) / 12;
    const right_back_output  = (drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) - turn_output) / 12;
    const right_front_output = (drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) - turn_output) / 12;
    robot.mecanumDrive(left_front_output, right_front_output, left_back_output, right_back_output, dt);

    prev_drive_output = drive_output;
    prev_turn_output = turn_output;

    return false;
}
