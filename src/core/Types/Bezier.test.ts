import { describe, it, expect } from "vitest";
import { bezierPointAt, fitCubic, polylineLength, resamplePolyline, resolveBezier, sampleBezier, type Bezier } from "./Bezier";
import type { Path } from "./Path";
import type { Segment } from "./Segment";
import { createControlPoint, type ControlPoint } from "./Pose";

function makePath(controls: ControlPoint[]): Path {
    const base = { disabled: false, selected: false, visible: true, format: "mikLib", constants: [{}], turnPose: { x: 0, y: 0, angle: 0 }, turnLocked: false, distance: 0, time: 0, controls: [] } as unknown as Segment;
    return {
        name: "test",
        segments: [
            { ...base, id: "a", kind: "start", pose: { x: 0, y: 0, angle: 0 } },
            { ...base, id: "b", kind: "bezierCurve", pose: { x: 30, y: 0, angle: null }, controls },
        ],
    };
}

/** The quadratic a single control is meant to describe, for comparison against the elevated cubic. */
function quadraticAt(p0: { x: number, y: number }, c: { x: number, y: number }, p1: { x: number, y: number }, t: number) {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
        y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
    };
}

describe("resolveBezier", () => {
    it("uses both controls verbatim when two are present", () => {
        const bezier = resolveBezier(makePath([createControlPoint(10, 12), createControlPoint(20, -4)]), 1);
        expect(bezier).not.toBeNull();
        expect(bezier!.p0).toEqual({ x: 0, y: 0 });
        expect(bezier!.c1).toEqual({ x: 10, y: 12 });
        expect(bezier!.c2).toEqual({ x: 20, y: -4 });
        expect(bezier!.p1).toEqual({ x: 30, y: 0 });
    });

    it("degree elevates one control into the exactly equivalent cubic", () => {
        const control = { x: 15, y: 20 };
        const bezier = resolveBezier(makePath([createControlPoint(control.x, control.y)]), 1);
        expect(bezier).not.toBeNull();

        for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
            const cubic = bezierPointAt(bezier!, t);
            const quad = quadraticAt({ x: 0, y: 0 }, control, { x: 30, y: 0 }, t);
            expect(cubic.x).toBeCloseTo(quad.x, 10);
            expect(cubic.y).toBeCloseTo(quad.y, 10);
        }
    });

    it("collapses to the straight chord with no controls", () => {
        const bezier = resolveBezier(makePath([]), 1);
        expect(bezier).not.toBeNull();

        // Geometrically straight and monotonic, though the parameterization is not uniform
        const points = sampleBezier(bezier!, 40);
        for (const pt of points) {
            expect(pt.y).toBeCloseTo(0, 10);
            expect(pt.x).toBeGreaterThanOrEqual(0);
            expect(pt.x).toBeLessThanOrEqual(30);
        }
        for (let i = 1; i < points.length; i++) {
            expect(points[i].x).toBeGreaterThanOrEqual(points[i - 1].x);
        }

        expect(bezierPointAt(bezier!, 0)).toEqual({ x: 0, y: 0 });
        expect(bezierPointAt(bezier!, 1).x).toBeCloseTo(30, 10);
        expect(polylineLength(points)).toBeCloseTo(30, 6);
    });

    it("returns null when the segment has no resolvable start", () => {
        expect(resolveBezier(makePath([]), 0)).toBeNull();
    });

    it("tolerates a path saved before controls existed", () => {
        const path = makePath([]);
        delete (path.segments[1] as Partial<Segment>).controls;
        const bezier = resolveBezier(path, 1);
        expect(bezier).not.toBeNull();
        expect(bezier!.c1).toEqual({ x: 0, y: 0 });
        expect(bezier!.c2).toEqual({ x: 30, y: 0 });
    });
});

