import type { ReveilLibConstants } from "../core/ReveiLibSim/RevConstants";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";
import { trimZeros } from "../core/Util";

const roundOff = (val: number | undefined | null | string, digits: number) => {
    if (val === null || val === undefined || typeof val === "string") return "";
    return trimZeros(val.toFixed(digits));
}

export function reveilLibToString(path: Path, selected: boolean = false) {
    let pathString: string = '';

    let startWrapper = true;

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];

        if (selected && !control.selected) continue;

        const kind = control.kind;

        const x = roundOff(control.pose.x, 2);
        const y = roundOff(control.pose.y, 2);
        const angle = roundOff(control.pose.angle, 2);

        const k = control.constants as ReveilLibConstants;

        const commandName = control.command.name;
        const commandPercent = roundOff(control.command.percent, 0);

        if (commandName !== "") {
            startWrapper = true
        }
        
        if (idx === 0) {
            pathString += (
                ` odom->set_position({${x}_in, ${y}_in, ${angle}_deg});`
            )        
            continue;
        }
        
        if (kind === "angleTurn" || kind === "angleSwing") {
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

        startWrapper = false;
    }

    if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
    return pathString;
}