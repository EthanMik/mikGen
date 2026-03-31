import type { Robot } from "../../../core/Robot";
import { clamp, toRad } from "../../../core/Util";
import { kMikLibSpeed } from "../../mikLibSim/MikConstants";
import { PID } from "../../mikLibSim/PID";
import { reduce_negative_180_to_180 } from "../../mikLibSim/Util";
import type { RevMecanumConstants } from "../RevMecanumConstant";

let drivePID: PID;
let turnPID: PID;

let start = true;

function resetMecanumDriveToPose() {
    drivePID.reset();
    turnPID.reset();
    start = true;
}

export function mecanumDriveToPose(robot: Robot, dt: number, x: number, y: number, angle: number, drive_p: RevMecanumConstants, heading_p: RevMecanumConstants) {
    if (start) {
        drivePID = new PID(drive_p.kp, drive_p.ki, drive_p.kd, drive_p.starti, drive_p.settle_time, drive_p.settle_error, drive_p.timeout, 0);
        turnPID = new PID(heading_p.kp, heading_p.ki, heading_p.kd, heading_p.starti, heading_p.settle_time, heading_p.settle_error, drive_p.timeout, 0);
        start = false;
    }

    if ((drivePID.isSettled() && turnPID.isSettled())) {
        resetMecanumDriveToPose();
        return true;
    }

    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());
    const turn_error = reduce_negative_180_to_180(angle - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let turn_output = turnPID.compute(turn_error);

    drive_output = clamp(drive_output, -drive_p.maxSpeed, drive_p.maxSpeed);
    turn_output = clamp(turn_output, -heading_p.maxSpeed, heading_p.maxSpeed);

    const heading_error = Math.atan2(y - robot.getY(), x - robot.getX());

    const left_front_output  = drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) + turn_output;
    const left_back_output   = drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) + turn_output;
    const right_back_output  = drive_output * Math.cos(toRad(robot.getAngle()) + heading_error - Math.PI / 4) - turn_output;
    const right_front_output = drive_output * Math.cos(-toRad(robot.getAngle()) - heading_error + 3 * Math.PI / 4) - turn_output;

    robot.mecanumDrive(right_front_output / kMikLibSpeed, left_front_output / kMikLibSpeed, right_back_output / kMikLibSpeed, left_back_output / kMikLibSpeed, dt);

    return false;
}
