import { calculateHeading, findPointToFace, toRad } from "../Util";
import type { Coordinate } from "./Coordinate";
import { type Segment } from "./Segment";

export interface Path {
    name: string,
    segments: Segment[];
}

export const getBackwardsSnapPose = (path: Path, idx: number) => {
    for (let i = idx; i >= 0; i--) {
        const seg = path.segments[i];
        if (seg.pose.x !== null && seg.pose.y !== null) return seg.pose;
    }
    return null;
};

export const getBackwardsSnapIdx = (path: Path, idx: number) => {
    for (let i = idx; i >= 0; i--) {
        const seg = path.segments[i];
        if (seg.pose.x !== null && seg.pose.y !== null) return i;
    }
    return null;
};

export function getForwardSnapPose(path: Path, idx: number) {
    for (let i = idx; i < path.segments.length; i++) {
        const seg = path.segments[i];
        if (seg.pose.x !== null && seg.pose.y !== null) return seg.pose;
    }
    return null;
}

export type RobotState = { pos: Coordinate | null; heading: number | null };

function angleErrorDeg(a: number, b: number): number {
    let d = (a - b) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
}

function driveDirection(seg: Segment): "forwards" | "reversed" | "fastest" {
    const k = seg.constants[0] as unknown as Record<string, unknown> | undefined;
    if (!k) return "fastest";
    if (k.drive_direction === "forwards" || k.drive_direction === "reversed") return k.drive_direction;
    if (k.drive_directions !== undefined) return k.drive_directions === "rev" ? "reversed" : "forwards";
    if (typeof k.forwards === "boolean") return k.forwards ? "forwards" : "reversed";
    return "fastest";
}

export function propagateStates(path: Path): RobotState[] {
    const states: RobotState[] = [];
    let pos: Coordinate | null = null;
    let heading: number | null = null;

    for (let i = 0; i < path.segments.length; i++) {
        states.push({ pos, heading });
        const seg = path.segments[i];
        const { x, y, angle } = seg.pose;

        switch (seg.kind) {
            case "start":
                if (x !== null && y !== null) pos = { x, y };
                if (angle !== null) heading = angle;
                break;

            case "pointDrive":
            case "poseDrive": {
                if (x === null || y === null) break;
                const target = { x, y };
                let bearing: number | null = pos && (pos.x !== target.x || pos.y !== target.y) ? calculateHeading(pos, target) : null;
                if (bearing !== null) {
                    const direction = driveDirection(seg);
                    if (direction === "reversed") bearing += 180;
                    else if (direction === "fastest" && heading !== null && Math.abs(angleErrorDeg(bearing, heading)) > 90) bearing += 180;
                }
                pos = target;
                heading = seg.kind === "poseDrive" && angle !== null ? angle : (bearing ?? heading);
                break;
            }

            case "distanceDrive":
            case "strafeDrive": {
                const h: number | null = angle ?? heading;
                if (h === null) break;
                const move: number = seg.kind === "strafeDrive" ? h + 90 : h;
                if (pos) pos = { x: pos.x + Math.sin(toRad(move)) * seg.distance, y: pos.y + Math.cos(toRad(move)) * seg.distance };
                heading = h;
                break;
            }

            case "pointTurn":
            case "pointSwing": {
                if (!pos) break;
                heading = calculateHeading(pos, findPointToFace(path, i)) + (angle ?? 0);
                break;
            }

            case "angleTurn":
            case "angleSwing":
                if (angle !== null) heading = angle;
                break;

            case "wait":
                break;
        }
    }

    return states;
}

export function resolveHeading(
    path: Path,
    idx: number,
    offset: number = 0,
): { heading: Coordinate; headingMag: number } | null {
    const seg = path.segments[idx];
    const segAngle = seg.pose.angle;
    const h = segAngle ?? propagateStates(path)[idx]?.heading;
    if (h === null || h === undefined) return null;
    return { heading: { x: Math.sin(toRad(h + offset)), y: Math.cos(toRad(h + offset)) }, headingMag: 1 };
}

export function getSegmentDistance(path: Path, idx: number, offset: number = 0): number | null {
    if (idx <= 0) return null;
    const seg = path.segments[idx];
    const anchorPose = getBackwardsSnapPose(path, idx - 1);
    if (!anchorPose) return null;

    const resolved = resolveHeading(path, idx, offset);
    if (!resolved) {
        return Math.hypot((seg.pose.x ?? 0) - (anchorPose.x ?? 0), (seg.pose.y ?? 0) - (anchorPose.y ?? 0));
    }

    const { heading, headingMag } = resolved;
    const offsetX = (seg.pose.x ?? 0) - (anchorPose.x ?? 0);
    const offsetY = (seg.pose.y ?? 0) - (anchorPose.y ?? 0);
    return (offsetX * heading.x + offsetY * heading.y) / headingMag;
}

export function distanceToPosition(path: Path, idx: number, distance: number, offset: number = 0): { x: number; y: number } | null {
    if (idx <= 0) return null;
    const seg = path.segments[idx];
    const anchorPose = getBackwardsSnapPose(path, idx - 1);
    if (!anchorPose) return null;

    const resolved = resolveHeading(path, idx, offset);

    let hx: number, hy: number, hMag: number;
    if (!resolved) {
        hx = (seg.pose.x ?? 0) - (anchorPose.x ?? 0);
        hy = (seg.pose.y ?? 0) - (anchorPose.y ?? 0);
        hMag = Math.sqrt(hx * hx + hy * hy);
        if (hMag === 0) return null;
    } else {
        hx = resolved.heading.x;
        hy = resolved.heading.y;
        hMag = resolved.headingMag;
    }

    return {
        x: (anchorPose.x ?? 0) + (hx / hMag) * distance,
        y: (anchorPose.y ?? 0) + (hy / hMag) * distance,
    };
}