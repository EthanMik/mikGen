import type { Robot } from "../../core/Robot";
import type { JarConstants } from "./JarConstants";
import { PID } from "./PID";
import { clamp, clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling, to_deg, to_rad } from "./util";

let turnPID_ta: PID;
let start_ta = true;

function reset_turn_to_angle() { start_ta = true; }

export function turn_to_angle(robot: Robot, dt: number, angle: number, constants: JarConstants[]): boolean {
    const turn = constants[0];

    if (start_ta) {
        turnPID_ta = new PID(reduce_negative_180_to_180(angle - robot.getAngle()), turn.kp, turn.ki, turn.kd, turn.starti, turn.settle_error, turn.settle_time, turn.timeout);
        start_ta = false;
    }

    if (turnPID_ta.is_settled()) {
        reset_turn_to_angle();
        return true;
    }

    const error = reduce_negative_180_to_180(angle - robot.getAngle());
    let output = turnPID_ta.compute(error);
    output = clamp(output, -turn.max_voltage, turn.max_voltage);

    robot.tankDrive(output / 12, -output / 12, dt);

    return false;
}

// --- drive_distance ---

let drivePID_dd: PID;
let headingPID_dd: PID;
let startX_dd = 0;
let startY_dd = 0;
let start_dd = true;

function reset_drive_distance() { start_dd = true; }

export function drive_distance(robot: Robot, dt: number, distance: number, heading: number | null, constants: JarConstants[]): boolean {
    const drive = constants[0];
    const heading_c = constants[1];
    if (heading === null) heading = robot.getAngle();

    if (start_dd) {
        startX_dd = robot.getX();
        startY_dd = robot.getY();
        drivePID_dd = new PID(distance, drive.kp, drive.ki, drive.kd, drive.starti, drive.settle_error, drive.settle_time, drive.timeout);
        headingPID_dd = new PID(reduce_negative_180_to_180(heading - robot.getAngle()), heading_c.kp, heading_c.ki, heading_c.kd, heading_c.starti);
        start_dd = false;
    }

    if (drivePID_dd.is_settled()) {
        reset_drive_distance();
        return true;
    }

    const dx = robot.getX() - startX_dd;
    const dy = robot.getY() - startY_dd;
    const dist_traveled = dx * Math.sin(to_rad(heading)) + dy * Math.cos(to_rad(heading));
    const drive_error = distance - dist_traveled;
    const heading_error = reduce_negative_180_to_180(heading - robot.getAngle());

    let drive_output = drivePID_dd.compute(drive_error);
    let heading_output = headingPID_dd.compute(heading_error);

    drive_output = clamp(drive_output, -drive.max_voltage, drive.max_voltage);
    heading_output = clamp(heading_output, -heading_c.max_voltage, heading_c.max_voltage);

    robot.tankDrive(
        left_voltage_scaling(drive_output, heading_output) / 12,
        right_voltage_scaling(drive_output, heading_output) / 12,
        dt
    );

    return false;
}

// --- swing_to_angle ---

let swingPID_s: PID;
let start_s = true;

function reset_swing() { start_s = true; }

export function swing_to_angle(robot: Robot, dt: number, angle: number, constants: JarConstants[]): boolean {
    const swing = constants[0];

    if (start_s) {
        swingPID_s = new PID(reduce_negative_180_to_180(angle - robot.getAngle()), swing.kp, swing.ki, swing.kd, swing.starti, swing.settle_error, swing.settle_time, swing.timeout);
        start_s = false;
    }

    if (swingPID_s.is_settled()) {
        reset_swing();
        return true;
    }

    const error = reduce_negative_180_to_180(angle - robot.getAngle());
    let output = swingPID_s.compute(error);
    output = clamp(output, -swing.max_voltage, swing.max_voltage);

    if (swing.swing_direction === "left") {
        robot.tankDrive(output / 12, 0, dt);
    } else {
        robot.tankDrive(0, -output / 12, dt);
    }

    return false;
}

// --- drive_to_point ---

let drivePID_dtp: PID;
let headingPID_dtp: PID;
let start_angle_dtp = 0;
let prev_line_settled_dtp = false;
let start_dtp = true;

