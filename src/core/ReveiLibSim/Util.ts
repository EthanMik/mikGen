import type { Pose } from "../Types/Pose";
import { normalizeDeg, toRad } from "../Util";

export function to_relative(currentPose: Pose, referencePose: Pose): Pose {
  const dx = (referencePose.x ?? 0) - (currentPose.x ?? 0);
  const dy = (referencePose.y ?? 0) - (currentPose.y ?? 0);

  const psi = toRad(referencePose.angle ?? 0);

  return {
    x: dx * Math.cos(psi) - dy * Math.sin(psi),
    y: dx * Math.sin(psi) + dy * Math.cos(psi),
    angle: (currentPose.angle ?? 0) - (referencePose.angle ?? 0),
  };
}

export const wrapDeg180 = (deg: number) => {
  return deg - 360 * Math.floor((deg + 180) / 360);
};

export const copysign1 = (v: number) => {
  if (v === 0) return Object.is(v, -0) ? -1 : 1;
  return Math.sign(v);
};

export const dist = (ax: number, ay: number, bx: number, by: number) => {
  return Math.hypot(ax - bx, ay - by)
}