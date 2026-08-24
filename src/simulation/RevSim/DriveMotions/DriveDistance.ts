import type { Robot } from "../../../core/Robot";
import { clamp, toRad } from "../../../core/Util";
import type { revConstants } from "../RevConstants";
import { PID } from "../PID";
import { clamp_min_speed, slew, to_tank_voltage, wrap_angle_180 } from "../Util";

const SETTLE_DISTANCE = 7;

let lateralPID: PID;
let angularPID: PID;
let start_x = 0;
let start_y = 0;
let heading = 0;
let prev_drive_output = 0;
let prev_heading_output = 0;
let start = true;

export function reset_drive_distance() {
    lateralPID?.reset();
    angularPID?.reset();
    start_x = 0;
    start_y = 0;
    heading = 0;
    prev_drive_output = 0;
    prev_heading_output = 0;
    start = true;
}

export function drive_distance(robot: Robot, dt: number, distance: number, target_heading: number | null, p: revConstants[]): boolean {
    const lat = p[0];
    const ang = p[1];

    if (start) {
        lateralPID = new PID(dt, lat.kp, lat.ki, lat.kd, lat.kf, lat.start_i,
            lat.settle_error, lat.settle_time, lat.large_settle_error, lat.large_settle_time,
            lat.exit_error, lat.stall_timeout, lat.timeout);
        angularPID = new PID(dt, ang.kp, ang.ki, ang.kd, ang.kf, ang.start_i, 0, 0, 0, 0, 0, 0, 0);

        start_x = robot.getX();
        start_y = robot.getY();
        heading = target_heading ?? robot.getAngle();
        prev_drive_output = 0;
        prev_heading_output = 0;
        start = false;
    }

    if (lateralPID.isSettled()) {
        reset_drive_distance();
        return true;
    }

    const traveled = (robot.getX() - start_x) * Math.sin(toRad(heading))
        + (robot.getY() - start_y) * Math.cos(toRad(heading));
    const drive_error = distance - traveled;
    const heading_error = wrap_angle_180(heading - robot.getAngle());

    let drive_output = lateralPID.compute(drive_error);
    let heading_output = angularPID.compute(heading_error);

    drive_output = clamp(drive_output, -lat.max_speed, lat.max_speed);
    heading_output = clamp(heading_output, -ang.max_speed, ang.max_speed);

    if (Math.abs(drive_error) > SETTLE_DISTANCE) drive_output = slew(drive_output, prev_drive_output, lat.slew);
    heading_output = slew(heading_output, prev_heading_output, ang.slew);

    drive_output = clamp_min_speed(drive_output, lat.min_speed);

    prev_drive_output = drive_output;
    prev_heading_output = heading_output;

    const [left, right] = to_tank_voltage(drive_output, heading_output);
    robot.tankDrive(left, right, dt);

    return false;
}
