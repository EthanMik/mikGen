import type { Robot } from "../../Robot";
import { LemExitCondition } from "../ExitCondition";
import { kLemLibSpeed, type LemAngularConstants } from "../LemConstants";
import { LemPID } from "../Pid";
import { LemTimer } from "../Timer";
import { angleError, slew, toLemPose } from "../Util";
import { toDeg } from "../../Util";

let angularPID: LemPID;
let angularLargeExit: LemExitCondition;
let angularSmallExit: LemExitCondition;
let timer: LemTimer;
let prevRawDeltaTheta: number | null;
let prevDeltaTheta: number | null;
let prevMotorPower: number;
let settling: boolean;

let start = true;

export function resetSwingToPoint() {
    start = true;
}

export function swingToPoint(robot: Robot, dt: number, x: number, y: number, angle: number, k: LemAngularConstants): boolean {
    const params = k.angular;

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
        resetSwingToPoint();
        robot.tankDrive(0, 0, dt);
        return true;
    }

    // get current heading in degrees (LemLib heading convention)
    const pose = toLemPose(robot.getPose(), false, false);

    // adjust effective heading for reverse driving
    const effectiveTheta = params.forwards === "forward" ? pose.theta : pose.theta - 180;

    // compute target heading from the point each loop, plus any heading offset
    const targetTheta = toDeg(Math.atan2(x - pose.x, y - pose.y)) + angle;

    // calculate raw delta theta (no direction constraint, used for settling detection)
    const rawDeltaTheta = angleError(targetTheta, effectiveTheta, false);
    if (prevRawDeltaTheta === null) prevRawDeltaTheta = rawDeltaTheta;
    if (Math.sign(rawDeltaTheta) !== Math.sign(prevRawDeltaTheta)) settling = true;
    prevRawDeltaTheta = rawDeltaTheta;

    // calculate delta theta (with direction if not settling)
    let deltaTheta: number;
    if (settling) deltaTheta = angleError(targetTheta, effectiveTheta, false);
    else deltaTheta = angleError(targetTheta, effectiveTheta, false, params.direction);
    if (prevDeltaTheta === null) prevDeltaTheta = deltaTheta;

    // motion chaining: exit if within early exit range or overshot
    if (params.minSpeed !== 0 && Math.abs(deltaTheta) < params.earlyExitRange) {
        resetSwingToPoint();
        return true;
    }
    if (params.minSpeed !== 0 && Math.sign(deltaTheta) !== Math.sign(prevDeltaTheta)) {
        resetSwingToPoint();
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

    // drive: locked side stays at 0, active side drives
    if (params.lockedSide === "left") {
        robot.tankDrive(0, -motorPower / kLemLibSpeed, dt);
    } else {
        robot.tankDrive(motorPower / kLemLibSpeed, 0, dt);
    }

    return false;
}
