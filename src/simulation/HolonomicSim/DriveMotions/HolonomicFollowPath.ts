import type { Robot } from "../../../core/Robot";
import { resamplePolyline } from "../../../core/Types/Bezier";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, reduce_negative_180_to_180, slew_scaling } from "../../mikLibSim/Util";

/** Inches between path points, so an index step is a known arc length. */
const POINT_DENSITY = 1;

/**
 * TUNE. Scales the inward force held on a curve: output = scale * v_tangential^2 * curvature.
 * This is what replaces the lookahead. Too low and the robot drifts outward on curves, too high
 * and it oversteers into them. Tune on a constant-radius arc at a fixed speed — the right value
 * makes cross-track error flat rather than growing with speed. Robot mass is folded in here.
 */
const CENTRIPETAL_SCALING = 0.02;

/** TUNE. Perpendicular pull back onto the path. Can be stiff — it never acts along the path. */
const TRANSLATIONAL_KP = 3.5;
const TRANSLATIONAL_KI = 0;
const TRANSLATIONAL_KD = 0;
const TRANSLATIONAL_STARTI = 0;

/** Points either side of the sample used for curvature. A 1" spacing is too noisy for a 3-point stencil. */
const CURVATURE_STENCIL = 3;

/** Inches from either end of the path where translational correction regains full 2D authority. */
const FULL_CORRECTION_ZONE = 1.0;

/**
 * Points past the closest point used only for the heading target. 0 matches Pedro. Raising it
 * restores the early rotation into bends that the carrot used to give, without putting a lookahead
 * back into the path geometry.
 */
const HEADING_PREVIEW_POINTS = 0;

let path_points: Coordinate[] = [];
let path_lengths: number[] = [];
let prev_drive_output: number = 0;
let prev_turn_output: number = 0;
let prev_line_settled: boolean = false;
let prev_x: number = 0;
let prev_y: number = 0;
let have_prev_pose: boolean = false;
let drivePID: PID;
let turnPID: PID;
let translationalPID: PID;

let start = true;

