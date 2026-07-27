import { createControlPoint, type ControlPoint } from "./Pose";
import type { Coordinate } from "./Coordinate";
import { getBackwardsSnapPose, type Path } from "./Path";
import type { Segment } from "./Segment";

/**
 * Paths saved before bezier segments existed have no `controls`, so always read through this.
 * Lives here rather than in Segment.ts so that reading controls does not pull the format
 * registry into a module that loads before it is initialized.
 */
export function segmentControls(seg: Segment): ControlPoint[] {
    return seg.controls ?? [];
}

/** Slot 0 sits a third along the chord, slot 1 two thirds, giving an even default curve. */
export function chordControlPosition(p0: Coordinate, p1: Coordinate, slot: number): Coordinate {
    const t = slot === 0 ? 1 / 3 : 2 / 3;
    return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
}

export function seedControls(p0: Coordinate, p1: Coordinate, count = 2): ControlPoint[] {
    const controls: ControlPoint[] = [];
    for (let slot = 0; slot < count; slot++) {
        const pos = chordControlPosition(p0, p1, slot);
        controls.push(createControlPoint(pos.x, pos.y));
    }
    return controls;
}

/** Endpoints of a bezier segment, independent of how many controls it currently has. */
export function bezierEndpoints(path: Path, idx: number): { p0: Coordinate; p1: Coordinate } | null {
    if (idx <= 0) return null;
    const seg = path.segments[idx];
    if (seg === undefined || seg.pose.x === null || seg.pose.y === null) return null;
    const startPose = getBackwardsSnapPose(path, idx - 1);
    if (startPose === null || startPose.x === null || startPose.y === null) return null;
    return { p0: { x: startPose.x, y: startPose.y }, p1: { x: seg.pose.x, y: seg.pose.y } };
}

/** A cubic bezier: start, two controls, end. */
export type Bezier = {
    p0: Coordinate;
    c1: Coordinate;
    c2: Coordinate;
    p1: Coordinate;
};

/**
 * Resolves a bezierCurve segment into a cubic. A segment may carry fewer than two controls
 * because the user deleted one, so lower degrees are elevated to their exact cubic equivalent:
 * one control becomes a quadratic raised to a cubic, none becomes the straight chord.
 */
export function resolveBezier(path: Path, idx: number): Bezier | null {
    if (idx <= 0) return null;

    const seg = path.segments[idx];
    if (seg === undefined || seg.pose.x === null || seg.pose.y === null) return null;

    const startPose = getBackwardsSnapPose(path, idx - 1);
    if (startPose === null || startPose.x === null || startPose.y === null) return null;

    const p0: Coordinate = { x: startPose.x, y: startPose.y };
    const p1: Coordinate = { x: seg.pose.x, y: seg.pose.y };

    const controls = segmentControls(seg).filter(c => c.x !== null && c.y !== null);

    if (controls.length >= 2) {
        return {
            p0,
            c1: { x: controls[0].x!, y: controls[0].y! },
            c2: { x: controls[1].x!, y: controls[1].y! },
            p1,
        };
    }

    if (controls.length === 1) {
        // Degree elevation: the quadratic P0,C,P1 is exactly the cubic below
        const c: Coordinate = { x: controls[0].x!, y: controls[0].y! };
        return {
            p0,
            c1: { x: p0.x + (2 / 3) * (c.x - p0.x), y: p0.y + (2 / 3) * (c.y - p0.y) },
            c2: { x: p1.x + (2 / 3) * (c.x - p1.x), y: p1.y + (2 / 3) * (c.y - p1.y) },
            p1,
        };
    }

    return { p0, c1: p0, c2: p1, p1 };
}

export function bezierPointAt(b: Bezier, t: number): Coordinate {
    const u = 1 - t;
    const a0 = u * u * u;
    const a1 = 3 * u * u * t;
    const a2 = 3 * u * t * t;
    const a3 = t * t * t;
    return {
        x: a0 * b.p0.x + a1 * b.c1.x + a2 * b.c2.x + a3 * b.p1.x,
        y: a0 * b.p0.y + a1 * b.c1.y + a2 * b.c2.y + a3 * b.p1.y,
    };
}

/** First derivative. Falls back to the chord where the curve is momentarily stationary. */
export function bezierTangentAt(b: Bezier, t: number): Coordinate {
    const u = 1 - t;
    const d0 = 3 * u * u;
    const d1 = 6 * u * t;
    const d2 = 3 * t * t;
    const x = d0 * (b.c1.x - b.p0.x) + d1 * (b.c2.x - b.c1.x) + d2 * (b.p1.x - b.c2.x);
    const y = d0 * (b.c1.y - b.p0.y) + d1 * (b.c2.y - b.c1.y) + d2 * (b.p1.y - b.c2.y);
    if (Math.hypot(x, y) > 1e-9) return { x, y };
    return { x: b.p1.x - b.p0.x, y: b.p1.y - b.p0.y };
}

export function sampleBezier(b: Bezier, steps: number): Coordinate[] {
    const points: Coordinate[] = [];
    for (let i = 0; i <= steps; i++) points.push(bezierPointAt(b, i / steps));
    return points;
}

export function polylineLength(points: Coordinate[]): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return total;
}
