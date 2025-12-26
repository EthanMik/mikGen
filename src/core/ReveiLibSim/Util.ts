import type { Pose } from "../Types/Pose";
import { toRad } from "../Util";

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