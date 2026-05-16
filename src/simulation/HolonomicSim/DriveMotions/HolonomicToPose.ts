import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, reduce_negative_180_to_180, slew_scaling } from "../../mikLibSim/Util";

let drivePID: PID;
let turnPID: PID;
let prev_drive_output: number = 0;
let prev_turn_output: number = 0;
let prev_line_settled: boolean = false;

let start = true;

function reset_holonomic_to_pose() {
    drivePID.reset();
    turnPID.reset();
    prev_line_settled = false;
    start = true;
}

export function holonomic_to_pose(robot: Robot, dt: number, x: number, y: number, angle: number, p: mikConstants[]) {
    const drive_p = p[0];
    const heading_p = p[1];
    
    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        start = false;
    }

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

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());

    const turn_error = reduce_negative_180_to_180(angle - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);

    drive_output = clamp(drive_output, -drive_p.max_voltage, drive_p.max_voltage);
    turn_output = clamp(turn_output, -heading_p.max_voltage, heading_p.max_voltage);

    drive_output = slew_scaling(drive_output, prev_drive_output, drive_p.slew * (dt / 0.01), Math.abs(drive_error) > drive_p.settle_error);
    turn_output = slew_scaling(turn_output, prev_turn_output, heading_p.slew * (dt / 0.01));

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);
    turn_output = clamp_min_voltage(turn_output, heading_p.min_voltage);

    const heading_error = Math.atan2(y - robot.getY(), x - robot.getX());

    const left_front_output  = (drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) + turn_output) / 12;
    const left_back_output   = (drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) + turn_output) / 12;
    const right_back_output  = (drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) - turn_output) / 12;
    const right_front_output = (drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) - turn_output) / 12;
    robot.mecanumDrive(left_front_output, right_front_output, left_back_output, right_back_output, dt);

    prev_drive_output = drive_output;
    prev_turn_output = turn_output;

    return false;
}
