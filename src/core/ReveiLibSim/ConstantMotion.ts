import type { Pose } from "../Types/Pose";
import { toRad } from "../Util";

export function getConstantMotionPower(
  power: number,
  startState: Pose,
  targetState: Pose
): [number, number] {
  const theta = toRad(startState.angle ?? 0);

  const xFacing = Math.sin(theta);
  const yFacing = Math.cos(theta);

  const dx = (targetState.x ?? 0) - (startState.x ?? 0);
  const dy = (targetState.y ?? 0) - (startState.y ?? 0);

  const longitudinal = xFacing * dx + yFacing * dy;
  const newPower = longitudinal < 0 ? -power : power;

  return [newPower, newPower];
}
