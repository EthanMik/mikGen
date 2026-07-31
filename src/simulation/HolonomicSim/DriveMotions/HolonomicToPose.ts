import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, reduce_negative_180_to_180, slew_scaling } from "../../mikLibSim/Util";

/**
 * TUNE. Perpendicular pull back onto the line the move committed to. Can be stiff, since it never
 * acts along that line: it only ever closes the sideways offset, never the remaining distance.
 * Matches the follower's gain so the same push off course recovers the same way in either motion.
 */
const TRANSLATIONAL_KP = 1.2;
const TRANSLATIONAL_KI = 0;
const TRANSLATIONAL_KD = 0;
const TRANSLATIONAL_STARTI = 0;

let drivePID: PID;
let turnPID: PID;
let translationalPID: PID;
let prev_drive_output: number = 0;
let prev_turn_output: number = 0;
let prev_line_settled: boolean = false;
/** Where the move began. With the target this fixes the straight line the robot is held to. */
let line_start_x: number = 0;
let line_start_y: number = 0;

let start = true;

export function reset_holonomic_to_pose() {
    drivePID?.reset();
    turnPID?.reset();
    translationalPID?.reset();
    prev_drive_output = 0;
    prev_turn_output = 0;
    prev_line_settled = false;
    line_start_x = 0;
    line_start_y = 0;
    start = true;
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

export function holonomic_to_pose(robot: Robot, dt: number, x: number, y: number, angle: number, p: mikConstants[]) {
    const drive_p = p[0];
    const heading_p = p[1];

    if (start) {
        line_start_x = robot.getX();
        line_start_y = robot.getY();
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        translationalPID = new PID(TRANSLATIONAL_KP, TRANSLATIONAL_KI, TRANSLATIONAL_KD, TRANSLATIONAL_STARTI, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        start = false;
    }

    // Correction is never queried for isSettled, so it can never end the move early or hold it open
    if ((drivePID.isSettled() && turnPID.isSettled())) {
        reset_holonomic_to_pose();
        return true;
    }

    const desired_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));

    const line_settled = is_line_settled(x, y, desired_heading, robot.getX(), robot.getY(), drive_p.exit_error);
    if (!(line_settled === prev_line_settled) && drive_p.min_voltage > 0) {
        reset_holonomic_to_pose();
        return true;
    }
    prev_line_settled = line_settled;

    // Drive owns closing on the pose and keeps full 2D authority, so the settle stays a real
    // distance to the target rather than progress along a line the robot may have been pushed off
    const to_target_x = x - robot.getX();
    const to_target_y = y - robot.getY();
    const drive_error = Math.hypot(to_target_x, to_target_y);

    const turn_error = reduce_negative_180_to_180(angle - robot.getAngle());

    // Foot of the robot on the committed line, projected without clamping so the offset stays purely
    // perpendicular even once the robot is past the target. Driving at the pose alone leaves the
    // robot free to arc in from wherever a push put it; this is what holds it to the straight line.
    const line_dx = x - line_start_x;
    const line_dy = y - line_start_y;
    const line_length = Math.hypot(line_dx, line_dy);

    let cross_x = 0;
    let cross_y = 0;
    if (line_length > 1e-6) {
        const tx = line_dx / line_length;
        const ty = line_dy / line_length;
        const along = (robot.getX() - line_start_x) * tx + (robot.getY() - line_start_y) * ty;
        cross_x = line_start_x + along * tx - robot.getX();
        cross_y = line_start_y + along * ty - robot.getY();
    }
    const cross_error = Math.hypot(cross_x, cross_y);

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

    // Both terms are the PID output laid along a unit vector: drive at the pose, correction at the line
    const drive_scale = drive_error > 1e-9 ? drive_output / drive_error : 0;
    const corr_scale = cross_error > 1e-9 ? trans_output / cross_error : 0;
    const drive_vec_x = to_target_x * drive_scale;
    const drive_vec_y = to_target_y * drive_scale;
    const corr_x = cross_x * corr_scale;
    const corr_y = cross_y * corr_scale;

    // Drive is added last and scaled down until the total fits, so staying on the line is never
    // diluted by power spent making progress along it
    let total_x = corr_x + drive_vec_x;
    let total_y = corr_y + drive_vec_y;
    if (Math.hypot(total_x, total_y) > drive_p.max_voltage) {
        const driveScale = normalizingScale(corr_x, corr_y, drive_vec_x, drive_vec_y, drive_p.max_voltage);
        total_x = corr_x + drive_vec_x * driveScale;
        total_y = corr_y + drive_vec_y * driveScale;
    }

    // Field relative direction of travel: the drive vector is the summed correction and closing
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

    return false;
}
