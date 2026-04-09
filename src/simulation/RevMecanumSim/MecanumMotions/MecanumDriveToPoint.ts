import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { kMikLibSpeed } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling } from "../../mikLibSim/Util";
import type { RevMecanumConstants } from "../RevMecanumConstant";

let drivePID: PID;
let turnPID: PID;
let headingPID: PID;
let prev_line_settled: boolean = false;

let start = true;

function resetMecanumDriveToPose() {
    drivePID.reset();
    turnPID.reset();
    headingPID.reset();
    prev_line_settled = false;
    start = true;
}

export function mecanumDriveToPoint(robot: Robot, dt: number, x: number, y: number, drive_p: RevMecanumConstants, heading_p: RevMecanumConstants) {
    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, 0, 0, 0, 0);

        start = false;
    }

    if (drivePID.isSettled()) {
        resetMecanumDriveToPose();
        return true;
    }

    let desired_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
    
    const line_settled = is_line_settled(x, y, desired_heading, robot.getX(), robot.getY(), drive_p.exit_error);
    if (!(line_settled === prev_line_settled) && drive_p.min_voltage > 0) {
        resetMecanumDriveToPose();
        return true;
    }
    prev_line_settled = line_settled;

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    const heading_error = Math.atan2(y - robot.getY(), x - robot.getX());

    let turn_error = reduce_negative_180_to_180(desired_heading - robot.getAngle());
    if (drive_error < 6) {
        turn_error = 0;
    }

    const center_angle_error = reduce_negative_180_to_180(desired_heading - robot.getAngle());
    const heading_scale_factor = Math.cos(toRad(center_angle_error));
    const center_heading_error = reduce_negative_90_to_90(center_angle_error);

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);
    let center_drive_output = drive_output * heading_scale_factor;
    let center_heading_output = headingPID.compute(center_heading_error);

    drive_output = clamp(drive_output, -drive_p.maxSpeed, drive_p.maxSpeed);
    turn_output = clamp(turn_output, -heading_p.maxSpeed, heading_p.maxSpeed);
    center_drive_output = clamp(center_drive_output, -Math.abs(heading_scale_factor) * drive_p.maxSpeed, Math.abs(heading_scale_factor) * drive_p.maxSpeed);
    center_heading_output = clamp(center_heading_output, -heading_p.maxSpeed, heading_p.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);
    turn_output = clamp_min_voltage(turn_output, heading_p.min_voltage);
    center_drive_output = clamp_min_voltage(center_drive_output, drive_p.min_voltage);

    const left_center_voltage = left_voltage_scaling(center_drive_output, center_heading_output) / kMikLibSpeed;
    const right_center_voltage = right_voltage_scaling(center_drive_output, center_heading_output) / kMikLibSpeed;

    const left_front_output  = (drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) + turn_output) / kMikLibSpeed;
    const left_back_output   = (drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) + turn_output) / kMikLibSpeed;
    const right_back_output  = (drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) - turn_output) / kMikLibSpeed;
    const right_front_output = (drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) - turn_output) / kMikLibSpeed;

    robot.asteriskDrive(left_front_output, right_front_output, left_center_voltage, right_center_voltage, left_back_output, right_back_output, dt);

    return false;
}
