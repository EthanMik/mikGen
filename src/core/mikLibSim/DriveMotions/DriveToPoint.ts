import type { Robot } from "../../Robot";
import { clamp, toDeg, toRad } from "../../Util";
import { kMikLibSpeed } from "../MikConstants";
import type { PID } from "../PID";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling, slew_scaling } from "../Util";

let pointStartHeading: number | null = null;
let pointPrevLineSettled: boolean | null = null;
let prevDriveOutput: number | null = null;
let prevHeadingOutput: number | null = null;

function exitDriveToPoint(drivePID: PID, headingPID: PID) {
    drivePID.reset();
    headingPID.reset();
    pointStartHeading = null;
    pointPrevLineSettled = null;
    prevHeadingOutput = null;
    prevDriveOutput = null;
    return true;
}

export function driveToPoint(robot: Robot, dt: number, x: number, y: number, drivePID: PID, headingPID: PID) {
    const dx = x - robot.getX();
    const dy = y - robot.getY();
    const headingToPoint = toDeg(Math.atan2(dx, dy));

    if (pointStartHeading === null) {
        pointStartHeading = toDeg(Math.atan2(dx, dy));
        pointPrevLineSettled = is_line_settled(x, y, pointStartHeading, robot.getX(), robot.getY());
    }

    if (drivePID.isSettled()) {
        return exitDriveToPoint(drivePID, headingPID);
    }

    const line_settled = is_line_settled(x, y, pointStartHeading, robot.getX(), robot.getY());
    if (line_settled && !pointPrevLineSettled!) {
        return exitDriveToPoint(drivePID, headingPID);
    }
    pointPrevLineSettled = line_settled;

    const drive_error = Math.hypot(dx, dy);

    let desiredHeading = headingToPoint;
    let driveSign = 1;

    if (drivePID.driveDirection === "reverse") {
        desiredHeading = reduce_negative_180_to_180(headingToPoint + 180);
        driveSign = -1;
    }

    let heading_error = reduce_negative_180_to_180(desiredHeading - robot.getAngle());
    let drive_output = drivePID.compute(drive_error);

    let heading_scale_factor = Math.cos(toRad(heading_error));
    if (drivePID.driveDirection !== null) heading_scale_factor = Math.max(0, heading_scale_factor);

    drive_output *= heading_scale_factor * driveSign;
    if (drivePID.driveDirection === null) heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID.compute(heading_error);

    let close: boolean = false;

    if (drive_error < drivePID.settleError) {
        heading_output = 0;
        close = true
    }

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drivePID.maxSpeed, Math.abs(heading_scale_factor) * drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);
    
    drive_output = !close ? slew_scaling(drive_output, prevDriveOutput ?? 0, drivePID.slew * (dt / 0.01)) : drive_output; // normalizes dt from 16ms to 10ms to match mikLib
    heading_output = slew_scaling(heading_output, prevHeadingOutput ?? 0, headingPID.slew * (dt / 0.01));
    
    drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

    prevDriveOutput = drive_output;
    prevHeadingOutput = heading_output;

    robot.tankDrive(left_voltage_scaling(drive_output, heading_output) / kMikLibSpeed, right_voltage_scaling(drive_output, heading_output) / kMikLibSpeed, dt);

    return false;
}
