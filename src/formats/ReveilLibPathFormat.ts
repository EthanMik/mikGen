// import type { Coordinate } from "../core/Types/Coordinate";
// import { PathFormat } from "../formats/PathFormat";

import { pilonsSegment } from "../core/ReveiLibSim/DriveMotions";
import { PilonsCorrection } from "../core/ReveiLibSim/PilonsCorrection";
import { SimpleStop } from "../core/ReveiLibSim/SimpleStop";
import type { Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";

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
                    const pilonsCorrection = new PilonsCorrection(2, 0.5);
                    const simpleStop = new SimpleStop(60, 200, 0.25);
                    return pilonsSegment(robot, dt, 1, pilonsCorrection, simpleStop, control.pose.x, control.pose.y, 0, 0);
                }
            );
        }

        if (control.kind === "poseDrive") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 
                }
            );
        }
        
        if (control.kind === "pointTurn") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 

                }
            );            
        }

        if (control.kind === "angleTurn") {
            auton.push(
                (robot: Robot, dt: number): boolean => { 

                }
            );                 
        }


    }
    
    return auton;
}