import type { Robot } from "../../../core/Robot";
import { clamp } from "../../JarSim/util";
import { wait } from "../exit_conditions";
import type { EZconstants } from "../EZConstants";
import { PID } from "../PID";
import { slew } from "../slew";
import { new_turn_target_compute } from "../util";

let swing_start = true;
let sensor_start = 0;
let chain_target_start = 0;
let swingPID: PID;
let slew_swing: slew;

export function pid_swing_set(robot: Robot, dt: number, target: number, p: EZconstants[]) {
    const swing_p = p[0];

    if (swing_start) {
        swing_start = false;

        sensor_start = robot.getRotation();
        target = new_turn_target_compute(target, sensor_start, swing_p.angle_behavior);
        chain_target_start = target - sensor_start;

        swingPID = new PID(swing_p.p, swing_p.i, swing_p.d, swing_p.start_i, swing_p.small_exit_time, swing_p.small_error, swing_p.big_exit_time, swing_p.big_error, swing_p.velocity_exit_time);
        slew_swing = new slew(swing_p.slew_min_speed, swing_p.slew_distance);

        swingPID.target_set(target);

        slew_swing.initialize(swing_p.slew, swing_p.speed, target, sensor_start);

        return false;
    }

    const turn_output = swingPID.compute(robot.getRotation());
    const slew_output = slew_swing.iterate(robot.getRotation());
    let swing_out = clamp(turn_output, -slew_output, slew_output);

    if (swing_p.i != 0 && (Math.abs(swingPID.target_get()) > swing_p.start_i && Math.abs(swingPID.error) < swing_p.start_i)) {
        swing_out = clamp(swing_out, -30, 30);
    }

    let opposite_output = 0;
    const scale = swing_out / swing_p.speed;

    if (swing_p.swing === "LEFT_SWING") {
        opposite_output = swing_p.opposite_speed > 0 ? (swing_p.opposite_speed * scale) : 0;
        robot.tankDrive(swing_out / 127, opposite_output / 127, dt);
    } else if (swing_p.swing === "RIGHT_SWING") {
        opposite_output = swing_p.opposite_speed > 0 ? -(swing_p.opposite_speed * scale) : 0;
        robot.tankDrive(opposite_output / 127, -swing_out / 127, dt);        
    }

    const output = wait(swing_p.wait, swingPID, robot.getRotation() - sensor_start, chain_target_start, swing_p.chain_constant);
    if (output) {
        swing_start = true;
        return output;
    }
    return output;
}
