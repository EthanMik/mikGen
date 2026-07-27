export interface Pose {
    x: number | null,
    y: number | null,
    angle: number | null
}

/** A bezier control point. Structurally a Pose, so it works anywhere a Pose is taken. */
export interface ControlPoint extends Pose {
    selected: boolean,
    visible: boolean
}

export function createControlPoint(x: number, y: number): ControlPoint {
    return { x, y, angle: null, selected: false, visible: true };
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
