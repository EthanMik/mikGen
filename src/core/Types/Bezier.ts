import { createControlPoint, type ControlPoint } from "./Pose";
import type { Coordinate } from "./Coordinate";
import { getBackwardsSnapPose, type Path } from "./Path";
import type { Segment } from "./Segment";

/**
 * Paths saved before bezier segments existed have no `controls`, so always read through this.
 * Only bezier segments have controls; any left on another kind are stale and read as empty.
 * Lives here rather than in Segment.ts so that reading controls does not pull the format
 * registry into a module that loads before it is initialized.
 */
export function segmentControls(seg: Segment): ControlPoint[] {
    return seg.kind === "bezierCurve" ? seg.controls ?? [] : [];
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

export type Bezier = {
    p0: Coordinate;
    c1: Coordinate;
    c2: Coordinate;
    p1: Coordinate;
};

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

/**
 * Walks a dense polyline and drops a point every `spacing` inches of arc length.
 *
 * The first point is left out: every consumer so far is a waypoint list the robot drives through
 * from wherever it already is, and EZ-Template in particular inserts the current odom position at
 * the front itself, so emitting it would double up the start. The last point is always the true
 * endpoint rather than whatever the walk happens to land on, and a final step shorter than half a
 * spacing swallows the point before it so the last two are not bunched together.
 */
export function resamplePolyline(points: Coordinate[], spacing: number): Coordinate[] {
    if (points.length < 2) return [];
    if (!(spacing > 0)) return [points[points.length - 1]];

    const out: Coordinate[] = [];
    let carried = 0;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const legLength = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        if (legLength === 0) continue;

        // Distance along this leg to the next drop, carrying the leftover from previous legs
        let along = spacing - carried;
        while (along <= legLength) {
            const t = along / legLength;
            out.push({ x: prev.x + (curr.x - prev.x) * t, y: prev.y + (curr.y - prev.y) * t });
            along += spacing;
        }
        carried = legLength - (along - spacing);
    }

    const end = points[points.length - 1];
    const last = out[out.length - 1];
    if (last && Math.hypot(end.x - last.x, end.y - last.y) < spacing / 2) out.pop();
    out.push(end);

    return out;
}

/** Second derivative, needed to Newton-refine which `t` a sample point sits at. */
function bezierSecondDerivativeAt(b: Bezier, t: number): Coordinate {
    const u = 1 - t;
    return {
        x: 6 * u * (b.c2.x - 2 * b.c1.x + b.p0.x) + 6 * t * (b.p1.x - 2 * b.c2.x + b.c1.x),
        y: 6 * u * (b.c2.y - 2 * b.c1.y + b.p0.y) + 6 * t * (b.p1.y - 2 * b.c2.y + b.c1.y),
    };
}

/** Solves the pinned-endpoint normal equations for c1/c2 at a fixed parameterization. */
function solveControls(p0: Coordinate, p1: Coordinate, samples: Coordinate[], ts: number[]): [Coordinate, Coordinate] | null {
    let a11 = 0, a12 = 0, a22 = 0;
    let bx1 = 0, bx2 = 0, by1 = 0, by2 = 0;

    // Endpoints are pinned, so they contribute nothing to the system
    for (let i = 1; i < samples.length - 1; i++) {
        const t = ts[i];
        const u = 1 - t;
        const a0 = u * u * u;
        const a1 = 3 * u * u * t;
        const a2 = 3 * u * t * t;
        const a3 = t * t * t;

        const rx = samples[i].x - (a0 * p0.x + a3 * p1.x);
        const ry = samples[i].y - (a0 * p0.y + a3 * p1.y);

        a11 += a1 * a1;
        a12 += a1 * a2;
        a22 += a2 * a2;
        bx1 += a1 * rx;
        bx2 += a2 * rx;
        by1 += a1 * ry;
        by2 += a2 * ry;
    }

    const det = a11 * a22 - a12 * a12;
    if (Math.abs(det) < 1e-9) return null;

    return [
        { x: (bx1 * a22 - bx2 * a12) / det, y: (by1 * a22 - by2 * a12) / det },
        { x: (bx2 * a11 - bx1 * a12) / det, y: (by2 * a11 - by1 * a12) / det },
    ];
}

/** Sum of squared distances from each sample to the curve at its assigned parameter. */
function fitResidual(curve: Bezier, samples: Coordinate[], ts: number[]): number {
    let total = 0;
    for (let i = 1; i < samples.length - 1; i++) {
        const q = bezierPointAt(curve, ts[i]);
        total += (q.x - samples[i].x) ** 2 + (q.y - samples[i].y) ** 2;
    }
    return total;
}

/**
 * Maps each arc-length fraction to the parameter reaching it on `curve`.
 *
 * The waypoints being fitted were laid down at even arc length, so matching on arc length asks
 * the same question that produced them. Going by closest point instead leaves the fit several
 * inches out on a curve that doubles back, where one point sits near two very different `t`.
 */
