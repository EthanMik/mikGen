export interface Pose {
    x: number | null,
    y: number | null,
    angle: number | null
}

export interface PoseState { 
  x: number | null,
  y: number | null, 
  angle: number | null, 
  xVel: number | null, 
  yVel: number | null
}

export function posesEqual(a: Pose, b: Pose): boolean {
  return a.x === b.x && a.y === b.y && a.angle === b.angle;
}
