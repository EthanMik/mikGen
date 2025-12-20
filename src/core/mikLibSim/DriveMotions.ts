import { PID } from "./PID";
import { clamp, toDeg, toRad } from "../Util";
import type { Robot } from "../Robot";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling } from "./Util";

export function turnToAngle(robot: Robot, dt: number, angle: number, turnPID: PID) {
    const error = reduce_negative_180_to_180(angle - robot.getAngle());
    let output = turnPID.compute(error);
    
    if (turnPID.isSettled()) {
        robot.tankDrive(0, 0, dt);
        turnPID.reset();
        return true;
    }

    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    robot.tankDrive(output, -output, dt);

    return false;
}

export function turnToPoint(robot: Robot, dt: number, x: number, y: number, offset: number, turnPID: PID) {
    const error = reduce_negative_180_to_180(
        toDeg(Math.atan2(
            x - robot.getX(), 
            y - robot.getY())) 
            - robot.getAngle() + offset);
            
    let output = turnPID.compute(error);
    
    if (turnPID.isSettled()) {
        robot.tankDrive(0, 0, dt);
        turnPID.reset();
        return true;
    }

    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    robot.tankDrive(output, -output, dt);

    return false;
}

export function swingToAngle(robot: Robot, dt: number, angle: number, swingPID: PID) {
    const error = reduce_negative_180_to_180(angle - robot.getAngle());
    let output = swingPID.compute(error);

    if (swingPID.isSettled()) {
        robot.tankDrive(0, 0, dt);
        swingPID.reset();
        return true;
    }

    output = clamp(output, -swingPID.maxSpeed, swingPID.maxSpeed);
    robot.tankDrive(output, 0, dt);
    return false;
}

let driveDistanceStartPos: number | null = null;

export function driveDistance(robot: Robot, dt: number, distance: number, heading: number, drivePID: PID, headingPID: PID) {
    if (driveDistanceStartPos === null) {
        driveDistanceStartPos = Math.hypot(robot.getX(), robot.getY());
    }

    const currentPos = Math.hypot(robot.getX(), robot.getY());
    const traveled = currentPos - driveDistanceStartPos;

    const drive_error = distance - traveled;

    const heading_error = reduce_negative_180_to_180(heading - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -drivePID.maxSpeed, drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    if (drivePID.isSettled()) {
        robot.tankDrive(0, 0, dt);
        driveDistanceStartPos = null; 
        drivePID.reset();
        headingPID.reset();
        return true;
    }

    robot.tankDrive(drive_output + heading_output, drive_output - heading_output, dt);

    return false;
}

let prev_line_settled = false;

export function driveToPoint(robot: Robot, dt: number, x: number, y: number, drivePID: PID, headingPID: PID) {
    const heading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
    let drive_error = Math.hypot(x - robot.getX(), y - robot.getY());

    if (drivePID.isSettled()) {
        robot.tankDrive(0, 0, dt);
        drivePID.reset();
        headingPID.reset();
        return true
    }

    const line_settled = is_line_settled(x, y, heading, robot.getX(), robot.getY());
    if (line_settled && !prev_line_settled) { 
        drivePID.reset();
        headingPID.reset();
        prev_line_settled = false;
        return true; 
    }
    prev_line_settled = line_settled;

    drive_error = Math.hypot(x - robot.getX(), y - robot.getY());

    let heading_error = reduce_negative_180_to_180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle());
    let drive_output = drivePID.compute(drive_error);

    const heading_scale_factor = Math.cos(toRad(heading_error));
    drive_output *= heading_scale_factor;
    heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID.compute(heading_error);
    
    if (drive_error < drivePID.settleError) { heading_output = 0; }

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drivePID.maxSpeed, Math.abs(heading_scale_factor) * drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

    robot.tankDrive(left_voltage_scaling(drive_output, heading_output), right_voltage_scaling(drive_output, heading_output), dt);

    return false;
}

let pose_line_settled = false;
let pose_prev_line_settled = false;

let pose_crossed_center_line = false;

let pose_center_line_side = false;
let pose_prev_center_line_side = false;


export function drivetoPose(robot: Robot, dt: number, x: number, y: number, angle: number, drivePID: PID, headingPID: PID) {
    let target_distance = Math.hypot(x - robot.getX(), y - robot.getY());

    if (drivePID.isSettled()) {
        robot.tankDrive(0, 0, dt);
        drivePID.reset();
        headingPID.reset();
        pose_prev_line_settled = false;
        pose_prev_center_line_side = false;
        return true;
    }

    pose_line_settled = is_line_settled(x, y, angle, robot.getX(), robot.getY());

    if (pose_line_settled && !pose_prev_line_settled) {
        robot.tankDrive(0, 0, dt);
        drivePID.reset();
        headingPID.reset();
        pose_prev_line_settled = false;
        pose_prev_center_line_side = false;
        return true;
    }
    pose_prev_line_settled = pose_line_settled;

    pose_center_line_side = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
    pose_crossed_center_line = pose_center_line_side !== pose_prev_center_line_side;
    pose_prev_center_line_side = pose_center_line_side;

    target_distance = Math.hypot(x - robot.getX(), y - robot.getY());

    const carrot_X = x - Math.sin(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);
    const carrot_Y = y - Math.cos(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);

    let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY());
    let heading_error = reduce_negative_180_to_180(toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle());

    if (drive_error < drivePID.settleError || pose_crossed_center_line || drive_error < drivePID.setback) {
        heading_error = reduce_negative_180_to_180(angle - robot.getAngle());
        drive_error = target_distance;
    }

    let drive_output = drivePID.compute(drive_error);

    const heading_scale_factor = Math.cos(toRad(heading_error));
    drive_output *= heading_scale_factor;
    heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drivePID.maxSpeed, Math.abs(heading_scale_factor) * drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

    robot.tankDrive(left_voltage_scaling(drive_output, heading_output), right_voltage_scaling(drive_output, heading_output), dt);

    return false;
}