function parametersAtArcFractions(curve: Bezier, fractions: number[]): number[] {
    const STEPS = 512;
    const cumulative: number[] = [0];
    let previous = bezierPointAt(curve, 0);
    for (let i = 1; i <= STEPS; i++) {
        const q = bezierPointAt(curve, i / STEPS);
        cumulative.push(cumulative[i - 1] + Math.hypot(q.x - previous.x, q.y - previous.y));
        previous = q;
    }
    const length = cumulative[STEPS];
    if (length <= 1e-9) return fractions.slice();

    return fractions.map(fraction => {
        const target = fraction * length;
        let lo = 0;
        let hi = STEPS;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cumulative[mid] < target) lo = mid + 1; else hi = mid;
        }
        return lo / STEPS;
    });
}

/**
 * Least-squares fit of a cubic through `through`, with both endpoints pinned.
 *
 * Turns an exported waypoint list back into the curve it came from, so a path survives a trip out
 * through generated code and back. For an ordinary curve this recovers the original handles to
 * well under a hundredth of an inch.
 *
 * It cannot always: the waypoints are a lossy encoding, and for a curve whose handles fold back
 * behind its own endpoints the normal equations are close to singular, so handle pairs that are
 * inches apart fit the same points about equally well. There the fit returns a curve that traces
 * the waypoints, not necessarily the handles that drew them. Iteration is capped and the best
 * residual is kept rather than the last, since on those curves the search drifts along the flat
 * valley instead of settling.
 */
export function fitCubic(p0: Coordinate, p1: Coordinate, through: Coordinate[]): [Coordinate, Coordinate] {
    const fallback = (): [Coordinate, Coordinate] => [
        chordControlPosition(p0, p1, 0),
        chordControlPosition(p0, p1, 1),
    ];

    // The curve starts at p0, so it anchors the parameterization even though it is not a sample
    const samples = [p0, ...through];
    if (samples.length < 4) return fallback();

    const cumulative: number[] = [0];
    for (let i = 1; i < samples.length; i++) {
        cumulative.push(cumulative[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y));
    }
    const total = cumulative[cumulative.length - 1];
    if (total <= 1e-9) return fallback();

    const fractions = cumulative.map(d => d / total);
    let ts = fractions.slice();
    let controls = solveControls(p0, p1, samples, ts);
    if (controls === null) return fallback();

    let best = controls;
    let bestResidual = fitResidual({ p0, c1: controls[0], c2: controls[1], p1 }, samples, ts);

    const consider = (candidate: [Coordinate, Coordinate], at: number[]) => {
        const residual = fitResidual({ p0, c1: candidate[0], c2: candidate[1], p1 }, samples, at);
        if (residual < bestResidual) {
            bestResidual = residual;
            best = candidate;
        }
        return residual;
    };

    // Arc length first, which is the measure the waypoints were laid down by and so gets the
    // parameterization globally right even where the curve doubles back
    for (let pass = 0; pass < 12; pass++) {
        ts = parametersAtArcFractions({ p0, c1: controls[0], c2: controls[1], p1 }, fractions);
        const refined = solveControls(p0, p1, samples, ts);
        if (refined === null) break;
        controls = refined;
        if (consider(controls, ts) < 1e-12) return best;
    }

    // Then closest point, which is slower to find the right branch but lands far more precisely
    // on it. Whichever measure ends up fitting better is the one that gets returned.
    controls = best;
    for (let pass = 0; pass < 12; pass++) {
        const curve: Bezier = { p0, c1: controls[0], c2: controls[1], p1 };
        let shift = 0;

        // Newton on f(t) = (Q(t) - P) . Q'(t), whose root is the closest point on the curve
        for (let i = 1; i < samples.length - 1; i++) {
            const q = bezierPointAt(curve, ts[i]);
            const d1 = bezierTangentAt(curve, ts[i]);
            const d2 = bezierSecondDerivativeAt(curve, ts[i]);
            const dx = q.x - samples[i].x;
            const dy = q.y - samples[i].y;

            const denominator = d1.x * d1.x + d1.y * d1.y + dx * d2.x + dy * d2.y;
            if (Math.abs(denominator) < 1e-9) continue;

            // Clamped: a sample slightly off the curve can otherwise step outside the span
            const next = Math.min(1, Math.max(0, ts[i] - (dx * d1.x + dy * d1.y) / denominator));
            shift = Math.max(shift, Math.abs(next - ts[i]));
            ts[i] = next;
        }

        const refined = solveControls(p0, p1, samples, ts);
        if (refined === null) break;
        controls = refined;
        if (consider(controls, ts) < 1e-12 || shift < 1e-9) break;
    }

    return best;
}
