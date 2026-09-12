import type { Coordinate } from "./Types/Coordinate";

/**
 * Cross-track error for one instant. Positive is to the robot's left of where it should be.
 *
 * The number can come from two places and they are not equally good. When a motion algorithm
 * reports its own error, that is what the controller was actually reacting to, carrot position and
 * all, and it is used as-is. Only when a log predates that field does this module fall back to
 * measuring the pose against path geometry, which is an approximation: a time-indexed controller
 * such as Ramsete can be far from where it should be right now while still sitting exactly on the
 * curve, and nearest-point geometry scores that as perfect.
 */
export type XtePoint = {
    t: number,
    /** Signed error in inches, or degrees for a turn. */
    e: number,
    /** The pose that produced it, for drawing a tie line. */
    x: number,
    y: number,
    /** Point on the reference the error was measured to. Absent for a reported error. */
    rx?: number,
    ry?: number,
};

export type XteSource = "algorithm" | "geometry";

export type SegmentXte = {
    points: XtePoint[],
    source: XteSource,
    maxAbs: number,
    rms: number,
    meanAbs: number,
    /** Degrees for turns, inches otherwise, mirroring how SegmentTelemetry labels its numbers. */
    units: string,
};

export type NearestResult = {
    x: number,
    y: number,
    /** Unsigned distance to the reference. */
    distance: number,
    /** Signed distance, positive when the query point is left of the reference's travel direction. */
    signed: number,
    /** Arc length from the start of the reference to the projected point. */
    arcLength: number,
};

/**
 * Closest point on a polyline, with the side the query point falls on.
 *
 * The sign uses the 2D cross product of the reference direction and the offset to the point. Inches
 * are y-up here, so a positive cross product puts the point counter-clockwise from the direction of
 * travel, which is the robot's left.
 */
export function nearestOnPolyline(reference: Coordinate[], x: number, y: number): NearestResult | null {
    if (reference.length === 0) return null;
    if (reference.length === 1) {
        const dx = x - reference[0].x;
        const dy = y - reference[0].y;
        const distance = Math.hypot(dx, dy);
        return { x: reference[0].x, y: reference[0].y, distance, signed: distance, arcLength: 0 };
    }

    let best: NearestResult | null = null;
    let travelled = 0;

    for (let i = 1; i < reference.length; i++) {
        const ax = reference[i - 1].x, ay = reference[i - 1].y;
        const bx = reference[i].x, by = reference[i].y;
        const dx = bx - ax, dy = by - ay;
        const lengthSq = dx * dx + dy * dy;
        const length = Math.sqrt(lengthSq);

        // A repeated point carries no direction, so it cannot host a projection or a sign
        if (lengthSq === 0) continue;

        const alpha = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSq));
        const px = ax + alpha * dx;
        const py = ay + alpha * dy;
        const distance = Math.hypot(x - px, y - py);

        if (best === null || distance < best.distance) {
            const cross = dx * (y - ay) - dy * (x - ax);
            best = {
                x: px,
                y: py,
                distance,
                signed: cross === 0 ? 0 : Math.sign(cross) * distance,
                arcLength: travelled + alpha * length,
            };
        }

        travelled += length;
    }

    return best;
}

function summarize(points: XtePoint[], source: XteSource, units: string): SegmentXte {
    if (points.length === 0) {
        return { points, source, maxAbs: 0, rms: 0, meanAbs: 0, units };
    }

    let maxAbs = 0;
    let sumSq = 0;
    let sumAbs = 0;

    for (const p of points) {
        const abs = Math.abs(p.e);
        if (abs > maxAbs) maxAbs = abs;
        sumSq += p.e * p.e;
        sumAbs += abs;
    }

    return {
        points,
        source,
        maxAbs,
        rms: Math.sqrt(sumSq / points.length),
        meanAbs: sumAbs / points.length,
        units,
    };
}

export type PoseSample = { t: number, x: number, y: number, xte?: number };

/**
 * Error for one motion. Prefers the algorithm's own number and falls back to geometry only when
 * every sample lacks one, so a run logged by newer firmware is never silently downgraded.
 *
 * A reference of fewer than two points, which is what a turn or a wait produces, yields an empty
 * result rather than a misleading zero.
 */
export function computeSegmentXte(
    samples: PoseSample[],
    reference: Coordinate[],
    units = "in",
): SegmentXte {
    const reported = samples.filter(s => s.xte !== undefined);

    if (reported.length > 0) {
        return summarize(
            reported.map(s => ({ t: s.t, e: s.xte as number, x: s.x, y: s.y })),
            "algorithm",
            units,
        );
    }

    if (reference.length < 2) return summarize([], "geometry", units);

    const points: XtePoint[] = [];
    for (const s of samples) {
        const near = nearestOnPolyline(reference, s.x, s.y);
        if (near === null) continue;
        points.push({ t: s.t, e: near.signed, x: s.x, y: s.y, rx: near.x, ry: near.y });
    }

    return summarize(points, "geometry", units);
}

/** Positional and angular error never share a scale, so a run is summarized as two of these. */
export type ErrorStats = { maxAbs: number, rms: number, count: number };

export type RunSummary = {
    /** Across segments measured in inches, which is every motion that follows a path. */
    linear: ErrorStats,
    /** Across segments measured in degrees, which is every turn and swing. */
    angular: ErrorStats,
};

const EMPTY: ErrorStats = { maxAbs: 0, rms: 0, count: 0 };

/**
 * Worst and average across a whole run, split by unit.
 *
 * Degrees and inches are kept apart deliberately: a turn reporting 90 would otherwise dominate
 * every drive in the run and drag the marker and the average onto a motion that was tracking fine.
 */
export function summarizeRun(segments: SegmentXte[]): RunSummary {
    const acc = { in: { maxAbs: 0, sumSq: 0, count: 0 }, deg: { maxAbs: 0, sumSq: 0, count: 0 } };

    for (const seg of segments) {
        const bucket = seg.units === "deg" ? acc.deg : acc.in;
        for (const p of seg.points) {
            const abs = Math.abs(p.e);
            if (abs > bucket.maxAbs) bucket.maxAbs = abs;
            bucket.sumSq += p.e * p.e;
            bucket.count++;
        }
    }

    const finish = (b: { maxAbs: number, sumSq: number, count: number }): ErrorStats =>
        b.count === 0 ? EMPTY : { maxAbs: b.maxAbs, rms: Math.sqrt(b.sumSq / b.count), count: b.count };

    return { linear: finish(acc.in), angular: finish(acc.deg) };
}
