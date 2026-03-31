import type { Robot } from "../../../core/Robot";
import { kMikLibSpeed } from "../MikConstants";
import { PID } from "../PID";

let drivePID: PID;

let start = true;

let seconds = 0;
let last_angle = 0;
let angle = 0;
let scale = 0;
let prev_angle = 0;

let output: string = "";
let outputd: string = "";

export function resetDriveDistance() {
    drivePID.reset();
    start = true;
}

export function driveWithVoltage(robot: Robot, dt: number, left_voltage: number, right_voltage: number, timeout: number) {
    if (start) {
        drivePID = new PID(0, 0, 0, 0, 0, 0, timeout, 0);
        start = false;


        seconds = 0;
        last_angle = 0;
        angle = 0;
        scale = 0;
        prev_angle = 0;
    }

    drivePID.compute(0);

    const raw_angle = robot.getAngle();
    angle = raw_angle + scale;

    if (raw_angle < last_angle) {
        scale += 360;
    }

    last_angle = raw_angle;
    
    seconds += dt

    output += seconds.toFixed(2) + ", " + angle.toFixed(1) + "\n";
    outputd += seconds.toFixed(2) + ", " + ((angle - prev_angle) / dt).toFixed(2) + "\n";

    prev_angle = angle;

    // console.log(seconds, angle);

    if (drivePID.isSettled()) {
        console.log("output");
        console.log(output)
        console.log("outputd");
        console.log(outputd);
        console.log("\n");
        resetDriveDistance();
        return true;
    }

    robot.tankDrive(left_voltage / kMikLibSpeed, right_voltage / kMikLibSpeed, dt);

    return false;
}
