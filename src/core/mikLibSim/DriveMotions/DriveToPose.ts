import type { Robot } from "../../Robot";
import { clamp, normalizeDeg, toDeg, toRad } from "../../Util";
import { kMikLibSpeed } from "../MikConstants";
import type { PID } from "../PID";
import { clamp_max_slip, clamp_min_voltage, is_line_settled, left_voltage_scaling, overturn_scaling, reduce_negative_180_to_180, right_voltage_scaling, slew_scaling } from "../Util";

const DRIVE_LARGE_SETTLE_ERROR = 6;
const BOOMERANG_MIN_VOLTAGE = 6;

let crossed_line: boolean = false;
let prev_crossed_line: boolean = false;
let prev_drive_output: number = 0;
let settling: boolean = false;

let start = true;

function resetDriveToPose(drivePID: PID, headingPID: PID) {
	drivePID.reset();
	headingPID.reset();
	crossed_line = false;
	prev_crossed_line = false;
	prev_drive_output = 0;
	settling = false;
}

export function driveToPose(robot: Robot, dt: number, x: number, y: number, angle: number, drivePID: PID, headingPID: PID): boolean {
	if (start) {
		resetDriveToPose(drivePID, headingPID);
		start = false;
	}
	
	if (drivePID.isSettled()) {
		resetDriveToPose(drivePID, headingPID);
		return true;
	}

	if (drivePID.driveDirection === "reverse") angle = normalizeDeg(angle + 180);

	console.log(drivePID.driveDirection);

	const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());
	
	const carrot_X = x - Math.sin(toRad(angle)) * (drivePID.lead * target_distance);
	const carrot_Y = y - Math.cos(toRad(angle)) * (drivePID.lead * target_distance);
	
	if (target_distance < DRIVE_LARGE_SETTLE_ERROR && !settling) {
		settling = true;
		drivePID.maxSpeed = Math.max(Math.abs(prev_drive_output), BOOMERANG_MIN_VOLTAGE);
	}
	
	const line_settled = is_line_settled(x, y, angle, robot.getX(), robot.getY(), drivePID.exit_error);
	const carrot_settled = is_line_settled(carrot_X, carrot_Y, angle, robot.getX(), robot.getY(), drivePID.exit_error);
	crossed_line = line_settled === carrot_settled;
	
	if (!crossed_line && prev_crossed_line && drivePID.minSpeed > 0 && settling) {
		resetDriveToPose(drivePID, headingPID);
		return true;
	}
	prev_crossed_line = crossed_line;
	
	let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY());
	let current_angle = robot.getAngle();
	if (drivePID.driveDirection === "reverse") current_angle = current_angle + 180;

	let heading_error = reduce_negative_180_to_180(toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - current_angle);
	
	if (settling) {
		drive_error = target_distance;
		heading_error = reduce_negative_180_to_180(angle - current_angle);
		drive_error *= Math.cos(toRad(reduce_negative_180_to_180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle())));
	} else {
		const angle_to_carrot_raw = reduce_negative_180_to_180(toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle());
		drive_error *= Math.sign(Math.cos(toRad(angle_to_carrot_raw)));
	}

	let drive_output = drivePID.compute(drive_error);
	let heading_output = headingPID.compute(heading_error);

	heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

	drive_output = clamp(drive_output, -drivePID.maxSpeed, drivePID.maxSpeed);
	drive_output = slew_scaling(drive_output, prev_drive_output, drivePID.slew * (dt / 0.01), !settling);
	drive_output = clamp_max_slip(drive_output, robot.getX(), robot.getY(), robot.getAngle(), settling ? x : carrot_X, settling ? y : carrot_Y, drivePID.drift);
	drive_output = overturn_scaling(drive_output, heading_output, drivePID.maxSpeed);

	console.log(drivePID.drift);

	if (drivePID.driveDirection === "forward" && !settling) drive_output = Math.max(drive_output, 0);
	else if (drivePID.driveDirection === "reverse" && !settling) drive_output = Math.min(drive_output, 0);

	drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

	prev_drive_output = drive_output;

	robot.tankDrive(
		left_voltage_scaling(drive_output, heading_output) / kMikLibSpeed,
		right_voltage_scaling(drive_output, heading_output) / kMikLibSpeed,
		dt
	);

	return false;
}
