import { describe, it, expect } from "vitest";
import { computeSegmentXte, nearestOnPolyline, summarizeRun, type SegmentXte } from "./CrossTrackError";

const LINE = [{ x: 0, y: 0 }, { x: 0, y: 10 }];

describe("nearestOnPolyline", () => {
    it("signs left of travel as positive", () => {
        // The line runs north, so -X is the robot's left and must come back positive
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

describe("computeSegmentXte", () => {
    it("prefers the algorithm's own number over geometry", () => {
        const r = computeSegmentXte(
            [{ t: 0, x: 5, y: 5, xte: 0.25 }],   // geometry would say 5, the algorithm says 0.25
            LINE,
        );
        expect(r.source).toBe("algorithm");
        expect(r.points[0].e).toBe(0.25);
        expect(r.points[0].rx).toBeUndefined();
    });

    it("falls back to geometry only when no sample reported one", () => {
        const r = computeSegmentXte([{ t: 0, x: 3, y: 5 }], LINE);
        expect(r.source).toBe("geometry");
        expect(r.points[0].e).toBeCloseTo(-3);   // right of a northbound line
        expect(r.points[0].rx).toBeCloseTo(0);
    });

    it("returns empty rather than a fake zero when there is no reference", () => {
        const r = computeSegmentXte([{ t: 0, x: 3, y: 5 }], []);
        expect(r.points).toHaveLength(0);
        expect(r.maxAbs).toBe(0);
    });

    it("summarizes magnitude, not sign", () => {
        const r = computeSegmentXte(
            [{ t: 0, x: 0, y: 0, xte: -3 }, { t: 1, x: 0, y: 0, xte: 3 }],
            LINE,
        );
        expect(r.maxAbs).toBe(3);
        expect(r.meanAbs).toBe(3);
        expect(r.rms).toBeCloseTo(3);
    });
});

describe("summarizeRun", () => {
    const seg = (units: string, ...es: number[]): SegmentXte =>
        computeSegmentXte(es.map((e, i) => ({ t: i, x: 0, y: 0, xte: e })), LINE, units);

    it("never lets a turn's degrees outrank a drive's inches", () => {
        const s = summarizeRun([seg("in", 2.16), seg("deg", 90), seg("in", 1.49)]);

        expect(s.linear.maxAbs).toBeCloseTo(2.16);
        expect(s.angular.maxAbs).toBeCloseTo(90);
        expect(s.linear.count).toBe(2);
        expect(s.angular.count).toBe(1);
    });

    it("keeps the two averages apart", () => {
        const s = summarizeRun([seg("in", 3, 4), seg("deg", 30)]);
        expect(s.linear.rms).toBeCloseTo(Math.sqrt((9 + 16) / 2));
        expect(s.angular.rms).toBeCloseTo(30);
    });

    it("reports zeroes for a run with nothing in a bucket", () => {
        const s = summarizeRun([seg("in", 1)]);
        expect(s.angular).toEqual({ maxAbs: 0, rms: 0, count: 0 });
    });
});
