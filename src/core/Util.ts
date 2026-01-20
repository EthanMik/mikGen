/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Coordinate } from "./Types/Coordinate";
import type { Pose } from "./Types/Pose";

export interface Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
}

export const FIELD_REAL_DIMENSIONS: Rectangle = { x: -72, y: 72, w: 145.2756, h: 145.2756 };
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

export function rotatePoint(point: Coordinate, angle: number): Coordinate {
  const s = Math.sin(toRad(angle));
  const c = Math.cos(toRad(angle));

  const x = point.x;
  const y = point.y;

  const xr = x * c - y * s;
  const yr = x * s + y * c;

  return { x: xr, y: yr };
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
      const dy = field.y + sy * (img.y - position.y)

      return { x: dx, y: dy }
  }
  
export function toPX(position: Coordinate, field: Rectangle, img: Rectangle): Coordinate {
    const sx = img.w / field.w
    const sy = img.h / field.h 

    const dx = img.x + sx * (position.x - field.x)
    const dy = -img.y + sy * (position.y - field.y)

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

export function trimZeros(s: string) {
  return s.replace(/\.0+$/u, "").replace(/(\.\d*?[1-9])0+$/u, "$1");
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

const isPlainObject = (v: any) => v && typeof v === "object" && !Array.isArray(v);


// chat gpt equal universal merger this code may be broken
export function mergeDeep(base: any, patch: any): any {
    if (!isPlainObject(base) || !isPlainObject(patch)) {
        return patch === undefined ? base : patch;
    }

    const out: any = { ...base };

    for (const key of Object.keys(patch)) {
        const patchValue = (patch as any)[key];
        const baseValue = (base as any)[key];

        if (isPlainObject(patchValue) && isPlainObject(baseValue)) {
            out[key] = mergeDeep(baseValue, patchValue);
        } else {
            out[key] = patchValue;
        }
    }

    return out;
};

// chat gpt equal universal equal checker this code may be broken
export function deepEqual(a: any, b: any): boolean {
  const seen = new WeakMap<object, WeakSet<object>>();

  const eq = (x: any, y: any): boolean => {
    if (Object.is(x, y)) return true;
    if (typeof x !== typeof y) return false;
    if (x == null || y == null) return false;

    const tx = typeof x;
    if (tx !== "object" && tx !== "function") return false;

    const ox = x as object;
    const oy = y as object;
    let ys = seen.get(ox);
    if (!ys) {
      ys = new WeakSet<object>();
      seen.set(ox, ys);
    } else if (ys.has(oy)) {
      return true;
    }
    ys.add(oy);

    if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime();
    if (x instanceof RegExp && y instanceof RegExp) return x.toString() === y.toString();

    if (x instanceof Map && y instanceof Map) {
      if (x.size !== y.size) return false;
      for (const [kx, vx] of x) {
        if (!y.has(kx)) return false;
        if (!eq(vx, y.get(kx))) return false;
      }
      return true;
    }

    if (x instanceof Set && y instanceof Set) {
      if (x.size !== y.size) return false;
      const yArr = Array.from(y);
      outer: for (const xv of x) {
        for (let i = 0; i < yArr.length; i++) {
          if (eq(xv, yArr[i])) {
            yArr.splice(i, 1);
            continue outer;
          }
        }
        return false;
      }
      return true;
    }

    if (Array.isArray(x) || Array.isArray(y)) {
      if (!Array.isArray(x) || !Array.isArray(y)) return false;
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; i++) {
        if (!eq(x[i], y[i])) return false;
      }
      return true;
    }

    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;

    const xKeys = Reflect.ownKeys(x);
    const yKeys = Reflect.ownKeys(y);
    if (xKeys.length !== yKeys.length) return false;

    for (const k of xKeys) {
      if (!yKeys.includes(k)) return false;
    }

    for (const k of xKeys) {
      if (!eq((x as any)[k], (y as any)[k])) return false;
    }

    return true;
  };

  return eq(a, b);
}