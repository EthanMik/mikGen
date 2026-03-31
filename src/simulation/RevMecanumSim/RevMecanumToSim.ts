import { SIM_CONSTANTS } from "../../core/ComputePathSim";
import { getSegmentName } from "../DefaultConstants";
import type { SegmentKind } from "../InitialDefaults";
import type { Robot } from "../../core/Robot";
import { findPointToFace, toDeg } from "../../core/Util";
import type { RevMecanumDriveConstants, RevMecanumSwingConstants, RevMecanumTurnConstants } from "./RevMecanumConstant";
import { angle_error } from "../mikLibSim/Util";
import type { Path } from "../../core/Types/Path";
import { turnToPoint } from "../mikLibSim/DriveMotions/TurnToPoint";
import { turnToAngle } from "../mikLibSim/DriveMotions/TurnToAngle";
import { swingToPoint } from "../mikLibSim/DriveMotions/SwingToPoint";
import { swingToAngle } from "../mikLibSim/DriveMotions/SwingToAngle";
import { mecanumDriveToPose } from "./MecanumMotions/MecanumDriveToPose";
import { MecanumDriveToPoint } from "./MecanumMotions/MecanumDriveToPoint";

const LOG_SEGMENT_START_AND_END = true;
const LOG_ROBOT_STATE = true;
const LOG_SIMULATION_NUMBER = true;

SIM_CONSTANTS.seconds = 99;
let currentPathTime = -2/60;
let simComputed = 0;

export function RevMecanumToSim(path: Path) {

    const auton: ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] = [];
    currentPathTime = -2/60;
    DEBUG_printSimulationStart();

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];
        const x = control.pose.x ?? 0;
        const y = control.pose.y ?? 0;
        const angle = control.pose.angle ?? 0;
        const k = control.constants;

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
            const drive = (k as RevMecanumDriveConstants).drive;
            const heading = (k as RevMecanumDriveConstants).turn;

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

                    const output = MecanumDriveToPoint(robot, dt, x, y, drive, heading);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "pointDrive", targetDist];
                }
            );
        }

        if (control.kind === "poseDrive") {
            const drive = (k as RevMecanumDriveConstants).drive;
            const heading = (k as RevMecanumDriveConstants).turn;

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
                    const output = mecanumDriveToPose(robot, dt, x, y, angle, drive, heading);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "poseDrive", targetDist];
                }
            );
        }

        if (control.kind === "pointTurn") {
            const pos = findPointToFace(path, idx);
            const turn = (k as RevMecanumTurnConstants).turn;            

            let started = false;
            let targetDist = 0;

            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        const targetAngle = toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle;
                        targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = turnToPoint(robot, dt, pos.x, pos.y, angle, turn);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "pointTurn", targetDist];
                }
            );
        }

        if (control.kind === "angleTurn") {
            const turn = (k as RevMecanumTurnConstants).turn;            
            let started = false;
            let targetDist = 0;

            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = turnToAngle(robot, dt, angle, turn);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "angleTurn", targetDist];
                }
            );
        }

        if (control.kind === "pointSwing") {
            const pos = findPointToFace(path, idx);

            const swing = (k as RevMecanumSwingConstants).swing;
            let started = false;
            let targetDist = 0;

            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        const targetAngle = toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle;
                        targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = swingToPoint(robot, dt, pos.x, pos.y, angle, swing);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "pointSwing", targetDist];
                }
            );
        }

        if (control.kind === "angleSwing") {
            const swing = (k as RevMecanumSwingConstants).swing;
            let started = false;
            let targetDist = 0;

            auton.push(
                (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                    if (!started) {
                        DEBUG_printSegmentStart(idx, control.kind);
                        targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
                        started = true;
                    }
                    DEBUG_printRobotState(robot, dt);
                    const output = swingToAngle(robot, dt, angle, swing);
                    if (output) DEBUG_printSegmentEnd(idx, control.kind);
                    return [output, "angleSwing", targetDist];
                }
            );
        }
    }


    return auton;
}

function DEBUG_printSegmentStart(idx: number, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cStarting ${getSegmentName("RevMecanum", kind)} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd(idx: number, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cEnding ${getSegmentName("RevMecanum", kind)} ${idx}`, "color: #ff6b6b; font-weight: bold");
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
