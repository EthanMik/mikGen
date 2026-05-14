import type { Robot } from "../../../core/Robot";
import { toDeg } from "../../../core/Util";
import { LemExitCondition } from "../ExitCondition";
import type { LemConstants } from "../LemConstants";
import { LemPID } from "../Pid";
import { LemTimer } from "../Timer";
import { angleError, slew, toLemPose } from "../Util";

let angularPID: LemPID;
let angularLargeExit: LemExitCondition;
let angularSmallExit: LemExitCondition;
let timer: LemTimer;
let prevRawDeltaTheta: number | null;
let prevDeltaTheta: number | null;
let prevMotorPower: number;
let settling: boolean;

let start = true;

export function resetTurnToPoint() {
    start = true;
}

export function turnToPoint(robot: Robot, dt: number, x: number, y: number, k: LemConstants[]): boolean {
    const params = k[0];

    if (start) {
        angularPID = new LemPID(params);
        angularLargeExit = new LemExitCondition(params.largeError, params.largeErrorTimeout);
        angularSmallExit = new LemExitCondition(params.smallError, params.smallErrorTimeout);
        timer = new LemTimer(params.timeout);
        prevRawDeltaTheta = null;
        prevDeltaTheta = null;
        prevMotorPower = 0;
        settling = false;
        start = false;
    }

    timer.update(dt);
    if (timer.isDone() || angularLargeExit.getExit() || angularSmallExit.getExit()) {
        resetTurnToPoint();
        robot.tankDrive(0, 0, dt);
        return true;
    }

    // get current heading in degrees
    const pose = toLemPose(robot.getPose(), false, false);

    // adjust effective heading for reverse driving
    pose.theta = (params.forwards) ? pose.theta % 360 : (pose.theta - 180) % 360;
    
    // compute target heading from the point each loop, plus any heading offset
    const targetTheta = toDeg(Math.atan2(x - pose.x, y - pose.y)) % 360;

    // calculate raw delta theta (no direction constraint, used for settling detection)
    const rawDeltaTheta = angleError(targetTheta, pose.theta, false);
    if (prevRawDeltaTheta === null) prevRawDeltaTheta = rawDeltaTheta;
    if (Math.sign(rawDeltaTheta) !== Math.sign(prevRawDeltaTheta)) settling = true;
    prevRawDeltaTheta = rawDeltaTheta;

    // calculate delta theta (with direction if not settling)
    let deltaTheta: number;
    if (settling) deltaTheta = angleError(targetTheta, pose.theta, false);
    else deltaTheta = angleError(targetTheta, pose.theta, false, params.direction);
    if (prevDeltaTheta === null) prevDeltaTheta = deltaTheta;

    // motion chaining: exit if within early exit range or overshot
    if (params.minSpeed !== 0 && Math.abs(deltaTheta) < params.earlyExitRange) {
        resetTurnToPoint();
        return true;
    }
    if (params.minSpeed !== 0 && Math.sign(deltaTheta) !== Math.sign(prevDeltaTheta)) {
        resetTurnToPoint();
        return true;
    }
    prevDeltaTheta = deltaTheta;

    // calculate motor power
    let motorPower = angularPID.update(deltaTheta);
    angularLargeExit.update(deltaTheta, dt);
    angularSmallExit.update(deltaTheta, dt);

    // clamp to max speed
    if (motorPower > params.maxSpeed) motorPower = params.maxSpeed;
    else if (motorPower < -params.maxSpeed) motorPower = -params.maxSpeed;

    // apply slew only when far from target
    if (Math.abs(deltaTheta) > 20) motorPower = slew(motorPower, prevMotorPower, params.slew);

    // apply min speed
    if (motorPower < 0 && motorPower > -Math.abs(params.minSpeed)) motorPower = -Math.abs(params.minSpeed);
    else if (motorPower > 0 && motorPower < Math.abs(params.minSpeed)) motorPower = Math.abs(params.minSpeed);

    prevMotorPower = motorPower;

    // both sides drive, opposite directions
    robot.tankDrive(motorPower / 127, -motorPower / 127, dt);

    return false;
}
