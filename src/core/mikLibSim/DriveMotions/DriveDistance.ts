import { clamp, toRad } from "../../Util";
import type { Robot } from "../../Robot";
import { type mikConstants } from "../MikConstants";
import { PID } from "../PID";
import { clamp_min_voltage, reduce_negative_180_to_180, slew_scaling } from "../Util";

let driveDistanceStartX: number = 0;
let driveDistanceStartY: number = 0;
let prev_drive_output: number = 0;
let prev_heading_output: number = 0;
let drivePID: PID;
let headingPID: PID;

let start = true;

export function resetDriveDistance() {
    driveDistanceStartX = 0;
    driveDistanceStartY = 0;
    prev_drive_output = 0;
    prev_heading_output = 0;
    drivePID.reset();
    headingPID.reset();
    start = true;
}

export function driveDistance(robot: Robot, dt: number, distance: number, heading: number, drive_p: mikConstants, heading_p: mikConstants) {
    if (start) {
        driveDistanceStartX = robot.getX();
        driveDistanceStartY = robot.getY();
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, drive_p.min_voltage > 0 ? drive_p.exit_error : 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, heading_p.timeout, 0);
        start = false;
    }

    const dx = robot.getX() - driveDistanceStartX;
    const dy = robot.getY() - driveDistanceStartY;

    const traveled = dx * Math.sin(toRad(heading)) + dy * Math.cos(toRad(heading));

    const drive_error = distance - traveled;

    const heading_error = reduce_negative_180_to_180(heading - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -drive_p.maxSpeed, drive_p.maxSpeed);
    heading_output = clamp(heading_output, -heading_p.maxSpeed, heading_p.maxSpeed);

    drive_output = slew_scaling(drive_output, prev_drive_output ?? 0, drive_p.slew * (dt / 0.01), Math.abs(drive_error) > drive_p.settle_error);
    heading_output = slew_scaling(heading_output, prev_heading_output ?? 0, heading_p.slew * (dt / 0.01));

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);

    if (drivePID.isSettled()) {
        resetDriveDistance();
        return true;
    }

    robot.tankDrive((drive_output + heading_output) / 12, (drive_output - heading_output) / 12, dt);

    prev_drive_output = drive_output;
    prev_heading_output = heading_output;

    return false;
}
