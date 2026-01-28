import { getDefaultConstants } from "../core/DefaultConstants";
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

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];
        const x = control.pose.x ?? 0;
        const y = control.pose.y ?? 0;
        const angle = control.pose.angle ?? 0;

        if (idx === 0) {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    return robot.setPose(x, y, angle);
                }
            )
            continue;
        }

        if (control.kind === "pointDrive") {
            const { drive, heading } = control.constants;
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    pointDrivePID.update(drive);
                    pointHeadingPID.update(heading);
                    return driveToPoint(robot, dt, x, y, pointDrivePID, pointHeadingPID);
                }
            );
        }

        if (control.kind === "poseDrive") {
            const { drive, heading } = control.constants;
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    poseDrivePID.update(drive);
                    poseHeadingPID.update(heading);
                    return driveToPose(robot, dt, x, y, angle, poseDrivePID, poseHeadingPID);
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
                    return turnToPoint(robot, dt, pos.x, pos.y, angle, pointTurnPID);
                }
            );            
        }

        if (control.kind === "angleTurn") {
            
            const { turn } = control.constants;

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    angleTurnPID.update(turn)
                    return turnToAngle(robot, dt, angle, angleTurnPID);
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

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    pointSwingPID.update(swing);
                    return swingToPoint(robot, dt, pos.x, pos.y, angle, pointSwingPID);
                }
            );            
        }

        if (control.kind === "angleSwing") {
            
            const { swing } = control.constants;

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    angleSwingPID.update(swing)
                    return swingToAngle(robot, dt, angle, angleSwingPID);
                }
            );                 
        }
        
        if (control.kind === "distanceDrive") {
            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const distance = dist(previousPos?.x ?? 0, previousPos?.y ?? 0, x, y);

            const { drive, heading } = control.constants;

            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    distanceDrivePID.update(drive);
                    distanceHeadingPID.update(heading);
                    return driveDistance(robot, dt, distance, 0, distanceDrivePID, distanceHeadingPID);
                }
            );             
        }


    }
        
    return auton;
}