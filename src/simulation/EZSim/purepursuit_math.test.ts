import { describe, it, expect } from "vitest";
import { inject_points, smooth_path, type waypoint } from "./purepursuit_math";

const at = (x: number, y: number, theta: number | null = null): waypoint => ({ x, y, theta });
const origin = { x: 0, y: 0, theta: 0 };

/** Longest gap between consecutive points, which is what injection exists to bring down. */
function widestGap(path: waypoint[]): number {
    let widest = 0;
    for (let i = 1; i < path.length; i++) {
        widest = Math.max(widest, Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
    }
    return widest;
}

describe("inject_points", () => {
    it("leads with the robot's own position, which EZ supplies rather than the caller", () => {
        const out = inject_points({ x: 5, y: 7, theta: 0 }, [at(0, 40)], 2, 7, 1);

        expect(out[0].x).toBe(5);
        expect(out[0].y).toBe(7);
    });

    it("fills a long gap in at roughly the requested spacing", () => {
        const out = inject_points(origin, [at(0, 40)], 2, 7, 1);

        expect(out.length).toBeGreaterThan(10);
        // Nothing is injected within a lookahead of the start, so the one wide gap left is that
        // opening stretch; past it the points sit at the spacing asked for
        expect(widestGap(out)).toBeLessThanOrEqual(7 + 2);
        expect(widestGap(out.slice(1))).toBeLessThanOrEqual(2 + 1e-6);
    });

    it("ends on the point it was given", () => {
        const out = inject_points(origin, [at(12, 24), at(0, 40)], 2, 7, 1);
        const last = out[out.length - 1];

        expect(last.x).toBe(0);
        expect(last.y).toBe(40);
    });

    it("drops a parent point past a mid-path heading for the boomerang to swing through", () => {
        const out = inject_points(origin, [at(0, 20, 0), at(20, 20)], 2, 7, 1);

        // One lookahead beyond the heading point, along the heading it names
        expect(out.some(p => Math.abs(p.x) < 1e-6 && Math.abs(p.y - 27) < 1e-6)).toBe(true);
    });

    it("leaves the leg into a heading unbroken, since the boomerang owns that approach", () => {
        const out = inject_points(origin, [at(0, 40, 0)], 2, 7, 1);

        // A heading on the final point is steered by the moving carrot rather than by waypoints,
        // so EZ injects nothing ahead of it and the vector stays as short as it was handed over
        expect(out).toEqual([at(0, 0), at(0, 40, 0)]);
    });

    it("returns nothing for an empty movement list rather than throwing", () => {
        expect(inject_points(origin, [], 2, 7, 1)).toEqual([]);
    });

    it("survives a spacing larger than the whole path", () => {
        const out = inject_points(origin, [at(0, 4)], 50, 7, 1);

        expect(out.length).toBeGreaterThanOrEqual(2);
        expect(out.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    });
});

describe("smooth_path", () => {
    const corner = (): waypoint[] => {
        const path: waypoint[] = [];
        for (let y = 0; y <= 20; y += 2) path.push(at(0, y));
        for (let x = 2; x <= 20; x += 2) path.push(at(x, 20));
        return path;
    };

    it("pulls a hard corner in, which is what makes the smooth mode drive differently", () => {
        const raw = corner();
        const smoothed = smooth_path(raw, 0.75, 0.03, 0.0001, 7);

        // The corner point itself moves diagonally inward, cutting the turn
        const cornerIdx = raw.findIndex(p => p.x === 0 && p.y === 20);
        const moved = Math.hypot(
            smoothed[cornerIdx].x - raw[cornerIdx].x,
            smoothed[cornerIdx].y - raw[cornerIdx].y,
        );
        expect(moved).toBeGreaterThan(0.5);
    });

    it("holds both endpoints exactly, so the motion still starts and ends where asked", () => {
        const raw = corner();
        const smoothed = smooth_path(raw, 0.75, 0.03, 0.0001, 7);

        expect(smoothed[0]).toEqual(raw[0]);
        expect(smoothed[smoothed.length - 1]).toEqual(raw[raw.length - 1]);
    });

    it("leaves a path too short to smooth untouched", () => {
        const raw = [at(0, 0), at(0, 10), at(0, 20)];
        expect(smooth_path(raw, 0.75, 0.03, 0.0001, 7)).toEqual(raw);
    });

    it("carries headings through untouched", () => {
        const raw = corner();
        raw[raw.length - 1] = at(20, 20, 90);
        const smoothed = smooth_path(raw, 0.75, 0.03, 0.0001, 7);

        expect(smoothed[smoothed.length - 1].theta).toBe(90);
        expect(smoothed.slice(0, -1).every(p => p.theta === null)).toBe(true);
    });

    it("terminates on a tolerance of zero instead of spinning", () => {
        const smoothed = smooth_path(corner(), 0.75, 0.03, 0, 7);
        expect(smoothed.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    });
});
