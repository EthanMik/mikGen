import type { PathFormat } from "../formats/PathFormat";
import { kHeadingPID, kOdomDrivePID, kOdomHeadingPID, kturnPID } from "./mikLibSim/Constants";
import { driveToPoint, drivetoPose, swingToAngle, turnToAngle, turnToPoint } from "./mikLibSim/DriveMotions";
import { PID } from "./mikLibSim/PID";
import type { Robot } from "./Robot";
import type { Coordinate } from "./Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "./Types/Path";


export function convertPathtoSim(path: Path): ((robot: Robot, dt: number) => boolean)[] {
    const turnPID = new PID(kturnPID);
    const drivePID = new PID(kOdomDrivePID);
    const headingPID = new PID(kOdomHeadingPID);
    
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
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    drivePID.update(kOdomDrivePID);
                    headingPID.update(kHeadingPID);
                    return driveToPoint(robot, dt, control.pose.x, control.pose.y, drivePID, headingPID);
                }
            );
        }

        if (control.kind === "poseDrive") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    drivePID.update(kOdomDrivePID);
                    headingPID.update(kHeadingPID);
                    return drivetoPose(robot, dt, control.pose.x, control.pose.y, control.pose.angle, drivePID, headingPID);
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

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    turnPID.update(kturnPID);
                    return turnToPoint(robot, dt, pos.x, pos.y, control.pose.angle ?? 0, turnPID);
                }
            );            
        }

        if (control.kind === "angleTurn") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    turnPID.update(kturnPID);
                    return turnToAngle(robot, dt, control.pose.angle, turnPID);
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