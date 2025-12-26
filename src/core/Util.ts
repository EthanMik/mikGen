import type { Coordinate } from "./Types/Coordinate";
import type { Pose } from "./Types/Pose";

export interface Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
}

export const FIELD_REAL_DIMENSIONS: Rectangle = { x: -72, y: 72, w: 144, h: 144 };
export const FIELD_IMG_DIMENSIONS: Rectangle = { x: 0, y: 0, w: 575, h: 575 };

export function vector2Subtract(a: Coordinate, b: Coordinate): Coordinate {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function vector2Add(a: Coordinate, b: Coordinate): Coordinate {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function calculateHeading(currentPos: Coordinate, desiredPos: Coordinate): number {
  const dPos = vector2Subtract(desiredPos, currentPos);

  return toDeg(Math.atan2(dPos.x, dPos.y));
}

export function normalizeDeg(angle: number) { return ((angle % 360) + 360) % 360; }

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function toRad(degrees: number) { return (degrees * Math.PI) / 180; }

export function toDeg(radians: number) { return (radians * 180) / Math.PI; }

export function toInch(position: Coordinate, field: Rectangle, img: Rectangle): Coordinate {
    const sx = field.w / img.w
    const sy = field.h / img.h 

    const dx = field.x + sx * (position.x - img.x)
    const dy = field.y + sy * (-position.y - img.y)

    return {x: dx, y: dy}
}

export function toPX(position: Coordinate, field: Rectangle, img: Rectangle): Coordinate {
    const sx = img.w / field.w
    const sy = img.h / field.h 

    const dx = img.x + sx * (position.x - field.x)
    const dy = img.y + sy * (position.y - field.y)

    return {x: dx, y: -dy}
}

export function makeId(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function interpolatePoses(currentPose: Pose, previousPose: Pose, percent: number): Coordinate | null {
  const x1 = previousPose.x;
  const x2 = currentPose.x;
  const y1 = previousPose.y;
  const y2 = currentPose.y;
  if (x1 === null || x2 === null || y1 === null || y2 === null) return null; 
  if (percent < 0 && percent > 1) return null;

  if (x1 === x2) {
    return {x: x1, y: y1 + (y2 - y1) * percent}
  }

  const x = x1 + (x2 - x1) * percent;
  const slope = (y2 - y1) / (x2 - x1);
  const y = y1 + (x - x1) * slope

  return { x: x, y: y };
}

export function RectangleRectangleCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
        rect1.x + rect1.w  <= rect2.x ||
        rect2.x + rect2.w  <= rect1.x ||
        rect1.y + rect1.h <= rect2.y ||
        rect2.y + rect2.h <= rect1.y 
    );
}