import type { Snapshot } from "./ComputePathSim";
import { nearestOnPolyline } from "./CrossTrackError";
import type { RunSample } from "./RecordedRun";
import { FIELD_IMG_DIMENSIONS, FIELD_REAL_DIMENSIONS } from "./Util";

// The three values below mirror private constants in components/Field/PathLayer.tsx, so a run is
// laid out and coloured exactly like the precise path. They are copies rather than imports because
// PathLayer is a component file, and exporting plain values from it breaks the react refresh lint
// rule, while moving them out would mean rewriting the original file. RunDots.test.ts reads
// PathLayer's source and fails if the originals ever change, so the copies cannot drift unnoticed.

/** Inches of travel between dots. Mirrors DOT_SPACING in PathLayer.tsx. */
export const RUN_DOT_SPACING = 1.5;

/** Dot radius in field inches. Mirrors DOT_RADIUS in PathLayer.tsx. */
export const RUN_DOT_RADIUS = 1.8 * FIELD_REAL_DIMENSIONS.w / FIELD_IMG_DIMENSIONS.w;

/**
 * Ramps from slow through mid to fast as t goes from 0 to 1. Mirrors speedColor in PathLayer.tsx
 * with no hover tint, since a run dot is never tinted for hover.
 */
export function runDotColor(t: number, slow: number[], mid: number[], fast: number[]): string {
    const [a, b, frac] = t < 0.5 ? [slow, mid, t * 2] : [mid, fast, (t - 0.5) * 2];
    const channel = (i: number) => Math.round(a[i] + frac * (b[i] - a[i]));
    return `rgb(${channel(0)},${channel(1)},${channel(2)})`;
}

/** One dot of a drawn run, in field inches. */
export type RunDot = {
    x: number,
    y: number,
    /** Speed as a fraction of the robot's top speed, 0 to 1, which picks the dot's colour. */
    t: number,
};

/**
 * Lays dots along a recorded run the same way the precise path lays them along the simulated one,
 * so the two read as the same kind of line: one dot every `spacing` inches of travel, coloured by
 * how fast the robot was moving there.
 *
 * Mirrors getPreciseSegmentDots with one difference. The simulator samples at a fixed period, but
 * a real log carries its own timestamps and a logger's rate can drift under load, so speed here is
 * taken from the actual time between rows rather than an assumed interval.
 *
 * A turn in place contributes no dots: the robot does not travel while turning, so no distance ever
 * accumulates past `spacing`. That is what keeps a turn from painting a blot on its corner.
 */
export function buildRunDots(samples: RunSample[], spacing: number, maxSpeedIn: number): RunDot[] {
    const dots: RunDot[] = [];
    if (spacing <= 0) return dots;

    let sinceLast = 0;

    for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1];
        const b = samples[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) continue;

        // Two rows sharing a timestamp would divide by zero; treat that stretch as top speed
        // rather than dropping it, since the robot plainly did move
        const dt = b.t - a.t;
        const speed = dt > 0 ? len / dt : maxSpeedIn;
        const t = maxSpeedIn > 0 ? Math.min(speed / maxSpeedIn, 1) : 0;

        sinceLast += len;
        while (sinceLast >= spacing) {
            sinceLast -= spacing;
            const frac = 1 - sinceLast / len;
            dots.push({ x: a.x + frac * dx, y: a.y + frac * dy, t });
        }
    }

    return dots;
}

/**
 * The dot nearest a point, or null when none lies within `radius` inches. The radius keeps a hover
 * readout from latching onto a dot on the far side of the field when the pointer is nowhere near
 * the run.
 */
export function nearestRunDot(dots: RunDot[], x: number, y: number, radius: number): RunDot | null {
    let best: RunDot | null = null;
    let bestSq = radius * radius;
    for (const d of dots) {
        const sq = (d.x - x) * (d.x - x) + (d.y - y) * (d.y - y);
        if (sq <= bestSq) { bestSq = sq; best = d; }
    }
    return best;
}

/**
 * Signed distance from a point on the real run to the precise path, the simulated trajectory of
 * the whole open path. Positive means the real robot was to the left of where the simulation drove.
 *
 * Measured against the entire trajectory rather than one motion of it, so it needs nothing from the
 * run but a position: no motion numbering, and no requirement that the run and the path have the
 * same number of motions. The trade is that where the path crosses or doubles back on itself, the
 * nearest part of the path wins, which may not be the part the robot was driving at the time.
 *
 * Returns null when there is nothing to compare against, which is the case when no path with any
 * motion in it is open.
 */
export function errorAgainstPrecisePath(trajectory: Snapshot[] | undefined, x: number, y: number): number | null {
    if (trajectory === undefined || trajectory.length < 2) return null;
    const near = nearestOnPolyline(trajectory, x, y);
    return near === null ? null : near.signed;
}