function reset_drive_to_point() { start_dtp = true; }

export function drive_to_point(robot: Robot, dt: number, x: number, y: number, constants: JarConstants[]): boolean {
    const drive = constants[0];
    const heading_c = constants[1];

    if (start_dtp) {
        start_angle_dtp = to_deg(Math.atan2(x - robot.getX(), y - robot.getY()));
        drivePID_dtp = new PID(Math.hypot(x - robot.getX(), y - robot.getY()), drive.kp, drive.ki, drive.kd, drive.starti, drive.settle_error, drive.settle_time, drive.timeout);
        headingPID_dtp = new PID(start_angle_dtp - robot.getAngle(), heading_c.kp, heading_c.ki, heading_c.kd, heading_c.starti);
        prev_line_settled_dtp = is_line_settled(x, y, start_angle_dtp, robot.getX(), robot.getY());
        start_dtp = false;
    }

    if (drivePID_dtp.is_settled()) {
        reset_drive_to_point();
        return true;
    }

    const line_settled = is_line_settled(x, y, start_angle_dtp, robot.getX(), robot.getY());
    if (line_settled && !prev_line_settled_dtp) {
        reset_drive_to_point();
        return true;
    }
    prev_line_settled_dtp = line_settled;

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    let heading_error = reduce_negative_180_to_180(to_deg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle());
    let drive_output = drivePID_dtp.compute(drive_error);

    const heading_scale_factor = Math.cos(to_rad(heading_error));
    drive_output *= heading_scale_factor;
    heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID_dtp.compute(heading_error);

    if (drive_error < drive.settle_error) heading_output = 0;

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drive.max_voltage, Math.abs(heading_scale_factor) * drive.max_voltage);
    heading_output = clamp(heading_output, -heading_c.max_voltage, heading_c.max_voltage);
    drive_output = clamp_min_voltage(drive_output, drive.min_voltage);

    robot.tankDrive(
        left_voltage_scaling(drive_output, heading_output) / 12,
        right_voltage_scaling(drive_output, heading_output) / 12,
        dt
    );

    return false;
}

// --- drive_to_pose ---

let drivePID_dpose: PID;
let headingPID_dpose: PID;
let prev_line_settled_dpose = false;
let crossed_center_line_dpose = false;
let center_line_side_dpose = false;
let prev_center_line_side_dpose = false;
let start_dpose = true;

function reset_drive_to_pose() { start_dpose = true; }

export function drive_to_pose(robot: Robot, dt: number, x: number, y: number, angle: number, constants: JarConstants[]): boolean {
    const drive = constants[0];
    const heading_c = constants[1];

    if (start_dpose) {
        const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());
        drivePID_dpose = new PID(target_distance, drive.kp, drive.ki, drive.kd, drive.starti, drive.settle_error, drive.settle_time, drive.timeout);
        headingPID_dpose = new PID(to_deg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle(), heading_c.kp, heading_c.ki, heading_c.kd, heading_c.starti);
        prev_line_settled_dpose = is_line_settled(x, y, angle, robot.getX(), robot.getY());
        crossed_center_line_dpose = false;
        center_line_side_dpose = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
        prev_center_line_side_dpose = center_line_side_dpose;
        start_dpose = false;
    }

    if (drivePID_dpose.is_settled()) {
        reset_drive_to_pose();
        return true;
    }

    const line_settled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
    if (line_settled && !prev_line_settled_dpose) {
        reset_drive_to_pose();
        return true;
    }
    prev_line_settled_dpose = line_settled;

    center_line_side_dpose = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
    if (center_line_side_dpose !== prev_center_line_side_dpose) crossed_center_line_dpose = true;
    prev_center_line_side_dpose = center_line_side_dpose;

    const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());
    const carrot_X = x - Math.sin(to_rad(angle)) * (drive.lead * target_distance + drive.setback);
    const carrot_Y = y - Math.cos(to_rad(angle)) * (drive.lead * target_distance + drive.setback);

    let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY());
    let heading_error = reduce_negative_180_to_180(to_deg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle());

    if (drive_error < drive.settle_error || crossed_center_line_dpose || drive_error < drive.setback) {
        heading_error = reduce_negative_180_to_180(angle - robot.getAngle());
        drive_error = target_distance;
    }

    let drive_output = drivePID_dpose.compute(drive_error);
    const heading_scale_factor = Math.cos(to_rad(heading_error));
    drive_output *= heading_scale_factor;
    heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID_dpose.compute(heading_error);

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drive.max_voltage, Math.abs(heading_scale_factor) * drive.max_voltage);
    heading_output = clamp(heading_output, -heading_c.max_voltage, heading_c.max_voltage);
    drive_output = clamp_min_voltage(drive_output, drive.min_voltage);

    robot.tankDrive(
        left_voltage_scaling(drive_output, heading_output) / 12,
        right_voltage_scaling(drive_output, heading_output) / 12,
        dt
    );

    return false;
}

