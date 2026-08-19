import { describe, it, expect } from "vitest";
import { bezierPointAt, polylineLength, resolveBezier, sampleBezier } from "./Bezier";
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
