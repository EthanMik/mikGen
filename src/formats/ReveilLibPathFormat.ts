// import type { Coordinate } from "../core/Types/Coordinate";
// import { PathFormat } from "../formats/PathFormat";

import { kBoomerang, kPilon, kTurn } from "../core/ReveiLibSim/Constants";
import { boomerangSegment } from "../core/ReveiLibSim/DriveMotions/BoomerangSegment";
import { lookAt } from "../core/ReveiLibSim/DriveMotions/LookAt";
import { pilonsSegment } from "../core/ReveiLibSim/DriveMotions/PilonsSegment";
import { turnSegment } from "../core/ReveiLibSim/DriveMotions/TurnSegment";
import type { Robot } from "../core/Robot";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";

// export class ReveilLibPathFormat extends PathFormat {
  
//   // Correction
//   pilons_correction: string = 'pilons_correction'

//   // Power
//   coast_power: string = '0.25'

//   // Stopping
//   harsh: string = '0.06_s'
//   coast: string = '0.02_s'
//   timeout: string = '0_s'

//   // Turn 
//   harsh_turn: string = '0.085';
//   coast_turn: string = '0.23';
//   brake_time: string = '0.1_s';

//   startToString(position: Coordinate, heading: number): string {
//     return (
//     `
//   drivetrain::odom->set_position({${position.x.toFixed(2)}_in, ${position.y.toFixed(2)}_in, ${heading.toFixed(2)}_deg});
//     `
//     );
//   }

//   driveToString(position: Coordinate, speed: number, callback: string, toPoint: boolean): string {
//     return (
//     `
//   reckless->go({
//     &PilonsSegment(
//       &ConstantMotion(${speed.toFixed(2)}),
//       ${this.pilons_correction},
//       &SimpleStop(${this.harsh}, ${this.coast}, ${this.coast_power}, ${this.timeout}),
//       {${position.x.toFixed(2)}_in, ${position.y.toFixed(2)}_in}
//     )
//   });
//     `
//     );
//   }

//   turnToString(position: Coordinate, speed: number, callback: string, toPoint: boolean): string {
//     return (
//     `
//   reckless->go({
//     &LookAt(
//       ${speed.toFixed(2)},
//       ${this.coast_power},
//       {${position.x.toFixed(2)}_in, ${position.y.toFixed(2)}_in},
//       0_deg,
//       ${this.harsh_turn},
//       ${this.coast_turn},
//       ${this.brake_time}
//     )
//   });
//     `
//     );
//   }
// }

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