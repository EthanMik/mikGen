import { SIM_CONSTANTS } from "../core/ComputePathSim";
import { getDefaultConstants, getSegmentName } from "../core/DefaultConstants";
import type { SegmentKind } from "../core/InitialDefaults";
import { driveDistance } from "../core/mikLibSim/DriveMotions/DriveDistance";
import { driveToPoint } from "../core/mikLibSim/DriveMotions/DriveToPoint";
import { driveToPose } from "../core/mikLibSim/DriveMotions/DriveToPose";
import { swingToAngle } from "../core/mikLibSim/DriveMotions/SwingToAngle";
import { swingToPoint } from "../core/mikLibSim/DriveMotions/SwingToPoint";
import { turnToAngle } from "../core/mikLibSim/DriveMotions/TurnToAngle";
import { turnToPoint } from "../core/mikLibSim/DriveMotions/TurnToPoint";
import { PID } from "../core/mikLibSim/PID";
import { dist } from "../core/ReveiLibSim/Util";
import type { Robot } from "../core/Robot";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";

const LOG_SEGMENT_START_AND_END = true;
const LOG_ROBOT_STATE = true;
const LOG_SIMULATION_NUMBER = true;

SIM_CONSTANTS.seconds = 99; // Runs the sim for a set amount of time DEFAULT 99 seconds
let currentPathTime = -2/60; // Starts calculation of simulation at -2/60 seconds (to account for first frame and start position)
let simComputed = 0; // Number of times the sim has been computed

export function mikLibToSim(path: Path) {
    const pointTurnPID = new PID(getDefaultConstants("mikLib", "pointTurn").turn);
    const angleTurnPID = new PID(getDefaultConstants("mikLib", "angleTurn").turn);

    const pointDrivePID = new PID(getDefaultConstants("mikLib", "pointDrive").drive);
    const pointHeadingPID = new PID(getDefaultConstants("mikLib", "pointDrive").heading);

    const poseDrivePID = new PID(getDefaultConstants("mikLib", "poseDrive").drive);
    const poseHeadingPID = new PID(getDefaultConstants("mikLib", "poseDrive").heading);

    const pointSwingPID = new PID(getDefaultConstants("mikLib", "pointSwing").swing);
    const angleSwingPID = new PID(getDefaultConstants("mikLib", "angleSwing").swing);

    const distanceDrivePID = new PID(getDefaultConstants("mikLib", "distanceDrive").drive);
    const distanceHeadingPID = new PID(getDefaultConstants("mikLib", "distanceDrive").heading);

    
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
            const { drive, heading } = control.constants;
            let started = false;
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    pointDrivePID.update(drive);
                    pointHeadingPID.update(heading);

                    const output = driveToPoint(robot, dt, x, y, pointDrivePID, pointHeadingPID); 
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);

                    return output; 
                }
            );
        }

        if (control.kind === "poseDrive") {
            const { drive, heading } = control.constants;
            let started = false;
            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    poseDrivePID.update(drive);
                    poseHeadingPID.update(heading);
                    const output = driveToPose(robot, dt, x, y, angle, poseDrivePID, poseHeadingPID);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return output;
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

            const { turn } = control.constants;
            let started = false;

            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    pointTurnPID.update(turn);
                    const output = turnToPoint(robot, dt, pos.x, pos.y, angle, pointTurnPID);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return output;
                }
            );
        }

        if (control.kind === "angleTurn") {
            const { turn } = control.constants;
            let started = false;

            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    angleTurnPID.update(turn);
                    const output = turnToAngle(robot, dt, angle, angleTurnPID);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return output;
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

            const { swing } = control.constants;
            let started = false;

            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    pointSwingPID.update(swing);
                    const output = swingToPoint(robot, dt, pos.x, pos.y, angle, pointSwingPID);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return output;
                }
            );
        }

        if (control.kind === "angleSwing") {
            const { swing } = control.constants;
            let started = false;

            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    angleSwingPID.update(swing);
                    const output = swingToAngle(robot, dt, angle, angleSwingPID);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return output;
                }
            );
        }
        
        if (control.kind === "distanceDrive") {
            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const distance = dist(previousPos?.x ?? 0, previousPos?.y ?? 0, x, y);

            const { drive, heading } = control.constants;
            let started = false;

            auton.push(
                (robot: Robot, dt: number): boolean => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    distanceDrivePID.update(drive);
                    distanceHeadingPID.update(heading);
                    const output = driveDistance(robot, dt, distance, 0, distanceDrivePID, distanceHeadingPID);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return output;
                }
            );
        }


    }
        
    return auton;
}

function DEBUG_printSegmentStart(idx: number, kind: SegmentKind) { 
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cStarting ${getSegmentName("mikLib", kind)} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd(idx: number, kind: SegmentKind) { 
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cEnding ${getSegmentName("mikLib", kind)} ${idx}`, "color: #ff6b6b; font-weight: bold");
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