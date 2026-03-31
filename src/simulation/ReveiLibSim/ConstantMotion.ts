import type { Pose } from "../../core/Types/Pose";
import { toRad } from "../../core/Util";

export function getConstantMotionPower(
  power: number,
  startState: Pose,
  targetState: Pose,
): [number, number] {
  const theta = toRad(startState.angle ?? 0);

  const xFacing = Math.cos(theta);
  const yFacing = Math.sin(theta);

  const dx = (targetState.x ?? 0) - (startState.x ?? 0);
  const dy = (targetState.y ?? 0) - (startState.y ?? 0);

  const initialLongitudinalDistance = xFacing * dx + yFacing * dy;

  const opower =
    initialLongitudinalDistance < 0 ? -Math.abs(power) : Math.abs(power);

  return [opower, opower];
}
