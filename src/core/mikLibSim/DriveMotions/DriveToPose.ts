import type { Robot } from "../../Robot";
import { clamp, toDeg, toRad } from "../../Util";
import { kMikLibSpeed } from "../MikConstants";
import type { PID } from "../PID";
import { clamp_max_slip, clamp_min_voltage, is_line_settled, left_voltage_scaling, overturn_scaling, reduce_negative_180_to_180, right_voltage_scaling, slew_scaling } from "../Util";

let posePrevLineSettled: boolean | null = null;
let poseInitCenterLineSide: boolean | null = null;
let posePrevDriveOutput: number | null = null;
let poseCloseMaxSpeed: number | null = null;
let poseIsReversing: boolean | null = null;
let crossed_center_line = false;

function resetDriveToPose(drivePID: PID, headingPID: PID) {
    drivePID.reset();
    headingPID.reset();
    posePrevLineSettled = null;
    poseInitCenterLineSide = null;
    posePrevDriveOutput = null;
    poseCloseMaxSpeed = null;
    poseIsReversing = null;
    crossed_center_line = false;
}

export function driveToPose(robot: Robot, dt: number, x: number, y: number, angle: number, drivePID: PID, headingPID: PID): boolean {
  if (posePrevLineSettled === null || poseInitCenterLineSide === null) {
    posePrevLineSettled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
    poseInitCenterLineSide = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
  }

  if (drivePID.isSettled()) {
    resetDriveToPose(drivePID, headingPID);
    return true;
  }

  const centerSide = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
  if (centerSide != poseInitCenterLineSide) {
    crossed_center_line = true;
  }

  const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());

  const carrot_X = x - Math.sin(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);
  const carrot_Y = y - Math.cos(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);

  let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY());
  const heading_error_raw = reduce_negative_180_to_180(toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle());

  let isClose = false;
  if (drive_error < drivePID.settleError || crossed_center_line || drive_error < drivePID.setback) {
    drive_error = target_distance;
    if (poseCloseMaxSpeed === null) {
      poseIsReversing = drivePID.driveDirection === "reverse" || (drivePID.driveDirection === null && (posePrevDriveOutput ?? 0) < 0);
      poseCloseMaxSpeed = Math.max(Math.abs(posePrevDriveOutput ?? 0), 6);
    }
    isClose = true;
  }

  // heading_error for heading PID — direction-adjusted in both modes (mirrors moveToPose's adjustedRobotTheta)
  let heading_error: number;
  if (isClose) {
    const adjustedRobotAngle = (poseIsReversing ?? false) ? robot.getAngle() + 180 : robot.getAngle();
    heading_error = reduce_negative_180_to_180(angle - adjustedRobotAngle);
  } else if (drivePID.driveDirection === "reverse") {
    heading_error = reduce_negative_180_to_180(heading_error_raw - 180);
  } else {
    heading_error = heading_error_raw;
  }

  const pose_line_settled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
  if (isClose && drivePID.minSpeed !== 0 && pose_line_settled && !posePrevLineSettled) {
    resetDriveToPose(drivePID, headingPID);
    return true;
  }
  posePrevLineSettled = pose_line_settled;

  const effectiveMaxSpeed = isClose ? (poseCloseMaxSpeed ?? drivePID.maxSpeed) : drivePID.maxSpeed;

  let drive_output = drivePID.compute(drive_error);

  if (isClose) {
    const dir_to_target = reduce_negative_180_to_180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle());
    drive_output *= Math.cos(toRad(dir_to_target));
  } else {
    drive_output *= Math.sign(Math.cos(toRad(heading_error_raw)));
  }

  // direction forcing — mirrors moveToPose lines 127-128
  if (drivePID.driveDirection === "forward" && !isClose) drive_output = Math.max(drive_output, 0);
  else if (drivePID.driveDirection === "reverse" && !isClose) drive_output = Math.min(drive_output, 0);

  let heading_output = headingPID.compute(heading_error);

  drive_output = clamp(drive_output, -effectiveMaxSpeed, effectiveMaxSpeed);
  heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

  drive_output = slew_scaling(drive_output, posePrevDriveOutput ?? 0, drivePID.slew * (dt / 0.01), Math.abs(drive_error) > 7.5); // normalizes dt from 16ms to 10ms to match mikLib

  drive_output = clamp_max_slip(drive_output, robot.getX(), robot.getY(), robot.getAngle(), isClose ? x : carrot_X, isClose ? y : carrot_Y, drivePID.drift);

  drive_output = overturn_scaling(drive_output, heading_output, effectiveMaxSpeed);

  if (!isClose) drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

  robot.tankDrive(
    left_voltage_scaling(drive_output, heading_output) / kMikLibSpeed,
    right_voltage_scaling(drive_output, heading_output) / kMikLibSpeed,
    dt
  );

  posePrevDriveOutput = drive_output;

  return false;
}
