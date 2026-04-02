import type { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { kMikLibSpeed } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { clamp_min_voltage, is_line_settled, reduce_negative_180_to_180 } from "../../mikLibSim/Util";
import type { RevMecanumConstants } from "../RevMecanumConstant";

let drivePID: PID;
let turnPID: PID;
let prev_line_settled: boolean = false;
let reverse: number = 0;

let start = true;

function resetMecanumDriveToPose() {
    drivePID.reset();
    turnPID.reset();
    prev_line_settled = false;
    start = true;
}

export function mecanumDriveToPoint(robot: Robot, dt: number, x: number, y: number, drive_p: RevMecanumConstants, heading_p: RevMecanumConstants) {
    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        const raw_heading_error = reduce_negative_180_to_180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle());
        reverse = Math.abs(raw_heading_error) > 90 ? 180 : 0;

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

    desired_heading += reverse;

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    const heading_error = Math.atan2(y - robot.getY(), x - robot.getX());
    let turn_error = reduce_negative_180_to_180(desired_heading - robot.getAngle());

    if (drive_error < 6) {
        turn_error = 0;
    }

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);

    drive_output = clamp(drive_output, -drive_p.maxSpeed, drive_p.maxSpeed);
    turn_output = clamp(turn_output, -heading_p.maxSpeed, heading_p.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drive_p.min_voltage);
    turn_output = clamp_min_voltage(turn_output, heading_p.min_voltage);


    const left_front_output  = drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) + turn_output;
    const left_back_output   = drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) + turn_output;
    const right_back_output  = drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) - turn_output;
    const right_front_output = drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) - turn_output;

    robot.mecanumDrive(right_front_output / kMikLibSpeed, left_front_output / kMikLibSpeed, right_back_output / kMikLibSpeed, left_back_output / kMikLibSpeed, dt);

    return false;
}
