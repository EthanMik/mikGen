import type { Pose } from "../Types/Pose";

import { toRad } from "../Util";
export function to_relative(currentPose: Pose, referencePose: Pose): Pose {
  const x_shift = (currentPose.x ?? 0) - (referencePose.x ?? 0);
  const y_shift = (currentPose.y ?? 0) - (referencePose.y ?? 0);

  const theta = toRad((referencePose.angle ?? 0));

  return {
    x: x_shift * Math.sin(theta) + y_shift * Math.cos(theta),
    y: x_shift * -Math.cos(theta) + y_shift * Math.sin(theta),
    angle: (currentPose.angle ?? 0) - (referencePose.angle ?? 0),
  };
}