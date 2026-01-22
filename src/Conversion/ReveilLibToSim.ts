import { SIM_LENGTH } from "../core/ComputePathSim";
import { boomerangSegment, cleanupBoomerangSegment } from "../core/ReveiLibSim/DriveMotions/BoomerangSegment";
import { cleanUplookAt, lookAt } from "../core/ReveiLibSim/DriveMotions/LookAt";
import { cleanupPilonsSegment, pilonsSegment } from "../core/ReveiLibSim/DriveMotions/PilonsSegment";
import { cleanupTurnSegment, turnSegment } from "../core/ReveiLibSim/DriveMotions/TurnSegment";
import { cloneKRev } from "../core/ReveiLibSim/RevConstants";
import { getRevSegmentNames } from "../core/ReveiLibSim/Util";
import type { Robot } from "../core/Robot";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";
import type { SegmentKind } from "../core/Types/Segment";

const LOG_SEGMENT_START_AND_END = false;
const LOG_ROBOT_STATE = false;
const LOG_SIMULATION_NUMBER = false;

SIM_LENGTH.seconds = 99; // Runs the sim for a set amount of time DEFAULT 99 seconds
let currentPathTime = -2/60; // Starts calculation of simulation at -2/60 seconds (to account for first frame and start position)
let simComputed = 0; // Number of times the sim has been computed

export function reveilLibToSim(path: Path) {
    const auton: ((robot: Robot, dt: number) => boolean)[] = [];
    currentPathTime = -2/60;
    DEBUG_printSimulationStart();

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];
        const x = control.pose.x ?? 0;
        const y = control.pose.y ?? 0;
        const angle = control.pose.angle ?? 0;

        if (idx === 0) {
            auton.push(
                (robot: Robot, dt: number): boolean => {
                    DEBUG_printRobotState(robot, dt);
                    return robot.setPose(x, y, angle);
                }
            )
            continue;
        }

        if (control.kind === "pointDrive") {
            const kPilon = cloneKRev(control.constants.drive);
            cleanupPilonsSegment();
            let started = false;
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = pilonsSegment(robot, dt, x, y, kPilon);
                    if (output) { DEBUG_printSegmentEnd(idx, control.kind); }
                    return output;
                }
            );
        }

        if (control.kind === "poseDrive") {
            const kBoomerang = cloneKRev(control.constants.drive);
            cleanupBoomerangSegment();
            let started = false;
            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = boomerangSegment(robot, dt, x, y, angle, kBoomerang);
                    if (output) { DEBUG_printSegmentEnd(idx, control.kind); }
                    return output;
                }
            );
        }

        if (control.kind === "pointTurn" || control.kind === "pointSwing") {
            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const turnToPos = getForwardSnapPose(path, idx);
            const pos: Coordinate = turnToPos
                ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                : previousPos
                    ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                    : { x: 0, y: 5 };
            const kLook = cloneKRev(control.constants.turn);
            cleanUplookAt();
            let started = false;
            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = lookAt(robot, dt, pos.x, pos.y, angle ?? 0, kLook);
                    if (output) { DEBUG_printSegmentEnd(idx, control.kind); }
                    return output;
                }
            );
        }

        if (control.kind === "angleTurn" || control.kind === "angleSwing") {
            const kTurn = cloneKRev(control.constants.turn);
            cleanupTurnSegment();
            let started = false;
            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = turnSegment(robot, dt, angle, kTurn);
                    if (output) { DEBUG_printSegmentEnd(idx, control.kind); }
                    return output;
                }
            );
        }
    }
    return auton;
}

function DEBUG_printSegmentStart(idx: number, kind: SegmentKind) { 
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cStarting ${getRevSegmentNames(kind)} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd(idx: number, kind: SegmentKind) { 
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cEnding ${getRevSegmentNames(kind)} ${idx}`, "color: #ff6b6b; font-weight: bold");
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