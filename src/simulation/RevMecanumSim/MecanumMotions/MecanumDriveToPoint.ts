import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { kMikLibSpeed } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling } from "../../mikLibSim/Util";
import type { RevMecanumConstants } from "../RevMecanumConstant";

let desired_heading: number = 0;
let prev_line_settled: boolean = false;
let heading_locked: boolean = false;
let locked_heading: number = 0;
let drivePID: PID;
let headingPID: PID;

let start = true;

function resetMecanumDriveToPoint() {
    drivePID.reset();
    headingPID.reset();
    desired_heading = 0;
    prev_line_settled = false;
    heading_locked = false;
    locked_heading = 0;
    start = true;
}

export function mecanumDriveToPoint(robot: Robot, dt: number, x: number, y: number, drive_p: RevMecanumConstants, heading_p: RevMecanumConstants) {
    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, heading_p.timeout, 0);
        desired_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
        start = false;
    }

    if (drivePID.isSettled()) {
        resetMecanumDriveToPoint();
        return true;
    }

    const line_settled = is_line_settled(x, y, desired_heading, robot.getX(), robot.getY(), drive_p.exit_error);
    if (!(line_settled === prev_line_settled) && drive_p.min_voltage > 0) {
        resetMecanumDriveToPoint();
        return true;
    }
    prev_line_settled = line_settled;

    desired_heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());

    let heading_error = reduce_negative_180_to_180(desired_heading - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);

    const heading_scale_factor = Math.cos(toRad(heading_error));
    drive_output *= heading_scale_factor;

    if (drive_error < 6) {
        if (!heading_locked) {
            locked_heading = desired_heading;
            heading_locked = true;
        }
        heading_error = reduce_negative_180_to_180(locked_heading - robot.getAngle());
    }

    heading_error = reduce_negative_90_to_90(heading_error);

    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drive_p.maxSpeed, Math.abs(heading_scale_factor) * drive_p.maxSpeed);
    heading_output = clamp(heading_output, -heading_p.maxSpeed, heading_p.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);

    const left_output = left_voltage_scaling(drive_output, heading_output) / kMikLibSpeed;
    const right_output = right_voltage_scaling(drive_output, heading_output) / kMikLibSpeed;

    robot.asteriskDrive(left_output, right_output, left_output, right_output, left_output, right_output, dt);

    return false;
}
