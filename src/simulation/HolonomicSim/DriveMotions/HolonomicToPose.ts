import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, reduce_negative_180_to_180, slew_scaling } from "../../mikLibSim/Util";

let line_start_x: number = 0;
let line_start_y: number = 0;
let line_angle: number = 0;
let prev_drive_output: number = 0;
let prev_turn_output: number = 0;
let prev_turn_error: number = 0;
let prev_line_settled: boolean = false;
let crossed: boolean = false;
let drivePID: PID;
let turnPID: PID;
let translationalPID: PID;

let start = true;

export function reset_holonomic_to_pose() {
    drivePID?.reset();
    turnPID?.reset();
    translationalPID?.reset();
    line_start_x = 0;
    line_start_y = 0;
    line_angle = 0;
    prev_drive_output = 0;
    prev_turn_output = 0;
    prev_turn_error = 0;
    prev_line_settled = false;
    crossed = false;
    start = true;
}

export function holonomic_to_pose(robot: Robot, dt: number, x: number, y: number, angle: number, p: mikConstants[]) {
    const drive_p = p[0];
    const heading_p = p[1];
    const trans_p = p[2];

    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        translationalPID = new PID(trans_p.kp, trans_p.ki, trans_p.kd, trans_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        line_start_x = robot.getX();
        line_start_y = robot.getY();
        line_angle = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
        start = false;
    }

    if ((drivePID.isSettled() && (turnPID.isSettled() || (drive_p.min_voltage > 0 && crossed)))) {
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

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    const turn_error = reduce_negative_180_to_180(angle - robot.getAngle());
    const cross_error = (robot.getY() - line_start_y) * Math.sin(toRad(line_angle)) - (robot.getX() - line_start_x) * Math.cos(toRad(line_angle));

    crossed = Math.sign(turn_error) !== Math.sign(prev_turn_error);
    prev_turn_error = turn_error;

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);
    let trans_output = translationalPID.compute(cross_error);

    drive_output = clamp(drive_output, -drive_p.max_voltage, drive_p.max_voltage);
    turn_output = clamp(turn_output, -heading_p.max_voltage, heading_p.max_voltage);
    trans_output = clamp(trans_output, -drive_p.max_voltage, drive_p.max_voltage);

    drive_output = slew_scaling(drive_output, prev_drive_output, drive_p.slew, Math.abs(drive_error) > drive_p.settle_error);
    turn_output = slew_scaling(turn_output, prev_turn_output, heading_p.slew);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);
    turn_output = clamp_min_voltage(turn_output, drive_p.min_voltage);

    const drive_x = drive_output * Math.sin(toRad(desired_heading));
    const drive_y = drive_output * Math.cos(toRad(desired_heading));
    const cross_x = trans_output * Math.cos(toRad(line_angle));
    const cross_y = -trans_output * Math.sin(toRad(line_angle));

    let total_x = drive_x + cross_x;
    let total_y = drive_y + cross_y;

    if (Math.hypot(total_x, total_y) > drive_p.max_voltage) {
        const alignment = cross_x * drive_x + cross_y * drive_y;
        const overshoot = trans_output * trans_output - drive_p.max_voltage * drive_p.max_voltage;
        const drive_scale = clamp((Math.sqrt(alignment * alignment - drive_output * drive_output * overshoot) - alignment) / (drive_output * drive_output), 0, 1);
        total_x = drive_x * drive_scale + cross_x;
        total_y = drive_y * drive_scale + cross_y;
    }

    const total_voltage = Math.hypot(total_x, total_y);
    const total_angle = Math.atan2(total_y, total_x);

    prev_drive_output = drive_output;
    prev_turn_output = turn_output;

    const forward_diagonal = total_voltage * Math.cos(toRad(robot.getAngle()) + total_angle - Math.PI / 4);
    const reverse_diagonal = total_voltage * Math.cos(-toRad(robot.getAngle()) - total_angle + 3 * Math.PI / 4);

    robot.mecanumDrive(
        (forward_diagonal + turn_output) / 12,
        (reverse_diagonal - turn_output) / 12,
        (reverse_diagonal + turn_output) / 12,
        (forward_diagonal - turn_output) / 12,
        dt
    );

    return false;
}
