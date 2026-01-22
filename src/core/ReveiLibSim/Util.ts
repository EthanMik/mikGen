import type { Coordinate } from "../Types/Coordinate";
import type { Pose } from "../Types/Pose";
import type { SegmentKind } from "../Types/Segment";
import { rotatePoint, toRad } from "../Util";

export function to_relative(currentPose: Pose, referencePose: Pose): Pose {
  const x_shift = (currentPose.x ?? 0) - (referencePose.x ?? 0);
  const y_shift = (currentPose.y ?? 0) - (referencePose.y ?? 0);

  const psi = toRad(referencePose.angle ?? 0);

  return {
    x: x_shift * Math.cos(psi) + y_shift * Math.sin(psi),
    y: x_shift * -Math.sin(psi) + y_shift * Math.cos(psi),
    angle: (currentPose.angle ?? 0) - (referencePose.angle ?? 0),
  };
}

export const toRevCoordinate = (x: number, y: number): Coordinate => {
  return rotatePoint({ x: x, y: -y }, 90);
}

export const toRevVelocity = (xVel: number, yVel: number) => ({ xVel: yVel, yVel: xVel });

export const fromRevCoordinate = (x: number, y: number): Coordinate => {
  const rotated = rotatePoint({ x: x, y: y }, -90);
  return { x: rotated.x, y: -rotated.y };
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

export function getRevSegmentNames(kind: SegmentKind): string {
    switch (kind) {
        case "pointDrive": return "Pilon Segment";
        case "poseDrive": return "Boomerang Segment";
        case "pointTurn": return "Look At";
        case "angleTurn": return "Turn Segment";
        default: return kind;
    }
}