// --- turn_to_point ---

let turnPID_ttp: PID;
let start_ttp = true;

function reset_turn_to_point() { start_ttp = true; }

export function turn_to_point(robot: Robot, dt: number, x: number, y: number, extra_angle: number, constants: JarConstants[]): boolean {
    const turn = constants[0];

    if (start_ttp) {
        const initial_error = reduce_negative_180_to_180(to_deg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle());
        turnPID_ttp = new PID(initial_error, turn.kp, turn.ki, turn.kd, turn.starti, turn.settle_error, turn.settle_time, turn.timeout);
        start_ttp = false;
    }

    if (turnPID_ttp.is_settled()) {
        reset_turn_to_point();
        return true;
    }

    const error = reduce_negative_180_to_180(to_deg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle() + extra_angle);
    let output = turnPID_ttp.compute(error);
    output = clamp(output, -turn.max_voltage, turn.max_voltage);

    robot.tankDrive(output / 12, -output / 12, dt);

    return false;
}

// --- holonomic_drive_to_pose ---

let drivePID_holo: PID;
let turnPID_holo: PID;
let start_holo = true;

function reset_holonomic_drive_to_pose() { start_holo = true; }

export function holonomic_drive_to_pose(robot: Robot, dt: number, x: number, y: number, angle: number, constants: JarConstants[]): boolean {
    const drive = constants[0];
    const heading_c = constants[1];

    if (start_holo) {
        drivePID_holo = new PID(Math.hypot(x - robot.getX(), y - robot.getY()), drive.kp, drive.ki, drive.kd, drive.starti, drive.settle_error, drive.settle_time, drive.timeout);
        turnPID_holo = new PID(angle - robot.getAngle(), heading_c.kp, heading_c.ki, heading_c.kd, heading_c.starti, heading_c.settle_error, heading_c.settle_time, heading_c.timeout);
        start_holo = false;
    }

    if (drivePID_holo.is_settled() && turnPID_holo.is_settled()) {
        reset_holonomic_drive_to_pose();
        return true;
    }

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    const turn_error = reduce_negative_180_to_180(angle - robot.getAngle());

    let drive_output = drivePID_holo.compute(drive_error);
    let turn_output = turnPID_holo.compute(turn_error);

    drive_output = clamp(drive_output, -drive.max_voltage, drive.max_voltage);
    turn_output = clamp(turn_output, -heading_c.max_voltage, heading_c.max_voltage);

    const heading_error = Math.atan2(y - robot.getY(), x - robot.getX());
    const robot_heading_rad = to_rad(robot.getAngle());

    robot.mecanumDrive(
        (drive_output * Math.cos(robot_heading_rad + heading_error - Math.PI / 4) + turn_output) / 12,
        (drive_output * Math.cos(-robot_heading_rad - heading_error + 3 * Math.PI / 4) - turn_output) / 12,
        (drive_output * Math.cos(-robot_heading_rad - heading_error + 3 * Math.PI / 4) + turn_output) / 12,
        (drive_output * Math.cos(robot_heading_rad + heading_error - Math.PI / 4) - turn_output) / 12,
        dt
    );

    return false;
}
