import { describe, it, expect } from "vitest";
import { nearestOnPolyline } from "./CrossTrackError";

const LINE = [{ x: 0, y: 0 }, { x: 0, y: 10 }];

describe("nearestOnPolyline", () => {
    it("signs left of travel as positive", () => {
        // The line runs north, so -X is the robot's left and must come back positive #
        expect(nearestOnPolyline(LINE, -2, 5)?.signed).toBeCloseTo(2);
        expect(nearestOnPolyline(LINE, 2, 5)?.signed).toBeCloseTo(-2);
    });

    it("projects onto the segment and reports arc length", () => {
        const n = nearestOnPolyline(LINE, 3, 4)!;
        expect(n.x).toBeCloseTo(0);
        expect(n.y).toBeCloseTo(4);
        expect(n.arcLength).toBeCloseTo(4);
        expect(n.distance).toBeCloseTo(3);
    });

    it("clamps past either end rather than extrapolating", () => {
        expect(nearestOnPolyline(LINE, 0, 99)?.y).toBeCloseTo(10);
        expect(nearestOnPolyline(LINE, 0, -99)?.y).toBeCloseTo(0);
    });

    it("survives a degenerate reference", () => {
        expect(nearestOnPolyline([], 1, 1)).toBeNull();
        expect(nearestOnPolyline([{ x: 1, y: 1 }, { x: 1, y: 1 }], 4, 1)).toBeNull();
    });
});
