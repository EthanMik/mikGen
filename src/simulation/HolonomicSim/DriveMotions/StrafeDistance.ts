import type { Robot } from "../../../core/Robot";
import { clamp, toRad } from "../../../core/Util";
import { type mikConstants } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, reduce_negative_180_to_180, slew_scaling } from "../../mikLibSim/Util";

let driveDistanceStartX: number = 0;
let driveDistanceStartY: number = 0;
let prev_drive_output: number = 0;
let prev_heading_output: number = 0;
let drivePID: PID;
let headingPID: PID;

let start = true;

function reset_strafe_distance() {
    driveDistanceStartX = 0;
    driveDistanceStartY = 0;
    prev_drive_output = 0;
    prev_heading_output = 0;
    drivePID.reset();
    headingPID.reset();
    start = true;
}

export function strafe_distance(robot: Robot, dt: number, distance: number, heading: number | null, p: mikConstants[]) {
    const drive_p = p[0];
    const heading_p = p[1];
    if (heading === null) heading = robot.getAngle();

    if (start) {
        driveDistanceStartX = robot.getX();
        driveDistanceStartY = robot.getY();
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, drive_p.min_voltage > 0 ? drive_p.exit_error : 0);
        headingPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, 0, 0, 0, 0);
        start = false;
    }

    const dx = robot.getX() - driveDistanceStartX;
    const dy = robot.getY() - driveDistanceStartY;

    const traveled = dx * Math.cos(toRad(heading)) - dy * Math.sin(toRad(heading));

    const drive_error = distance - traveled;

    const heading_error = reduce_negative_180_to_180(heading - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -drive_p.max_voltage, drive_p.max_voltage);
    heading_output = clamp(heading_output, -heading_p.max_voltage, heading_p.max_voltage);

    drive_output = slew_scaling(drive_output, prev_drive_output ?? 0, drive_p.slew * (dt / 0.01), Math.abs(drive_error) > drive_p.settle_error);
    heading_output = slew_scaling(heading_output, prev_heading_output ?? 0, heading_p.slew * (dt / 0.01));

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);

    if (drivePID.isSettled()) {
        reset_strafe_distance();
        return true;
    }

    robot.mecanumDrive(
        ( drive_output + heading_output) / 12,
        (-drive_output - heading_output) / 12,
        (-drive_output + heading_output) / 12,
        ( drive_output - heading_output) / 12,
        dt
    );

    prev_drive_output = drive_output;
    prev_heading_output = heading_output;

    return false;
}
