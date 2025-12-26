import type { PathFormat } from "../formats/PathFormat";
import { driveToPoint, driveToPose, swingToAngle, turnToAngle, turnToPoint } from "./mikLibSim/DriveMotions";
import { PID } from "./mikLibSim/PID";
import { pilonsSegment } from "./ReveiLibSim/driveMotions";
import { PilonsCorrection } from "./ReveiLibSim/PilonsCorrection";
import { SimpleStop } from "./ReveiLibSim/SimpleStop";
import type { Robot } from "./Robot";
import type { Coordinate } from "./Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "./Types/Path";
import { getDefaultConstantsForKind } from "./Types/Segment";


export function convertPathtoSim(path: Path): ((robot: Robot, dt: number) => boolean)[] {
    const pointTurnPID = new PID(getDefaultConstantsForKind("pointTurn").turn);

    const angleTurnPID = new PID(getDefaultConstantsForKind("angleTurn").turn);

    const pointDrivePID = new PID(getDefaultConstantsForKind("pointDrive").drive);
    const pointHeadingPID = new PID(getDefaultConstantsForKind("pointDrive").heading);

    const poseDrivePID = new PID(getDefaultConstantsForKind("poseDrive").drive);
    const poseHeadingPID = new PID(getDefaultConstantsForKind("poseDrive").heading);

    
    const auton: ((robot: Robot, dt: number) => boolean)[] = [];

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];

        if (idx === 0) {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    return robot.setPose(control.pose.x, control.pose.y, control.pose.angle);
                }
            )
            continue;
        }

        if (control.kind === "pointDrive") {
            const { drive, heading } = control.constants;
            const p = new PilonsCorrection(1, 0.5); 
            const s = new SimpleStop(60, 200, .25);
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    pointDrivePID.update(drive);
                    pointHeadingPID.update(heading);
                    return pilonsSegment(robot, dt, pointDrivePID.maxSpeed, p, s, control.pose.x, control.pose.y, 0, 0);
                    // return driveToPoint(robot, dt, control.pose.x, control.pose.y, pointDrivePID, pointHeadingPID);
                }
            );
        }

        if (control.kind === "poseDrive") {
            const { drive, heading } = control.constants;
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    poseDrivePID.update(drive);
                    poseHeadingPID.update(heading);
                    return driveToPose(robot, dt, control.pose.x, control.pose.y, control.pose.angle, poseDrivePID, poseHeadingPID);
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

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    pointTurnPID.update(turn);
                    return turnToPoint(robot, dt, pos.x, pos.y, control.pose.angle ?? 0, pointTurnPID);
                }
            );            
        }

        if (control.kind === "angleTurn") {
            
            const { turn } = control.constants;

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    angleTurnPID.update(angleTurnPID)
                    return turnToAngle(robot, dt, control.pose.angle, angleTurnPID);
                }
            );                 
        }


    }
        
    return auton;
}

export function convertPath(path: Path, pathFormat: PathFormat): string {
    // let pathString: string = '';

    // for (let idx = 0; idx < path.segments.length; idx++) {
    //     const control = path.segments[idx];

    //     if (idx === 0) {
    //         pathString += pathFormat.startToString(control.position, control.heading);
    //         continue;
    //     }

    //     pathString += pathFormat.driveToString(control.position, control.drivePower / 100, '', true);
    //     if (control.turnToPos !== null) {
    //         pathString += pathFormat.turnToString(control.turnToPos, control.turnPower / 100, '', true);
    //     }
    // }
    
    // return pathString;
    return ""
}