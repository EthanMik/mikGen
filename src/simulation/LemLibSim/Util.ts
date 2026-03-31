import type { Pose } from "../../core/Types/Pose";
import { toDeg, toRad } from "../../core/Util";

import type { TurnDirection } from "../mikLibSim/MikConstants";
import { LemPose } from "./Pose";

export function slew(target: number, current: number, maxChange: number): number {
    let change = target - current;
    if (maxChange === 0) return target;
    if (change > maxChange) change = maxChange;
    else if (change < -maxChange) change = -maxChange;
    return current + change;
}

export function toLemPose(pose: Pose, radians: boolean = false, standardPos: boolean = false): LemPose {
    let theta = toRad(pose.angle ?? 0);

    if (standardPos) theta = (Math.PI / 2) - theta;
    if (!radians) theta = toDeg(theta);

    return new LemPose(
        pose.x ?? 0,
        pose.y ?? 0,
        theta 
    );
}

export function sanitizeAngle(angle: number, radians: boolean): number {
    if (radians) return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    else return ((angle % 360) + 360) % 360;
}

export function angleError(target: number, position: number, radians: boolean = true, direction: TurnDirection | null = null): number {
    target = sanitizeAngle(target, radians);
    position = sanitizeAngle(position, radians);
    const max = radians ? 2 * Math.PI : 360;
    const rawError = target - position;
    switch (direction) {
        case "clockwise":
            return rawError < 0 ? rawError + max : rawError;
        case "counterclockwise":
            return rawError > 0 ? rawError - max : rawError;
        default: {
            const half = max / 2;
            return ((rawError + half) % max + max) % max - half;
        }
    }
}

export function avg(values: number[]): number {
    let sum = 0;
    for (const value of values) sum += value;
    return sum / values.length;
}

export function ema(current: number, previous: number, smooth: number): number {
    return current * smooth + previous * (1 - smooth);
}

export function getCurvature(pose: LemPose, other: LemPose): number {
    const theta = pose.theta;
    const side = Math.sign(Math.sin(theta) * (other.x - pose.x) - Math.cos(theta) * (other.y - pose.y));
    const a = -Math.tan(theta);
    const c = Math.tan(theta) * pose.x - pose.y;
    const x = Math.abs(a * other.x + other.y + c) / Math.sqrt(a * a + 1);
    const d = Math.hypot(other.x - pose.x, other.y - pose.y);

    return side * (2 * x) / (d * d);
}
