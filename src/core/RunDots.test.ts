import { describe, it, expect } from "vitest";
import { buildRunDots, errorAgainstPrecisePath, nearestRunDot, runDotColor } from "./RunDots";
import type { RunSample } from "./RecordedRun";
import pathLayerSource from "../components/Field/PathLayer.tsx?raw";

describe("the run's dot style stays in step with the precise path", () => {
    // RunDots copies these from PathLayer rather than importing them. If someone changes the
    // originals, these fail and point at the copies that need changing too.
    it("uses the precise path's dot spacing", () => {
        expect(pathLayerSource).toContain("const DOT_SPACING = 1.5;");
    });

    it("uses the precise path's dot radius", () => {
        expect(pathLayerSource).toContain("const DOT_RADIUS = 1.8 * FIELD_REAL_DIMENSIONS.w / FIELD_IMG_DIMENSIONS.w;");
    });

    it("uses the precise path's colour ramp", () => {
        expect(pathLayerSource).toContain("const [a, b, frac] = t < 0.5 ? [slow, mid, t * 2] : [mid, fast, (t - 0.5) * 2];");
    });
});

describe("runDotColor", () => {
    const slow = [100, 0, 200], mid = [0, 100, 255], fast = [255, 255, 255];

    it("is the slow colour at rest, the mid colour at half speed, and the fast colour flat out", () => {
        expect(runDotColor(0, slow, mid, fast)).toBe("rgb(100,0,200)");
        expect(runDotColor(0.5, slow, mid, fast)).toBe("rgb(0,100,255)");
        expect(runDotColor(1, slow, mid, fast)).toBe("rgb(255,255,255)");
    });
});

const sample = (t: number, x: number, y: number): RunSample => ({ t, x, y, angle: 0 });

describe("buildRunDots", () => {
    it("places one dot per spacing of travel", () => {
        // 10 in north over 1 s, dots every 1.5 in
        const run = Array.from({ length: 11 }, (_, i) => sample(i * 0.1, 0, i));
        const dots = buildRunDots(run, 1.5, 72);
        expect(dots).toHaveLength(6);
        expect(dots[0].y).toBeCloseTo(1.5);
        expect(dots.every(d => d.x === 0)).toBe(true);
    });

    it("colours by speed from real timestamps", () => {
        // 10 in/s against a 20 in/s top speed is half speed
        const run = [sample(0, 0, 0), sample(1, 0, 10)];
        expect(buildRunDots(run, 1.5, 20)[0].t).toBeCloseTo(0.5);
    });

    it("draws nothing for a turn in place, which does not travel", () => {
        const turn = Array.from({ length: 30 }, (_, i) => sample(i * 0.02, 5, 5));
        expect(buildRunDots(turn, 1.5, 72)).toHaveLength(0);
    });

    it("survives two rows with the same timestamp", () => {
        const run = [sample(0, 0, 0), sample(0, 0, 10)];
        const dots = buildRunDots(run, 1.5, 72);
        expect(dots.length).toBeGreaterThan(0);
        expect(dots.every(d => Number.isFinite(d.t))).toBe(true);
    });

    it("draws nothing for an empty or single sample run", () => {
        expect(buildRunDots([], 1.5, 72)).toHaveLength(0);
        expect(buildRunDots([sample(0, 1, 1)], 1.5, 72)).toHaveLength(0);
    });
});

describe("nearestRunDot", () => {
    const dots = buildRunDots(Array.from({ length: 11 }, (_, i) => sample(i * 0.1, 0, i)), 1.5, 72);

    it("finds the dot under the pointer", () => {
        expect(nearestRunDot(dots, 0.2, 3.1, 1)?.y).toBeCloseTo(3);
    });

    it("finds nothing when the pointer is far from the run", () => {
        expect(nearestRunDot(dots, 40, 40, 1)).toBeNull();
    });
});

describe("errorAgainstPrecisePath", () => {
    const leg = (x0: number, y0: number, x1: number, y1: number) =>
        [{ t: 0, x: x0, y: y0, angle: 0 }, { t: 1, x: x1, y: y1, angle: 0 }];

    it("measures the real run against the simulated one, positive to the left", () => {
        const sim = leg(0, 0, 0, 10);
        expect(errorAgainstPrecisePath(sim, -2, 5)).toBeCloseTo(2);
        expect(errorAgainstPrecisePath(sim, 2, 5)).toBeCloseTo(-2);
    });

    it("measures against the whole path, not just its first motion", () => {
        // an L shaped path: north, then east. A point beside the second leg must measure to that leg.
        const sim = [...leg(0, 0, 0, 10), { t: 2, x: 20, y: 10, angle: 90 }];
        expect(errorAgainstPrecisePath(sim, 15, 11)).toBeCloseTo(1);
    });

    it("returns null when no path is open", () => {
        expect(errorAgainstPrecisePath(undefined, 0, 0)).toBeNull();
        expect(errorAgainstPrecisePath([], 0, 0)).toBeNull();
    });
});
