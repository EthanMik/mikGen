import type { Robot } from "../../../core/Robot";
import { clamp } from "../../JarSim/util";
import { wait } from "../exit_conditions";
import type { EZconstants } from "../EZConstants";
import { PID } from "../PID";
import { slew } from "../slew";
import { new_turn_target_compute } from "../util";

let turn_start = true;
let sensor_start = 0;
let chain_target_start = 0;
let turnPID: PID;
let slew_turn: slew;

export function resetTurnPid() { turn_start = true; }

export function pid_turn_set(robot: Robot, dt: number, target: number, p: EZconstants[]) {
    const turn_p = p[0];

    if (turn_start) {
        turn_start = false;

        sensor_start = robot.getRotation();
        target = new_turn_target_compute(target, sensor_start, turn_p.angle_behavior);
        chain_target_start = target - sensor_start;

        turnPID = new PID(turn_p.p, turn_p.i, turn_p.d, turn_p.start_i, turn_p.small_exit_time, turn_p.small_error, turn_p.big_exit_time, turn_p.big_error, turn_p.velocity_exit_time);
        slew_turn = new slew(turn_p.slew_min_speed, turn_p.slew_distance);

        turnPID.target_set(target);
        turnPID.sensor_set(sensor_start);

        slew_turn.initialize(turn_p.slew, turn_p.speed, target, sensor_start);

        return false;
    }

    const turn_output = turnPID.compute(robot.getRotation());
    const slew_output = slew_turn.iterate(robot.getRotation());
    let gyro_out = clamp(turn_output, -slew_output, slew_output);

    if (turn_p.i != 0 && (Math.abs(turnPID.target_get()) > turn_p.start_i && Math.abs(turnPID.error) < turn_p.start_i)) {
        gyro_out = clamp(gyro_out, -30, 30);
    }

    robot.tankDrive(gyro_out / 127, -gyro_out / 127, dt);


    const output = wait(turn_p.wait, turnPID, robot.getRotation() - sensor_start, chain_target_start, turn_p.chain_constant);
    if (output) {
        turn_start = true;
        return output;
    }
    return output;
}
