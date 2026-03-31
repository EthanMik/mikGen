import { SIM_CONSTANTS } from "../../core/ComputePathSim";
import { getSegmentName } from "../DefaultConstants";
import type { SegmentKind } from "../InitialDefaults";
import { moveToPose, resetMoveToPose } from "./DriveMotions/MoveToPose";
import { moveToPoint, resetMoveToPoint } from "./DriveMotions/MoveToPoint";
import { resetSwingToHeading, swingToHeading } from "./DriveMotions/SwingToHeading";
import { resetSwingToPoint, swingToPoint } from "./DriveMotions/SwingToPoint";
import { resetTurnToHeading, turnToHeading } from "./DriveMotions/TurnToHeading";
import { resetTurnToPoint, turnToPoint } from "./DriveMotions/TurnToPoint";
import type { LemAngularConstants, LemMoveConstants } from "./LemConstants";
import { angle_error } from "../mikLibSim/Util";
import type { Robot } from "../../core/Robot";
import type { Coordinate } from "../../core/Types/Coordinate";
import { toDeg } from "../../core/Util";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../../core/Types/Path";

const LOG_SEGMENT_START_AND_END = false;
const LOG_ROBOT_STATE = false;
const LOG_SIMULATION_NUMBER = false;

SIM_CONSTANTS.seconds = 99;
let currentPathTime = -2/60;
let simComputed = 0;

export function LemLibToSim(path: Path) {

    const auton: ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] = [];
    currentPathTime = -2/60;
    DEBUG_printSimulationStart();

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];
        const x = control.pose.x ?? 0;
        const y = control.pose.y ?? 0;
        const angle = control.pose.angle ?? 0;

        if (idx === 0) {
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    DEBUG_printRobotState(robot, dt);
                    return [robot.setPose(x, y, angle), "start", 0];
                }
            );
            continue;
        }

        if (control.kind === "pointDrive") {
            const constants = control.constants as LemMoveConstants;
            let started = false;
            let targetDist = 0;
            resetMoveToPoint();
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = moveToPoint(robot, dt, x, y, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "pointDrive", targetDist];
                }
            );
        }

        if (control.kind === "poseDrive") {
            const constants = control.constants as LemMoveConstants;
            let started = false;
            let targetDist = 0;
            resetMoveToPose();
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = moveToPose(robot, dt, x, y, angle, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "poseDrive", targetDist];
                }
            );
        }

        if (control.kind === "pointTurn") {
            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const turnToPos = getForwardSnapPose(path, idx);

            const pos: Coordinate =
            turnToPos
                ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                : previousPos
                ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                : { x: 0, y: 5 };

            const constants = control.constants as LemAngularConstants;
            let started = false;
            let targetDist = 0;
            resetTurnToPoint();
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        const targetAngle = toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle;
                        targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = turnToPoint(robot, dt, pos.x, pos.y, angle, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "pointTurn", targetDist];
                }
            );
        }

        if (control.kind === "angleTurn") {
            const constants = control.constants as LemAngularConstants;
            let started = false;
            let targetDist = 0;
            resetTurnToHeading();
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = turnToHeading(robot, dt, angle, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "angleTurn", targetDist];
                }
            );
        }

        if (control.kind === "pointSwing") {
            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const turnToPos = getForwardSnapPose(path, idx);

            const pos: Coordinate =
            turnToPos
                ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                : previousPos
                ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                : { x: 0, y: 5 };

            const constants = control.constants as LemAngularConstants;
            let started = false;
            let targetDist = 0;
            resetSwingToPoint();
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        const targetAngle = toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle;
                        targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = swingToPoint(robot, dt, pos.x, pos.y, angle, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "pointSwing", targetDist];
                }
            );
        }

        if (control.kind === "angleSwing") {
            const constants = control.constants as LemAngularConstants;
            let started = false;
            let targetDist = 0;
            resetSwingToHeading();
            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = swingToHeading(robot, dt, angle, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "angleSwing", targetDist];
                }
            );
        }

        if (control.kind === "distanceDrive") {
            const constants = control.constants as LemMoveConstants;
            let started = false;
            let targetDist = 0;

            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = moveToPoint(robot, dt, x, y, constants);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "distanceDrive", targetDist];
                }
            );
        }
    }

    return auton;
}

function DEBUG_printSegmentStart(idx: number, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cStarting ${getSegmentName("LemLib", kind)} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd(idx: number, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cEnding ${getSegmentName("LemLib", kind)} ${idx}`, "color: #ff6b6b; font-weight: bold");
}

function DEBUG_printRobotState(robot: Robot, dt: number) {
    if (!LOG_ROBOT_STATE) return;
    currentPathTime += dt;
    console.log(`%cx: ${robot.getX().toFixed(2)}, y: ${robot.getY().toFixed(2)}, θ: ${robot.getAngle().toFixed(2)} dt: ${currentPathTime.toFixed(2)}s`, "color: cyan");
}

function DEBUG_printSimulationStart() {
    if (!LOG_SIMULATION_NUMBER) return;
    simComputed += 1;
    console.log(`%cSTARTING SIMULATION COMPUTE #${simComputed}`, "color: violet; font-weight: bold");
}
