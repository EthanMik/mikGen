import { Robot } from "../../../core/Robot";
import { clamp, toDeg } from "../../../core/Util";
import { LemExitCondition } from "../ExitCondition";
import type { LemConstants } from "../LemConstants";
import { LemPID } from "../Pid";
import { LemPose } from "../Pose";
import { LemTimer } from "../Timer";
import { angleError, slew, toLemPose } from "../Util";

let lateralPID: LemPID;
let lateralLargeExit: LemExitCondition;
let lateralSmallExit: LemExitCondition;
let angularPID: LemPID;

let lastPose: LemPose;
let timer: LemTimer;
let close: boolean;
let prevLateralOut: number;
let prevAngularOut: number;
let prevSide: boolean | null;
let target: LemPose;

let start = true;

export function resetMoveToPoint() {
    start = true;
}

export function moveToPoint(robot: Robot, dt: number, x: number, y: number, k: LemConstants[]) {
    const kLateral = k[0];
    const kAngular = k[1];

    if (start) {
        lateralPID = new LemPID(kLateral);
        angularPID = new LemPID(kAngular);
        lateralLargeExit = new LemExitCondition(kLateral.largeError, kLateral.largeErrorTimeout);
        lateralSmallExit = new LemExitCondition(kLateral.smallError, kLateral.smallErrorTimeout);

        lastPose = toLemPose(robot.getPose());
        timer = new LemTimer(kLateral.timeout);
        close = false;
        prevLateralOut = 0;
        prevAngularOut = 0;
        prevSide = null;

        target = new LemPose(x, y);
        target.theta = lastPose.angle(target);

        start = false;
    }

    timer.update(dt);
    if (timer.isDone() || ((lateralSmallExit.getExit() || lateralLargeExit.getExit()) && close)) {
        resetMoveToPoint();
        robot.tankDrive(0, 0, dt);
        return true;
    }

    // update position
    const params = kLateral;

    const pose: LemPose = toLemPose(robot.getPose(), true, true);

    // update distance traveled
    lastPose = pose;

    // calculate distance to the target point
    const distTarget = pose.distance(target);

    // check if the robot is close enough to the target to start settling
    let effectiveMaxSpeed = params.maxSpeed;
    if (distTarget < 7.5 && close == false) {
        close = true;
        effectiveMaxSpeed = Math.max(Math.abs(prevLateralOut), 60);
    }

    // motion chaining
    const side = (pose.y - target.y) * -Math.sin(target.theta) <= (pose.x - target.x) * Math.cos(target.theta) + params.earlyExitRange;
    if (prevSide == null) prevSide = side;
    const sameSide = side == prevSide;
    // exit if close
    if (!sameSide && params.minSpeed != 0) {
        resetMoveToPoint();
        return true;
    }
    prevSide = side;

    // calculate error
    const adjustedRobotTheta = kLateral.forwards ? pose.theta : pose.theta + Math.PI;
    const angularError = angleError(adjustedRobotTheta, pose.angle(target));
    const lateralError = pose.distance(target) * Math.cos(angleError(pose.theta, pose.angle(target)));

    // update exit conditions
    lateralSmallExit.update(lateralError, dt);
    lateralLargeExit.update(lateralError, dt);

    // get output from PIDs
    let lateralOut = lateralPID.update(lateralError);
    let angularOut = angularPID.update(toDeg(angularError));
    if (close) angularOut = 0;

    // apply restrictions on angular speed
    angularOut = clamp(angularOut, -effectiveMaxSpeed, effectiveMaxSpeed);
    angularOut = slew(angularOut, prevAngularOut, kAngular.slew);

    // apply restrictions on lateral speed
    lateralOut = clamp(lateralOut, -effectiveMaxSpeed, effectiveMaxSpeed);
    // constrain lateral output by max accel
    // but not for decelerating, since that would interfere with settling
    if (!close) lateralOut = slew(lateralOut, prevLateralOut, kLateral.slew);

    // prevent moving in the wrong direction
    if (kLateral.forwards && !close) lateralOut = Math.max(lateralOut, 0);
    else if (!kLateral.forwards && !close) lateralOut = Math.min(lateralOut, 0);

    // constrain lateral output by the minimum speed
    if (kLateral.forwards && lateralOut < Math.abs(params.minSpeed) && lateralOut > 0) lateralOut = Math.abs(params.minSpeed);
    if (!kLateral.forwards && -lateralOut < Math.abs(params.minSpeed) && lateralOut < 0)
        lateralOut = -Math.abs(params.minSpeed);

    // update previous output
    prevAngularOut = angularOut;
    prevLateralOut = lateralOut;

    // ratio the speeds to respect the max speed
    let leftPower = lateralOut + angularOut;
    let rightPower = lateralOut - angularOut;
    const ratio = Math.max(Math.abs(leftPower), Math.abs(rightPower)) / effectiveMaxSpeed;
    if (ratio > 1) {
        leftPower /= ratio;
        rightPower /= ratio;
    }

    // move the drivetrain
    robot.tankDrive(leftPower / 127, rightPower / 127, dt);

    return false;
}