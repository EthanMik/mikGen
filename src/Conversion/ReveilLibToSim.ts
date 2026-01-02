import { kBoomerang, kPilon, kTurn } from "../core/ReveiLibSim/RevConstants";
import { boomerangSegment } from "../core/ReveiLibSim/DriveMotions/BoomerangSegment";
import { lookAt } from "../core/ReveiLibSim/DriveMotions/LookAt";
import { pilonsSegment } from "../core/ReveiLibSim/DriveMotions/PilonsSegment";
import { turnSegment } from "../core/ReveiLibSim/DriveMotions/TurnSegment";
import type { Robot } from "../core/Robot";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";

export function reveilLibToSim(path: Path) {
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
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    return pilonsSegment(robot, dt, x, y, kPilon);
                }
            );
        }

        if (control.kind === "poseDrive") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    return boomerangSegment(robot, dt, x, y, angle, kBoomerang);
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
                    return lookAt(robot, dt, pos.x, pos.y, angle ?? 0, kTurn);
                }
            );            
        }

        if (control.kind === "angleTurn") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                    return turnSegment(robot, dt, angle, kTurn)
                }
            );                 
        }


    }
    
    return auton;
}