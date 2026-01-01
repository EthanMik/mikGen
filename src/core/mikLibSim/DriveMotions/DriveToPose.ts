import type { Robot } from "../../Robot";
import { clamp, toDeg, toRad } from "../../Util";
import type { PID } from "../PID";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling } from "../Util";

let posePrevLineSettled: boolean | null = null;
let poseInitCenterLineSide: boolean | null = null;
let poseCrossedCenterLine = false;

export function driveToPose(robot: Robot, dt: number, x: number, y: number, angle: number, drivePID: PID, headingPID: PID): boolean {
  if (posePrevLineSettled === null || poseInitCenterLineSide === null) {
    posePrevLineSettled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
    poseInitCenterLineSide = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
    poseCrossedCenterLine = false;
  }

  if (drivePID.isSettled()) {
    drivePID.reset();
    headingPID.reset();
    posePrevLineSettled = null;
    poseInitCenterLineSide = null;
    poseCrossedCenterLine = false;
    return true;
  }

  const pose_line_settled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
  if (pose_line_settled && !posePrevLineSettled) {
    drivePID.reset();
    headingPID.reset();
    posePrevLineSettled = null;
    poseInitCenterLineSide = null;
    poseCrossedCenterLine = false;
    return true;
  }
  posePrevLineSettled = pose_line_settled;

  const centerSide = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
  poseCrossedCenterLine ||= (centerSide !== poseInitCenterLineSide);

  const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());

  const carrot_X = x - Math.sin(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);
  const carrot_Y = y - Math.cos(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);

  let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY());
  let heading_error = reduce_negative_180_to_180(
    toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle()
  );

  if (drive_error < drivePID.settleError || poseCrossedCenterLine || drive_error < drivePID.setback) {
    heading_error = reduce_negative_180_to_180(angle - robot.getAngle());
    drive_error = target_distance;
  }

  let drive_output = drivePID.compute(drive_error);

  const heading_scale_factor = Math.cos(toRad(heading_error));
  drive_output *= heading_scale_factor;

  heading_error = reduce_negative_90_to_90(heading_error);
  const heading_output = headingPID.compute(heading_error);

  const clamped_drive_output = clamp(
    drive_output,
    -Math.abs(heading_scale_factor) * drivePID.maxSpeed,
    Math.abs(heading_scale_factor) * drivePID.maxSpeed
  );
  const clamped_heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

  const final_drive_output = clamp_min_voltage(clamped_drive_output, drivePID.minSpeed);

  robot.tankDrive(
    left_voltage_scaling(final_drive_output, clamped_heading_output) / 12,
    right_voltage_scaling(final_drive_output, clamped_heading_output) / 12,
    dt
  );

  return false;
}
