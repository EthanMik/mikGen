import type { Pose } from "../Types/Pose";
import { toRad } from "../Util";

export function getConstantMotionPower(power: number, startState: Pose, targetState: Pose): [number, number] {
    const xFacing = Math.cos(toRad(startState.angle ?? 0)); 
    const yfacing = Math.sin(toRad(startState.angle ?? 0))

    const initialLongitudalDistance = xFacing * ((targetState.x ?? 0) - (startState.x ?? 0)) + yfacing * ((targetState.y ?? 0) - (startState.y ?? 0))
    const isBackwards = (initialLongitudalDistance < 0);
    const newPower = isBackwards ? -power : power; 

    return [newPower, newPower];
}