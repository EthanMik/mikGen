import { Robot } from "../../../core/Robot";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { LemExitCondition } from "../ExitCondition";
import { kLemLibSpeed, type LemMoveConstants } from "../LemConstants";
import { LemPID } from "../Pid";
import { LemPose } from "../Pose";
import { LemTimer } from "../Timer";
import { angleError, getCurvature, slew, toLemPose } from "../Util";

let lateralPID: LemPID;
let lateralLargeExit: LemExitCondition;
let lateralSmallExit: LemExitCondition;
let angularPID: LemPID;
let angularLargeExit: LemExitCondition;
let angularSmallExit: LemExitCondition;

let timer: LemTimer;
let close: boolean;
let lateralSettled: boolean;
let prevLateralOut: number;
let prevSameSide: boolean;
let target: LemPose;

let start = true;

export function resetMoveToPose() {
    start = true;
}

export function moveToPose(robot: Robot, dt: number, x: number, y: number, angle: number, k: LemMoveConstants): boolean {

    if (start) {
        lateralPID = new LemPID(k.lateral);
        angularPID = new LemPID(k.angular);
        lateralLargeExit = new LemExitCondition(k.lateral.largeError, k.lateral.largeErrorTimeout);
        lateralSmallExit = new LemExitCondition(k.lateral.smallError, k.lateral.smallErrorTimeout);
        angularLargeExit = new LemExitCondition(k.angular.largeError, k.angular.largeErrorTimeout);
        angularSmallExit = new LemExitCondition(k.angular.smallError, k.angular.smallErrorTimeout);

        timer = new LemTimer(k.lateral.timeout);
        close = false;
        lateralSettled = false;
        prevLateralOut = 0;
        prevSameSide = false;

        // convert target angle to standard position form
        target = new LemPose(x, y, Math.PI / 2 - toRad(angle));
        if (k.lateral.forwards !== "forward") target.theta = (target.theta + Math.PI) % (2 * Math.PI);

        start = false;
    }

    timer.update(dt);
    if (timer.isDone() || (lateralSettled && (angularLargeExit.getExit() || angularSmallExit.getExit()) && close)) {
        resetMoveToPose();
        robot.tankDrive(0, 0, dt);
        return true;
    }

    const params = k.lateral;
    const pose: LemPose = toLemPose(robot.getPose(), true, true);

    const distTarget = pose.distance(target);

    let effectiveMaxSpeed = params.maxSpeed;
    if (distTarget < 7.5 && !close) {
        close = true;
        effectiveMaxSpeed = Math.max(Math.abs(prevLateralOut), 60);
    }

    if (lateralLargeExit.getExit() && lateralSmallExit.getExit()) lateralSettled = true;

    // calculate carrot point
    let carrot = target.sub((new LemPose(Math.cos(target.theta), Math.sin(target.theta))).mulScalar(params.lead * distTarget));
    if (close) carrot = target;

    // motion chaining: check if robot and carrot are on the same side of target
    const robotSide = (pose.y - target.y) * -Math.sin(target.theta) <= (pose.x - target.x) * Math.cos(target.theta) + params.earlyExitRange;
    const carrotSide = (carrot.y - target.y) * -Math.sin(target.theta) <= (carrot.x - target.x) * Math.cos(target.theta) + params.earlyExitRange;
    const sameSide = robotSide === carrotSide;

    if (!sameSide && prevSameSide && close && params.minSpeed !== 0) {
        resetMoveToPose();
        return true;
    }
    prevSameSide = sameSide;

    // calculate error
    const adjustedRobotTheta = params.forwards === "forward" ? pose.theta : pose.theta + Math.PI;
    const angularError = close
        ? angleError(adjustedRobotTheta, target.theta)
        : angleError(adjustedRobotTheta, pose.angle(carrot));

    let lateralError = pose.distance(carrot);
    if (close) lateralError *= Math.cos(angleError(pose.theta, pose.angle(carrot)));
    else lateralError *= Math.sign(Math.cos(angleError(pose.theta, pose.angle(carrot))));

    // update exit conditions
    lateralSmallExit.update(lateralError, dt);
    lateralLargeExit.update(lateralError, dt);
    angularSmallExit.update(toDeg(angularError), dt);
    angularLargeExit.update(toDeg(angularError), dt);

    // get output from PIDs
    let lateralOut = lateralPID.update(lateralError);
    let angularOut = angularPID.update(toDeg(angularError));

    // apply restrictions on angular speed
    angularOut = clamp(angularOut, -effectiveMaxSpeed, effectiveMaxSpeed);

    // apply restrictions on lateral speed
    lateralOut = clamp(lateralOut, -effectiveMaxSpeed, effectiveMaxSpeed);
    if (!close) lateralOut = slew(lateralOut, prevLateralOut, params.slew);

    // constrain lateral output by max slip speed
    const radius = 1 / Math.abs(getCurvature(pose, carrot));
    const horizontalDrift = params.horizontalDrift !== 0 ? params.horizontalDrift : 2;
    const maxSlipSpeed = Math.sqrt(horizontalDrift * radius * 9.8);
    lateralOut = clamp(lateralOut, -maxSlipSpeed, maxSlipSpeed);

    // prioritize angular movement over lateral movement
    const overturn = Math.abs(angularOut) + Math.abs(lateralOut) - effectiveMaxSpeed;
    if (overturn > 0) lateralOut -= lateralOut > 0 ? overturn : -overturn;

    // prevent moving in the wrong direction
    if (params.forwards === "forward" && !close) lateralOut = Math.max(lateralOut, 0);
    else if (params.forwards === "reverse" && !close) lateralOut = Math.min(lateralOut, 0);

    // constrain lateral output by the minimum speed
    if (params.forwards === "forward" && lateralOut < Math.abs(params.minSpeed) && lateralOut > 0) lateralOut = Math.abs(params.minSpeed);
    if (params.forwards === "reverse" && -lateralOut < Math.abs(params.minSpeed) && lateralOut < 0) lateralOut = -Math.abs(params.minSpeed);

    prevLateralOut = lateralOut;

    // ratio the speeds to respect the max speed
    let leftPower = lateralOut + angularOut;
    let rightPower = lateralOut - angularOut;
    const ratio = Math.max(Math.abs(leftPower), Math.abs(rightPower)) / effectiveMaxSpeed;
    if (ratio > 1) {
        leftPower /= ratio;
        rightPower /= ratio;
    }

    robot.tankDrive(leftPower / kLemLibSpeed, rightPower / kLemLibSpeed, dt);

    return false;
}