export function reset_holonomic_follow_path() {
    drivePID?.reset();
    turnPID?.reset();
    translationalPID?.reset();
    path_points = [];
    path_lengths = [];
    prev_drive_output = 0;
    prev_turn_output = 0;
    prev_line_settled = false;
    prev_x = 0;
    prev_y = 0;
    have_prev_pose = false;
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

/**
 * Rescanned every tick rather than advanced from where it was last time. A stored index that only
 * moves forward strands the robot when it overshoots or gets pushed off the curve, leaving it no
 * way back onto the path.
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

/**
 * Refines the best vertex to a continuous foot point by projecting onto the two adjacent segments.
 * Without a lookahead to smooth it over, the 1" quantization of a raw vertex lands directly in the
 * cross-track error.
 */
function refineClosest(idx: number, x: number, y: number): { point: Coordinate; s: number } {
    let best = { point: path_points[idx], s: path_lengths[idx] };
    let bestDist = Infinity;
    for (const i of [idx - 1, idx]) {
        if (i < 0 || i >= path_points.length - 1) continue;
        const a = path_points[i];
        const b = path_points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const segLen2 = dx * dx + dy * dy;
        if (segLen2 < 1e-12) continue;
        const u = clamp(((x - a.x) * dx + (y - a.y) * dy) / segLen2, 0, 1);
        const px = a.x + u * dx;
        const py = a.y + u * dy;
        const dist = Math.hypot(px - x, py - y);
        if (dist < bestDist) {
            bestDist = dist;
            best = { point: { x: px, y: py }, s: path_lengths[i] + u * Math.sqrt(segLen2) };
        }
    }
    return best;
}

/** Heading of the path at a point, taken off the chord leaving it. Compass convention, degrees. */
function tangentAt(idx: number): number {
    const from = path_points[Math.min(idx, path_points.length - 2)];
    const to = path_points[Math.min(idx, path_points.length - 2) + 1];
    return toDeg(Math.atan2(to.x - from.x, to.y - from.y));
}

/** The same tangent as a field-relative bearing, radians CCW from +x, matching the drive mixing. */
function tangentBearingAt(idx: number): number {
    const i = Math.min(idx, path_points.length - 2);
    return Math.atan2(path_points[i + 1].y - path_points[i].y, path_points[i + 1].x - path_points[i].x);
}

/** Signed curvature from a symmetric stencil; positive is a left-hand bend. */
function curvatureAt(idx: number): number {
    if (path_points.length < 2 * CURVATURE_STENCIL + 1) return 0;
    const i = clamp(idx, CURVATURE_STENCIL, path_points.length - 1 - CURVATURE_STENCIL);
    const prev = path_points[i - CURVATURE_STENCIL];
    const cur = path_points[i];
    const next = path_points[i + CURVATURE_STENCIL];
    const h = CURVATURE_STENCIL * POINT_DENSITY;

    const dx = (next.x - prev.x) / (2 * h);
    const dy = (next.y - prev.y) / (2 * h);
    const ddx = (next.x - 2 * cur.x + prev.x) / (h * h);
    const ddy = (next.y - 2 * cur.y + prev.y) / (h * h);

    const speed = Math.hypot(dx, dy);
    if (speed < 1e-9) return 0;
    return (dx * ddy - dy * ddx) / (speed * speed * speed);
}

/**
 * Solves for the scale on a variable vector that puts its sum with a fixed vector exactly on the
 * max magnitude circle. Lets the drive term be scaled down under saturation while correction keeps
 * its full authority, rather than scaling both down equally.
 */
function normalizingScale(staticX: number, staticY: number, varX: number, varY: number, max: number): number {
    const a = varX * varX + varY * varY;
    if (a < 1e-12) return 0;
    const b = staticX * varX + staticY * varY;
    const c = staticX * staticX + staticY * staticY - max * max;
    const disc = b * b - a * c;
    if (disc < 0) return 0;
    return clamp((-b + Math.sqrt(disc)) / a, 0, 1);
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
        // Never queried for isSettled — the drive and turn PIDs alone decide when the move is done.
        translationalPID = new PID(TRANSLATIONAL_KP, TRANSLATIONAL_KI, TRANSLATIONAL_KD, TRANSLATIONAL_STARTI, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        start = false;
        have_prev_pose = false;

        const end = path_points[path_points.length - 1];
        prev_line_settled = is_line_settled(end.x, end.y, tangentAt(path_points.length - 1), robot.getX(), robot.getY(), drive_p.exit_error);
    }

    if (drivePID.isSettled() && turnPID.isSettled()) {
        reset_holonomic_follow_path();
        return true;
    }

    const last = path_points.length - 1;
    const end = path_points[last];

    // Closest point on the path, refined to a continuous foot. Everything downstream keys off this
    // point — there is no carrot, so its precision sets the tracking floor.
    const closest = closestIdx(path_points, robot.getX(), robot.getY());
    const { point: foot, s: distanceAlong } = refineClosest(closest, robot.getX(), robot.getY());
    const tangent = tangentBearingAt(closest);
    const tx = Math.cos(tangent);
    const ty = Math.sin(tangent);

    const vx = have_prev_pose && dt > 0 ? (robot.getX() - prev_x) / dt : 0;
    const vy = have_prev_pose && dt > 0 ? (robot.getY() - prev_y) / dt : 0;
    const tangentialSpeed = vx * tx + vy * ty;

    // The exit plane is fixed by the direction the path arrives from, not by the commanded heading,
    // since a holonomic chassis can cross it facing any way at all
    const line_settled = is_line_settled(end.x, end.y, tangentAt(last), robot.getX(), robot.getY(), drive_p.exit_error);
    if (!(line_settled === prev_line_settled) && drive_p.min_voltage > 0) {
        reset_holonomic_follow_path();
        return true;
    }
    prev_line_settled = line_settled;

    // Arc length left from the closest point. This owns progress along the path and nothing else.
    const drive_error = path_lengths[last] - distanceAlong;

    // Cross-track error owns getting back onto the path and nothing else.
    let errX = foot.x - robot.getX();
    let errY = foot.y - robot.getY();
    const atPathEnd = distanceAlong <= FULL_CORRECTION_ZONE || distanceAlong >= path_lengths[last] - FULL_CORRECTION_ZONE;
    if (!atPathEnd) {
        // At a true perpendicular foot this is already zero — it strips residue from the segment
        // projection. Skipped near the ends, where the foot is clamped and the robot needs full 2D
        // authority to settle onto the endpoint.
        const along = errX * tx + errY * ty;
        errX -= along * tx;
        errY -= along * ty;
    }
    const cross_error = Math.hypot(errX, errY);

    // Turning runs the whole way rather than only at the end. A commanded angle is held from the
    // first tick; without one the robot rides the tangent at the closest point.
    const desired_angle = end_angle ?? tangentAt(Math.min(closest + HEADING_PREVIEW_POINTS, last));
    const turn_error = reduce_negative_180_to_180(desired_angle - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);
    let trans_output = translationalPID.compute(cross_error);

    drive_output = clamp(drive_output, -drive_p.max_voltage, drive_p.max_voltage);
    turn_output = clamp(turn_output, -heading_p.max_voltage, heading_p.max_voltage);
    trans_output = clamp(trans_output, -drive_p.max_voltage, drive_p.max_voltage);

    // Slew only the drive term. Correction is left free to react on the tick it is needed.
    drive_output = slew_scaling(drive_output, prev_drive_output, drive_p.slew * (dt / 0.01), Math.abs(drive_error) > drive_p.settle_error);
    turn_output = slew_scaling(turn_output, prev_turn_output, heading_p.slew * (dt / 0.01));

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);
    turn_output = clamp_min_voltage(turn_output, heading_p.min_voltage);

    // The inward force needed to hold the arc, applied before any error appears. Curvature carries
    // the sign, so a right-hand bend flips this vector automatically.
    const cent_output = clamp(CENTRIPETAL_SCALING * tangentialSpeed * tangentialSpeed * curvatureAt(closest), -drive_p.max_voltage, drive_p.max_voltage);
    const centDir = tangent + Math.PI / 2;
    const transDir = Math.atan2(errY, errX);

    // Corrective is capped on its own first, centripetal winning over translational, so staying on
    // the path is never diluted by power spent making progress along it.
    let corr_x = cent_output * Math.cos(centDir) + trans_output * Math.cos(transDir);
    let corr_y = cent_output * Math.sin(centDir) + trans_output * Math.sin(transDir);
    const corr_mag = Math.hypot(corr_x, corr_y);
    if (corr_mag > drive_p.max_voltage) {
        const transScale = normalizingScale(cent_output * Math.cos(centDir), cent_output * Math.sin(centDir), trans_output * Math.cos(transDir), trans_output * Math.sin(transDir), drive_p.max_voltage);
        corr_x = cent_output * Math.cos(centDir) + trans_output * Math.cos(transDir) * transScale;
        corr_y = cent_output * Math.sin(centDir) + trans_output * Math.sin(transDir) * transScale;
    }

    // Drive is added last and scaled down until the total fits.
    let total_x = corr_x + drive_output * tx;
    let total_y = corr_y + drive_output * ty;
    if (Math.hypot(total_x, total_y) > drive_p.max_voltage) {
        const driveScale = normalizingScale(corr_x, corr_y, drive_output * tx, drive_output * ty, drive_p.max_voltage);
        total_x = corr_x + drive_output * tx * driveScale;
        total_y = corr_y + drive_output * ty * driveScale;
    }

    // Field relative direction of travel: the drive vector is the summed correction and pathing
    // power, the heading is free
    const drive_magnitude = Math.hypot(total_x, total_y);
    const heading_error = Math.atan2(total_y, total_x);

    const left_front_output  = (drive_magnitude * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) + turn_output) / 12;
    const left_back_output   = (drive_magnitude * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) + turn_output) / 12;
    const right_back_output  = (drive_magnitude * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) - turn_output) / 12;
    const right_front_output = (drive_magnitude * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) - turn_output) / 12;
    robot.mecanumDrive(left_front_output, right_front_output, left_back_output, right_back_output, dt);

    prev_drive_output = drive_output;
    prev_turn_output = turn_output;
    prev_x = robot.getX();
    prev_y = robot.getY();
    have_prev_pose = true;

    return false;
}