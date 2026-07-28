import { describe, it, expect } from "vitest";
import { bezierPointAt, polylineLength, resamplePolyline, resolveBezier, sampleBezier } from "./Bezier";
import type { Path } from "./Path";
import type { Segment } from "./Segment";
import { createControlPoint, type ControlPoint } from "./Pose";

function makePath(controls: ControlPoint[]): Path {
    const base = { disabled: false, selected: false, locked: false, visible: true, format: "mikLib", constants: [{}], distance: 0, time: 0, controls: [] } as unknown as Segment;
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
    /** Every gap but the last, which carries whatever remainder is left over. */
    function gaps(points: { x: number, y: number }[]): number[] {
        const out: number[] = [];
        for (let i = 1; i < points.length; i++) out.push(Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
        return out;
    }

    it("spaces a straight line evenly", () => {
        const points = resamplePolyline([{ x: 0, y: 0 }, { x: 0, y: 10 }], 1);
        expect(points).toHaveLength(11);
        for (const gap of gaps(points)) expect(gap).toBeCloseTo(1, 10);
        expect(points[points.length - 1]).toEqual({ x: 0, y: 10 });
    });

    it("carries the remainder across the source points instead of restarting at each one", () => {
        // Source vertices at 1.5in intervals, so naive per-chord spacing would bunch points up
        const source = [{ x: 0, y: 0 }, { x: 0, y: 1.5 }, { x: 0, y: 3 }, { x: 0, y: 4.5 }];
        const points = resamplePolyline(source, 1);

        for (const gap of gaps(points).slice(0, -1)) expect(gap).toBeCloseTo(1, 10);
        expect(points[points.length - 1]).toEqual({ x: 0, y: 4.5 });
    });

    it("keeps the end point and leaves only the remainder short", () => {
        const points = resamplePolyline([{ x: 0, y: 0 }, { x: 0, y: 10.4 }], 3);
        const spans = gaps(points);
        for (const gap of spans.slice(0, -1)) expect(gap).toBeCloseTo(3, 10);
        expect(spans[spans.length - 1]).toBeCloseTo(1.4, 10);
        expect(points[points.length - 1]).toEqual({ x: 0, y: 10.4 });
    });

    it("follows the corners of a bent polyline", () => {
        const points = resamplePolyline([{ x: 0, y: 0 }, { x: 0, y: 6 }, { x: 6, y: 6 }], 2);
        expect(polylineLength(points)).toBeCloseTo(12, 10);
        for (const gap of gaps(points)) expect(gap).toBeLessThanOrEqual(2 + 1e-10);
    });

    it("resamples a sampled bezier to the requested density", () => {
        const bezier = resolveBezier(makePath([createControlPoint(10, 12), createControlPoint(20, -4)]), 1)!;
        const points = resamplePolyline(sampleBezier(bezier, 400), 1);

        for (const gap of gaps(points).slice(0, -1)) expect(gap).toBeCloseTo(1, 2);
        expect(points[points.length - 1]).toEqual({ x: 30, y: 0 });
    });

    it("returns degenerate input untouched rather than hanging", () => {
        expect(resamplePolyline([], 1)).toEqual([]);
        expect(resamplePolyline([{ x: 1, y: 2 }], 1)).toEqual([{ x: 1, y: 2 }]);
        expect(resamplePolyline([{ x: 1, y: 2 }, { x: 3, y: 4 }], 0)).toHaveLength(2);
        expect(resamplePolyline([{ x: 1, y: 2 }, { x: 1, y: 2 }], 1)).toEqual([{ x: 1, y: 2 }, { x: 1, y: 2 }]);
    });
});
