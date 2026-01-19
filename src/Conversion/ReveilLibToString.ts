import type { ReveilLibConstants } from "../core/ReveiLibSim/RevConstants";
import { toRevCoordinate } from "../core/ReveiLibSim/Util";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";
import { trimZeros } from "../core/Util";

const roundOff = (val: number | undefined | null | string, digits: number) => {
    if (val === null || val === undefined || typeof val === "string") return "";
    return trimZeros(val.toFixed(digits));
}

export function reveilLibToString(path: Path, selected: boolean = false) {
    let pathString: string = '';
    let startWrapper = false;

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];

        if (selected && !control.selected) continue;

        const kind = control.kind;
        const revCoords = toRevCoordinate(control.pose.x ?? 0, control.pose.y ?? 0);
        const x = roundOff(revCoords.x, 2);
        const y = roundOff(revCoords.y, 2);

        const angle = roundOff(control.pose.angle, 2);

        // const commandName = control.command.name; 
        // const commandPercent = roundOff(control.command.percent, 0);
        

        if (idx === 0) {
            pathString += (
                `  odom->set_position({${x}_in, ${y}_in, ${angle}_deg});`
            )        
            continue;
        }


        if (control.groupId !== undefined && !startWrapper) {
            pathString += (
                `\n  reckless->go({`
            )
            startWrapper = true;
        }

        if (control.groupId === undefined) {
            pathString += (
                `\n  reckless->go({`
            )
        }
        
        if (kind === "angleTurn" || kind === "angleSwing") {
            const k = control.constants.turn as ReveilLibConstants;
            pathString += (
                `
    &TurnSegment(
      ${roundOff(k.maxSpeed, 2)}, ${roundOff(k.stopCoastPower, 2)},
      ${angle}_deg,
      ${roundOff((k.stopHarshThreshold ?? 0) / 1000, 3)}, ${roundOff((k.stopCoastThreshold ?? 0) / 1000, 2)}, ${roundOff(k.brakeTime, 2)}_ms
    ),`
            )
        }

        if (kind === "pointTurn" || kind === "pointSwing") {
            const k = control.constants.turn as ReveilLibConstants;
            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const turnToPos = getForwardSnapPose(path, idx);

            const pos: Coordinate =
            turnToPos
                ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                : previousPos
                ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                : { x: 0, y: 5 };
            
            const turnX = roundOff(pos.x, 2);
            const turnY = roundOff(pos.y, 2);

            pathString += (
                `
    &LookAt(
      ${roundOff(k.maxSpeed, 2)}, ${roundOff(k.stopCoastPower, 2)},
      {${turnX}_in, ${turnY}_in}, ${roundOff(k.dropEarly, 2)}_deg
      ${roundOff((k.stopHarshThreshold ?? 0) / 1000, 3)}, ${roundOff((k.stopCoastThreshold ?? 0) / 1000, 2)}, ${roundOff(k.brakeTime, 2)}_ms,
    ),`
            )
        }

        if (kind === "pointDrive") {
            const k = control.constants.drive as ReveilLibConstants;
            pathString += (
                `
    &PilonsSegment(
      &ConstantMotion(${roundOff(k.maxSpeed, 2)}),
      &PilonsCorrection(${roundOff(k.kCorrection, 1)}, ${roundOff(k.maxError, 2)}_in),
      &SimpleStop(${roundOff(k.stopHarshThreshold, 0)}_ms, ${roundOff(k.stopCoastThreshold, 0)}_ms, ${roundOff(k.stopCoastPower, 2)}),
      {${x}_in, ${y}_in}, ${roundOff(k.dropEarly, 2)}_in
    ),`
            )          
        }

        if (kind === "poseDrive") {
            const k = control.constants.drive as ReveilLibConstants;
            pathString += (
                `
    &BoomerangSegment(
      &ConstantMotion(${roundOff(k.maxSpeed, 2)}),
      &PilonsCorrection(${roundOff(k.kCorrection, 1)}, ${roundOff(k.maxError, 2)}_in),
      &SimpleStop(${roundOff(k.stopHarshThreshold, 0)}_ms, ${roundOff(k.stopCoastThreshold, 0)}_ms, ${roundOff(k.stopCoastPower, 2)}),
      ${roundOff(k.lead, 2)},
      {${x}_in, ${y}_in, ${angle}_deg}, ${roundOff(k.dropEarly, 2)}_in
    ),`
            )     
        }

        if (startWrapper && path.segments[idx + 1]?.groupId !== control.groupId) {
            pathString += (
                `\n  });`
            )            
            startWrapper = false;
        }

        if (control.groupId === undefined) {
            pathString += (
                `\n  });`
            )        
        }

    }

    if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
    return pathString;
}