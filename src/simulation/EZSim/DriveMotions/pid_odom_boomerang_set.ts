import { absolute_angle_to_point, distance_to_point, find_point_to_face, is_past_target, new_turn_target_compute, vector_off_point, type pose } from "../util";
import type { Robot } from "../../../core/Robot";
import { toRad } from "../../../core/Util";
import type { EZconstants } from "../EZConstants";
import { PID } from "../PID";
import { slew } from "../slew";

let boomerang_start = true;
let xyPID: PID;
let current_a_odomPID: PID;
let slew_both: slew;
let point_to_face: pose;
let odom_target: pose;
let odom_target_start: pose;
let final_target: pose;
let past_target = 0;
let start_x = 0;
let start_y = 0;
let odom_imu_start = 0;
let prev_x = 0;
let prev_y = 0;
let new_current_fake = 0;
let chain_applied = false;

function compute_carrot(current: pose, dir: number, drive_p: EZconstants): pose {
    const dist = distance_to_point(final_target, current);
    if (dist < drive_p.lookahead / 2.0) {
        return { x: final_target.x, y: final_target.y, theta: final_target.theta };
    }
    const h = Math.min(dist * drive_p.lead, drive_p.boomerang_distance) * dir;
    const base = vector_off_point(-h, final_target);
    return { x: base.x, y: base.y, theta: final_target.theta };
}

export function resetBoomerangSet() { boomerang_start = true; }

export function pid_odom_boomerang_set(robot: Robot, dt: number, x: number, y: number, angle: number, p: EZconstants[]) {
    const drive_p = p[0];
    const heading_p = p[1];
    const odom_pose_get = (): pose => ({ x: robot.getX(), y: robot.getY(), theta: robot.getRotation() });
    const dir = drive_p.drive_directions === "rev" ? -1 : 1;

    if (boomerang_start) {
        boomerang_start = false;
        start_x = robot.getX();
        start_y = robot.getY();
        prev_x = robot.getX();
        prev_y = robot.getY();
        new_current_fake = 0;
        chain_applied = false;

        final_target = { x, y, theta: angle };
        odom_target_start = { x, y, theta: 0 };

        xyPID = new PID(drive_p.p, drive_p.i, drive_p.d, drive_p.start_i, drive_p.small_exit_time, drive_p.small_error, drive_p.big_exit_time, drive_p.big_error, drive_p.velocity_exit_time);
        current_a_odomPID = new PID(heading_p.p, heading_p.i, heading_p.d, heading_p.start_i);
        slew_both = new slew(drive_p.slew_min_speed, drive_p.slew_distance);

        const initial_carrot = compute_carrot(odom_pose_get(), dir, drive_p);
        odom_target = { x: initial_carrot.x, y: initial_carrot.y, theta: angle };

        point_to_face = find_point_to_face(odom_pose_get(), odom_target, drive_p.drive_directions);
        past_target = Math.sign(is_past_target(odom_target, odom_pose_get(), point_to_face, drive_p.drive_directions));

        odom_imu_start = robot.getRotation();
        slew_both.initialize(drive_p.slew, drive_p.speed, 100.0 * dir, 0);

        return false;
    }

    if (!chain_applied) {
        const carrot = compute_carrot(odom_pose_get(), dir, drive_p);
        if (odom_target.x !== carrot.x || odom_target.y !== carrot.y) {
            odom_target.x = carrot.x;
            odom_target.y = carrot.y;
            point_to_face = find_point_to_face(odom_pose_get(), odom_target, drive_p.drive_directions);
            past_target = Math.sign(is_past_target(odom_target, odom_pose_get(), point_to_face, drive_p.drive_directions));
        }
    }

    const current_dist = Math.hypot(robot.getX() - start_x, robot.getY() - start_y);
    const signed_dist = current_dist * dir;
    const max_slew_out = slew_both.iterate(signed_dist);

    const temp_target = is_past_target(odom_target, odom_pose_get(), point_to_face, drive_p.drive_directions);
    const flipped = Math.sign(temp_target) !== Math.sign(past_target) ? -1 : 1;

    const xy_delta_fake = Math.hypot(robot.getX() - prev_x, robot.getY() - prev_y);
    prev_x = robot.getX();
    prev_y = robot.getY();
    new_current_fake += xy_delta_fake * dir * flipped;

    const ptf = point_to_face;
    let a_target = absolute_angle_to_point(ptf, odom_pose_get());
    a_target = new_turn_target_compute(a_target, odom_imu_start, drive_p.angle_behavior);
    const wrapped_a_target = a_target - robot.getRotation();
    let a_out = current_a_odomPID.compute_error(wrapped_a_target, robot.getRotation());

    let xy_out = xyPID.compute_error(Math.abs(temp_target) * dir * flipped, new_current_fake);
    xy_out = Math.sign(xy_out) * Math.min(Math.abs(xy_out), max_slew_out);

    if (drive_p.odom_turn_bias > 0) {
        const scale = 1.0 - ((1.0 - Math.cos(toRad(current_a_odomPID.error))) / drive_p.odom_turn_bias);
        xy_out *= scale;
    }

    let faster_side = Math.max(Math.abs(xy_out), Math.abs(a_out));
    if (faster_side > max_slew_out) {
        xy_out *= max_slew_out / faster_side;
        a_out *= max_slew_out / faster_side;
    }

    let l_out = xy_out + a_out;
    let r_out = xy_out - a_out;

    faster_side = Math.max(Math.abs(l_out), Math.abs(r_out));
    if (faster_side > max_slew_out) {
        l_out *= max_slew_out / faster_side;
        r_out *= max_slew_out / faster_side;
    }

    robot.tankDrive(l_out / 127, r_out / 127, dt);

    const output = boomerang_exit(drive_p, odom_pose_get());

    if (output) {
        boomerang_start = true;
        return true;
    }
    return output;
}

function boomerang_exit(drive_p: EZconstants, current_pose: pose): boolean {
    const past_original =
        Math.sign(is_past_target(odom_target_start, current_pose, point_to_face, drive_p.drive_directions)) !==
        Math.sign(past_target);

    switch (drive_p.wait) {
        case "wait":
            return xyPID.exit_condition() !== "RUNNING";

        case "wait_quick":
            if (past_original) {
                xyPID.timers_reset();
                current_a_odomPID.timers_reset();
                return true;
            }
            return xyPID.exit_condition() !== "RUNNING";

        case "wait_quick_chain":
            if (!chain_applied) {
                chain_applied = true;
                const extended = vector_off_point(drive_p.chain_constant, {
                    x: odom_target_start.x,
                    y: odom_target_start.y,
                    theta: final_target.theta,
                });
                odom_target.x = extended.x;
                odom_target.y = extended.y;
            }
            if (past_original) {
                xyPID.timers_reset();
                current_a_odomPID.timers_reset();
                return true;
            }
            return xyPID.exit_condition() !== "RUNNING";
    }
}
