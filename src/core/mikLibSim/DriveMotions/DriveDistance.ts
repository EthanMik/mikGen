import { clamp, toRad } from "../../Util";
import type { Robot } from "../../Robot";
import type { PID } from "../PID";
import { reduce_negative_180_to_180 } from "../Util";

let driveDistanceStartX: number | null = null;
let driveDistanceStartY: number | null = null;

export function driveDistance(robot: Robot, dt: number, distance: number, heading: number, drivePID: PID, headingPID: PID) {
    if (driveDistanceStartX === null || driveDistanceStartY === null) {
        driveDistanceStartX = robot.getX();
        driveDistanceStartY = robot.getY();
    }

    const dx = robot.getX() - driveDistanceStartX;
    const dy = robot.getY() - driveDistanceStartY;

    const traveled = dx * Math.sin(toRad(heading)) + dy * Math.cos(toRad(heading));

    const drive_error = distance - traveled;

    const heading_error = reduce_negative_180_to_180(heading - robot.getAngle());

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -drivePID.maxSpeed, drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    if (drivePID.isSettled()) {
        driveDistanceStartX = null;
        driveDistanceStartY = null;
        drivePID.reset();
        headingPID.reset();
        return true;
    }

    robot.tankDrive((drive_output + heading_output) / 12, (drive_output - heading_output) / 12, dt);

    return false;
}
