import { calculateHeading, toRad } from "../Util";
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

export function resolveHeading(
    path: Path,
    idx: number,
    anchorPose: NonNullable<ReturnType<typeof getBackwardsSnapPose>>
): { heading: Coordinate; headingMag: number } | null {
    const seg = path.segments[idx];
    const prevSeg = path.segments[idx - 1];
    const segAngle = seg.pose.angle;

    if (segAngle !== null && segAngle !== undefined) {
        return { heading: { x: Math.sin(toRad(segAngle)), y: Math.cos(toRad(segAngle)) }, headingMag: 1 };
    }

    if (prevSeg.pose.angle !== null && prevSeg.pose.angle !== undefined) {
        if (prevSeg.kind === "pointSwing" || prevSeg.kind === "pointTurn") {
            const prevSegIdx = idx - 1;
            const turnToPos = getForwardSnapPose(path, prevSegIdx);
            const previousPos = getBackwardsSnapPose(path, prevSegIdx - 1);
            const turnTarget: Coordinate = turnToPos
                ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                : previousPos
                    ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                    : { x: 0, y: 5 };
            const fromPos: Coordinate = { x: anchorPose.x ?? 0, y: anchorPose.y ?? 0 };
            const bearing = calculateHeading(fromPos, turnTarget) + prevSeg.pose.angle;
            return { heading: { x: Math.sin(toRad(bearing)), y: Math.cos(toRad(bearing)) }, headingMag: 1 };
        }
        const prevSegAngle = prevSeg.pose.angle;
        return { heading: { x: Math.sin(toRad(prevSegAngle)), y: Math.cos(toRad(prevSegAngle)) }, headingMag: 1 };
    }

    if (anchorPose.angle !== null && anchorPose.angle !== undefined) {
        return { heading: { x: Math.sin(toRad(anchorPose.angle)), y: Math.cos(toRad(anchorPose.angle)) }, headingMag: 1 };
    }

    const anchorIdx = getBackwardsSnapIdx(path, idx - 1);
    const approachPose = anchorIdx !== null && anchorIdx > 0
        ? getBackwardsSnapPose(path, anchorIdx - 1)
        : null;
    if (!approachPose) return null;

    const hx = (anchorPose.x ?? 0) - (approachPose.x ?? 0);
    const hy = (anchorPose.y ?? 0) - (approachPose.y ?? 0);
    const mag = Math.sqrt(hx * hx + hy * hy);
    if (mag === 0) return null;

    return { heading: { x: hx, y: hy }, headingMag: mag };
}

export function getSegmentDistance(path: Path, idx: number): number | null {
    if (idx <= 0) return null;
    const seg = path.segments[idx];
    const anchorPose = getBackwardsSnapPose(path, idx - 1);
    if (!anchorPose) return null;

    const resolved = resolveHeading(path, idx, anchorPose);
    if (!resolved) {
        return Math.hypot((seg.pose.x ?? 0) - (anchorPose.x ?? 0), (seg.pose.y ?? 0) - (anchorPose.y ?? 0));
    }

    const { heading, headingMag } = resolved;
    const offsetX = (seg.pose.x ?? 0) - (anchorPose.x ?? 0);
    const offsetY = (seg.pose.y ?? 0) - (anchorPose.y ?? 0);
    return (offsetX * heading.x + offsetY * heading.y) / headingMag;
}

export function distanceToPosition(path: Path, idx: number, distance: number): { x: number; y: number } | null {
    if (idx <= 0) return null;
    const seg = path.segments[idx];
    const anchorPose = getBackwardsSnapPose(path, idx - 1);
    if (!anchorPose) return null;

    const resolved = resolveHeading(path, idx, anchorPose);

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