describe("resamplePolyline", () => {
    const line = [{ x: 0, y: 0 }, { x: 0, y: 30 }];

    it("drops the start, which the caller already knows the robot is standing on", () => {
        const out = resamplePolyline(line, 10);
        expect(out[0]).toEqual({ x: 0, y: 10 });
    });

    it("always finishes exactly on the endpoint", () => {
        expect(resamplePolyline(line, 7)[resamplePolyline(line, 7).length - 1]).toEqual({ x: 0, y: 30 });
        expect(resamplePolyline(line, 4)[resamplePolyline(line, 4).length - 1]).toEqual({ x: 0, y: 30 });
    });

    it("spaces points at the requested interval", () => {
        const out = resamplePolyline(line, 5);
        expect(out.map(p => p.y)).toEqual([5, 10, 15, 20, 25, 30]);
    });

    it("swallows a final step shorter than half a spacing rather than bunching two points", () => {
        // 30 inches at 8 leaves a 6 inch tail, which is kept; at 11 it leaves 8 which is not
        expect(resamplePolyline(line, 8).map(p => p.y)).toEqual([8, 16, 24, 30]);
        const tight = resamplePolyline([{ x: 0, y: 0 }, { x: 0, y: 21 }], 10);
        expect(tight.map(p => p.y)).toEqual([10, 21]);
    });

    it("returns just the endpoint for a spacing that could never divide the line", () => {
        expect(resamplePolyline(line, 0)).toEqual([{ x: 0, y: 30 }]);
        expect(resamplePolyline(line, -5)).toEqual([{ x: 0, y: 30 }]);
    });

    it("returns nothing for a degenerate polyline", () => {
        expect(resamplePolyline([], 5)).toEqual([]);
        expect(resamplePolyline([{ x: 1, y: 1 }], 5)).toEqual([]);
    });

    it("skips zero length legs without stalling", () => {
        const repeated = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 }];
        expect(resamplePolyline(repeated, 5).map(p => p.y)).toEqual([5, 10]);
    });
});

describe("fitCubic", () => {
    /** Worst gap between two curves, sampled evenly in the parameter. */
    function curveGap(a: Bezier, b: Bezier): number {
        let worst = 0;
        for (let i = 0; i <= 200; i++) {
            const p = bezierPointAt(a, i / 200);
            const q = bezierPointAt(b, i / 200);
            worst = Math.max(worst, Math.hypot(p.x - q.x, p.y - q.y));
        }
        return worst;
    }

    const s = { p0: { x: 0, y: 0 }, c1: { x: 20, y: 10 }, c2: { x: -20, y: 20 }, p1: { x: 0, y: 30 } };

    it("recovers the handles of a curve from points sampled along it", () => {
        const [c1, c2] = fitCubic(s.p0, s.p1, resamplePolyline(sampleBezier(s, 400), 2));

        expect(c1.x).toBeCloseTo(20, 0);
        expect(c1.y).toBeCloseTo(10, 0);
        expect(c2.x).toBeCloseTo(-20, 0);
        expect(c2.y).toBeCloseTo(20, 0);
    });

    it("lands the refit curve on top of the original", () => {
        const [c1, c2] = fitCubic(s.p0, s.p1, resamplePolyline(sampleBezier(s, 400), 2));
        expect(curveGap(s, { p0: s.p0, c1, c2, p1: s.p1 })).toBeLessThan(0.1);
    });

    it("gets closer as the points get denser", () => {
        const gapAt = (spacing: number) => {
            const [c1, c2] = fitCubic(s.p0, s.p1, resamplePolyline(sampleBezier(s, 400), spacing));
            return curveGap(s, { p0: s.p0, c1, c2, p1: s.p1 });
        };
        expect(gapAt(2)).toBeLessThan(gapAt(10));
    });

    it("fits a straight run to a straight curve", () => {
        const points = [{ x: 0, y: 10 }, { x: 0, y: 20 }, { x: 0, y: 30 }, { x: 0, y: 40 }];
        const [c1, c2] = fitCubic({ x: 0, y: 0 }, { x: 0, y: 40 }, points);

        expect(Math.abs(c1.x)).toBeLessThan(0.5);
        expect(Math.abs(c2.x)).toBeLessThan(0.5);
        expect(c1.y).toBeGreaterThan(0);
        expect(c2.y).toBeLessThan(40);
    });

    it("falls back to evenly spaced handles when there is too little to fit", () => {
        const p0 = { x: 0, y: 0 };
        const p1 = { x: 0, y: 30 };
        expect(fitCubic(p0, p1, [])).toEqual([{ x: 0, y: 10 }, { x: 0, y: 20 }]);
        expect(fitCubic(p0, p1, [{ x: 0, y: 15 }])).toEqual([{ x: 0, y: 10 }, { x: 0, y: 20 }]);
    });

    it("falls back rather than dividing through zero on stacked points", () => {
        const stacked = [{ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 }];
        const [c1, c2] = fitCubic({ x: 5, y: 5 }, { x: 5, y: 5 }, stacked);

        expect(Number.isFinite(c1.x) && Number.isFinite(c1.y)).toBe(true);
        expect(Number.isFinite(c2.x) && Number.isFinite(c2.y)).toBe(true);
    });

    it("stays finite on points that were never a curve", () => {
        const scattered = [{ x: 9, y: 2 }, { x: -4, y: 18 }, { x: 13, y: 7 }, { x: -1, y: 25 }];
        const [c1, c2] = fitCubic({ x: 0, y: 0 }, { x: 0, y: 30 }, scattered);

        expect(Number.isFinite(c1.x) && Number.isFinite(c1.y)).toBe(true);
        expect(Number.isFinite(c2.x) && Number.isFinite(c2.y)).toBe(true);
    });
});
