import type { Robot } from "../../../core/Robot";
import { toRad } from "../../../core/Util";
import { wait } from "../exit_conditions";
import type { EZconstants } from "../EZConstants";
import { PID } from "../PID";
import { slew } from "../slew";

let drive_start = true;
let drivePID: PID;
let headingPID: PID;
let slew_both: slew;

let start_x: number = 0;
let start_y: number = 0;

export function resetDrivePid() { drive_start = true; }

export function pid_drive_set(robot: Robot, dt: number, target: number, p: EZconstants[]) {
    const drive_p = p[0];
    const heading_p = p[1];

    if (drive_start) {
        drive_start = false;

        start_x = robot.getX();
        start_y = robot.getY();

        drivePID = new PID(drive_p.p, drive_p.i, drive_p.d, drive_p.start_i, drive_p.small_exit_time, drive_p.small_error, drive_p.big_exit_time, drive_p.big_error, drive_p.velocity_exit_time);
        headingPID = new PID(heading_p.p, heading_p.i, heading_p.d, heading_p.start_i);
        slew_both = new slew(drive_p.slew_min_speed, drive_p.slew_distance);

        drivePID.target_set(target);
        headingPID.target_set(robot.getRotation());
        headingPID.sensor_set(robot.getRotation());

        slew_both.initialize(drive_p.slew, drive_p.speed, target, 0);

        return false;
    }

    const current_dist = (robot.getX() - start_x) * Math.sin(toRad(headingPID.target_get())) + (robot.getY() - start_y) * Math.cos(toRad(headingPID.target_get()));

    let drive_out = drivePID.compute(current_dist);
    const imu_out = headingPID.compute(robot.getRotation());

    const max_slew_out = slew_both.iterate(current_dist);
    let faster_side = Math.abs(drive_out);
    if (faster_side > max_slew_out)
        drive_out *= max_slew_out / faster_side;

    let l_out = drive_out + imu_out;
    let r_out = drive_out - imu_out;

    faster_side = Math.max(Math.abs(l_out), Math.abs(r_out));
    if (faster_side > max_slew_out) {
        l_out *= max_slew_out / faster_side;
        r_out *= max_slew_out / faster_side;
    }

    robot.tankDrive(l_out / 127, r_out / 127, dt);


    const output = wait(drive_p.wait, drivePID, current_dist, target, drive_p.chain_constant);
    if (output) {
        drive_start = true;
        return output;
    }
    return output; 
}
