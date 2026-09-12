import type { Coordinate } from "./Types/Coordinate";

/**
 * Cross track error for one instant: how far sideways the robot sat from where it was supposed to
 * be. Positive means it was to its own left. Sideways is the whole point; how far along it had got
 * is a separate question this number deliberately says nothing about, which is why a robot that
 * overshoots a target by five inches and comes back can score near zero the entire way.
 *
 * The number reaches here from one of two places, and they are not equally trustworthy.
 *
 * The good source is the motion algorithm itself. Every follower keeps a running idea of where the
 * robot ought to be this instant, and that idea moves: a boomerang chases a carrot recomputed each
 * tick from its own distance to the target, and a schedule driven follower picks its reference by
 * the clock. Those references cannot be rebuilt afterwards from a list of poses, because each one
 * depended on where the robot happened to be at that moment. So the algorithm reports its own
 * number and this module passes it through untouched.
 *
 * The weak source is geometry: take the logged pose, find the closest point on the planned path,
 * measure the gap. It only runs when no sample carried a reported error. It is an approximation and
 * can be confidently wrong. A robot running ten seconds late but sitting perfectly on the curve
 * scores zero, because closest point has no notion of when the robot was meant to be there.
 *
 * Which one produced a result is recorded on SegmentXte.source rather than hidden, so a reader is
 * never left guessing which of the two they are looking at.
 */
export type XtePoint = {
    t: number,
    /** Signed error, positive to the robot's left. Inches for a drive, degrees for a turn. */
    e: number,
    /** Where the robot actually was. Kept so a tie line can be drawn from here to the reference. */
    x: number,
    y: number,
    /**
     * The point on the reference this error was measured against. Present only in geometry mode,
     * because that is the only mode that computes one. An algorithm hands over a bare number with
     * no accompanying point, so a reported error can be coloured but not tied to anything.
     */
    rx?: number,
    ry?: number,
};

/** Which of the two sources above produced a segment's numbers. */
export type XteSource = "algorithm" | "geometry";

/** Every sample of one motion, plus the three summary figures worth reading at a glance. */
export type SegmentXte = {
    points: XtePoint[],
    source: XteSource,
    /** Worst deviation anywhere in the motion, unsigned. The number that says how bad it got. */
    maxAbs: number,
    /** Root mean square. Punishes a few large excursions harder than meanAbs does. */
    rms: number,
    /** Average deviation, unsigned. Says how bad it was typically, not at its worst. */
    meanAbs: number,
    /**
     * Degrees for turns, inches otherwise, mirroring how SegmentTelemetry labels its numbers.
     * Carried on every segment because the two never share a scale and must never be pooled:
     * see summarizeRun, which exists mostly to keep them apart.
     */
    units: string,
};

export type NearestResult = {
    /** The projected point itself, lying on the reference. */
    x: number,
    y: number,
    /** Unsigned distance from the query point to that projection. */
    distance: number,
    /** The same distance, signed positive when the query point is left of the travel direction. */
    signed: number,
    /**
     * Distance along the reference from its start to the projection. Not used by the overlay yet,
     * but it is what an along track measure would be built from, so it is returned rather than
     * thrown away.
     */
    arcLength: number,
};

/**
 * Closest point on a polyline, plus which side of it the query point falls on.
 *
 * Every segment of the polyline is tested in turn. For each one the query point is projected onto
 * the infinite line through it, that projection is clamped back into the segment so a point beyond
 * either end attaches to the end rather than to empty space, and the nearest result wins.
 *
 * The sign comes from the 2D cross product of the segment direction and the offset to the query
 * point. Field inches are y up, so a positive cross product puts the query point counter clockwise
 * from the direction of travel, which is the robot's left. mikLib's signed_offset_from_line uses
 * the same formula, which is what keeps a reported error and a measured one pointing the same way.
 *
 * Returns null when there is nothing to measure against: an empty reference, or one whose points
 * are all identical and so carries no direction to take a side from.
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

        // Two identical points in a row give a zero length segment. It has no direction, so there
        // is no side to be on and no projection to make. Skipping it is not a loss: any real
        // neighbouring segment covers the same place on the field.
        if (lengthSq === 0) continue;

        // Where the query point lands along this segment, as a fraction from its start to its end.
        // Clamping to 0..1 is what turns an infinite line into a finite segment: a robot past the
        // end measures to the end point rather than to a spot that does not exist.
        const alpha = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSq));
        const px = ax + alpha * dx;
        const py = ay + alpha * dy;
        const distance = Math.hypot(x - px, y - py);

        if (best === null || distance < best.distance) {
            // Positive when the query point sits counter clockwise of the travel direction, which
            // in a y up frame is the robot's left. Only the sign is wanted; the magnitude comes
            // from the projection above, which is already the true perpendicular distance.
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

/** Rolls a list of samples into max, rms and mean. Sign is dropped: all three ask how far off. */
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

/** The least a sample needs to carry to be measured. RunSample satisfies this structurally. */
export type PoseSample = { t: number, x: number, y: number, xte?: number };

/**
 * Error for one motion.
 *
 * The choice of source is deliberately all or nothing. If any sample carried a reported error, the
 * reported ones are used and the rest are dropped, rather than filling gaps with geometry. Mixing
 * the two inside a single motion would produce a curve whose parts mean different things, and whose
 * max and rms could not be honestly labelled.
 *
 * A reference with fewer than two points cannot be measured against at all. That is what a turn or
 * a wait produces, and the result is an empty segment rather than a row of zeroes, because zero
 * would read as perfect tracking when the truth is that nothing was measured.
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
