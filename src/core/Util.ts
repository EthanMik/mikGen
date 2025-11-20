import type { Coordinate } from "./Path";

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