import { describe, it, expect, vi, beforeEach } from "vitest";

// The store modules read localStorage as they load, and node has none
vi.hoisted(() => {
    (globalThis as { localStorage?: unknown }).localStorage ??= {
        getItem: () => null, setItem: () => { }, removeItem: () => { }, clear: () => { }, key: () => null, length: 0,
    };
});

import { defaultRobotConstants, Robot } from "../../../core/Robot";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { bezierPointAt, resamplePolyline, sampleBezier } from "../../../core/Types/Bezier";
import type { EZconstants } from "../EZConstants";
import { getDefaultConstants } from "../../FormatDefinition";
import { pid_odom_pp_set, resetPpSet } from "./pid_odom_pp_set";

const MAX_TICKS = 4000;
const DT = 1 / 100;

const curve = { p0: { x: 0, y: 0 }, c1: { x: 24, y: 12 }, c2: { x: -24, y: 28 }, p1: { x: 0, y: 40 } };

function constants(patch: Partial<EZconstants> = {}): EZconstants[] {
    const defaults = getDefaultConstants(undefined, "EZ-Template", "bezierCurve") as unknown as EZconstants[];
    return defaults.map((c, i) => (i === 0 ? { ...c, ...patch } : { ...c }));
}

/** Runs the follower to completion, reporting where it went and whether it got there. */
function follow(points: Coordinate[], angle: number | null, k: EZconstants[]) {
    const robot = new Robot(defaultRobotConstants);
    const trace: Coordinate[] = [];
    let ticks = 0;
    let done = false;

    while (!done && ticks < MAX_TICKS) {
        done = pid_odom_pp_set(robot, DT, points, angle, k);
        trace.push({ x: robot.getX(), y: robot.getY() });
        ticks++;
    }

    return {
        done, ticks, trace,
        x: robot.getX(), y: robot.getY(), angle: robot.getAngle(),
        finite: Number.isFinite(robot.getX()) && Number.isFinite(robot.getY()),
    };
}

/** Worst distance from the traced path to the curve it was meant to follow. */
function deviationFromCurve(trace: Coordinate[]): number {
    const reference = sampleBezier(curve, 200);
    let worst = 0;
    for (const p of trace) {
        let nearest = Infinity;
        for (const q of reference) nearest = Math.min(nearest, Math.hypot(q.x - p.x, q.y - p.y));
        worst = Math.max(worst, nearest);
    }
    return worst;
}

const waypoints = () => resamplePolyline(sampleBezier(curve, 400), 2);

describe("pid_odom_pp_set", () => {
    beforeEach(() => resetPpSet());

    it.each([
        "pid_odom_injected_pp_set",
        "pid_odom_pp_set",
        "pid_odom_smooth_pp_set",
    ] as const)("drives %s to the end of the vector", (pp_mode) => {
        const result = follow(waypoints(), null, constants({ pp_mode }));

        expect(result.finite).toBe(true);
        expect(result.done).toBe(true);
        expect(result.ticks).toBeLessThan(MAX_TICKS);
        expect(Math.hypot(result.x - curve.p1.x, result.y - curve.p1.y)).toBeLessThan(2);
    });

    it("tracks the curve rather than cutting straight to the end", () => {
        const result = follow(waypoints(), null, constants({ pp_mode: "pid_odom_pp_set" }));

        // The curve swings out past x = 4 on its way; a robot driving the chord never would
        expect(Math.max(...result.trace.map(p => p.x))).toBeGreaterThan(3);
        expect(deviationFromCurve(result.trace)).toBeLessThan(4);
    });

    it("smoothing cuts the corner, which is the point of offering it", () => {
        const raw = follow(waypoints(), null, constants({ pp_mode: "pid_odom_pp_set" }));
        resetPpSet();
        const smooth = follow(waypoints(), null, constants({ pp_mode: "pid_odom_smooth_pp_set" }));

        const bulge = (t: Coordinate[]) => Math.max(...t.map(p => Math.abs(p.x)));
        expect(bulge(smooth.trace)).toBeLessThan(bulge(raw.trace));
    });

    it("lands on the commanded heading when the curve names one", () => {
        const result = follow(waypoints(), 90, constants({ pp_mode: "pid_odom_injected_pp_set" }));

        expect(result.done).toBe(true);
        expect(Math.abs(result.angle - 90)).toBeLessThan(15);
    });

    it("finishes immediately on an empty vector instead of running forever", () => {
        const robot = new Robot(defaultRobotConstants);
        expect(pid_odom_pp_set(robot, DT, [], null, constants())).toBe(true);
    });

    it("handles a single waypoint as a plain point to point move", () => {
        const result = follow([{ x: 0, y: 24 }], null, constants());

        expect(result.finite).toBe(true);
        expect(result.done).toBe(true);
        expect(Math.hypot(result.x, result.y - 24)).toBeLessThan(2);
    });

    it("drives the curve in reverse without losing the path", () => {
        const result = follow(waypoints(), null, constants({ pp_mode: "pid_odom_pp_set", drive_directions: "rev" }));

        expect(result.finite).toBe(true);
        expect(Math.hypot(result.x - curve.p1.x, result.y - curve.p1.y)).toBeLessThan(3);
    });

    it("resets between runs so a second follow starts clean", () => {
        const first = follow(waypoints(), null, constants());
        resetPpSet();
        const second = follow(waypoints(), null, constants());

        expect(second.done).toBe(true);
        expect(Math.abs(second.ticks - first.ticks)).toBeLessThan(first.ticks * 0.5);
    });

    it("stays finite when every waypoint sits on top of the robot", () => {
        const stacked = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));
        const result = follow(stacked, null, constants());

        expect(result.finite).toBe(true);
        expect(result.ticks).toBeLessThan(MAX_TICKS);
    });

    it("follows a vector coarse enough that injection has real work to do", () => {
        // Ten inch spacing leaves gaps a follower cannot track on its own, which is exactly the
        // case the injected mode exists for
        const coarse = resamplePolyline(sampleBezier(curve, 400), 10);
        const result = follow(coarse, null, constants({ pp_mode: "pid_odom_injected_pp_set" }));

        expect(result.done).toBe(true);
        expect(Math.hypot(result.x - curve.p1.x, result.y - curve.p1.y)).toBeLessThan(2);
    });

    it("passes near the waypoints it was given", () => {
        const points = waypoints();
        const result = follow(points, null, constants({ pp_mode: "pid_odom_pp_set" }));

        // Sampled along the curve rather than at its ends, where the lookahead legitimately cuts
        for (const t of [0.25, 0.5, 0.75]) {
            const target = bezierPointAt(curve, t);
            const nearest = Math.min(...result.trace.map(p => Math.hypot(p.x - target.x, p.y - target.y)));
            expect(nearest).toBeLessThan(4);
        }
    });
});
