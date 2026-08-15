import { describe, expect, it, vi } from "vitest";
import { defaultRobotConstants, Robot } from "../../../core/Robot";
import { bezierPointAt, bezierTangentAt, sampleBezier, type Bezier } from "../../../core/Types/Bezier";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { toDeg } from "../../../core/Util";
import { kMikDrive, kMikHeading, type mikConstants } from "../../mikLibSim/MikConstants";
import { reduce_negative_180_to_180 } from "../../mikLibSim/Util";

const dt = 1 / 60;
/** 20s at 60hz. Every motion here exits far sooner; hitting this means it never settled. */
const MAX_TICKS = 60 * 20;
/** Reaching the end means landing inside the drive settle error the motion claims to settle on. */
const POSITION_TOLERANCE = 2;
const HEADING_TOLERANCE = 2;
/** Matches the sample count Conversion.ts hands the simulator. */
const SAMPLES = 400;
/** Within this many degrees counts as having arrived on a heading. */
const ON_HEADING = 5;
/** Ticks given to swing onto the heading before tangent tracking is judged. */
const SWING_TICKS = 45;

type Pose = { x: number, y: number, angle: number };

function makeRobot(pose: Pose) {
    return new Robot(defaultRobotConstants, pose);
}

const curves = {
    nearStraight: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 16 }, c2: { x: 0, y: 32 }, p1: { x: 0, y: 48 } },
    gentle: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 24 }, c2: { x: 24, y: 24 }, p1: { x: 24, y: 48 } },
    sCurve: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 30 }, c2: { x: 24, y: 10 }, p1: { x: 24, y: 48 } },
    tight90: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 36 }, c2: { x: 12, y: 48 }, p1: { x: 48, y: 48 } },
    long: { p0: { x: 0, y: 0 }, c1: { x: 20, y: 60 }, c2: { x: 40, y: 80 }, p1: { x: 48, y: 120 } },
} satisfies Record<string, Bezier>;

function tangentDeg(b: Bezier, t: number): number {
    const tan = bezierTangentAt(b, t);
    return toDeg(Math.atan2(tan.x, tan.y));
}

function nearestIdx(points: Coordinate[], x: number, y: number): number {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
        const dist = Math.hypot(points[i].x - x, points[i].y - y);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    return bestIdx;
}

function crossTrack(points: Coordinate[], x: number, y: number): number {
    const idx = nearestIdx(points, x, y);
    return Math.hypot(points[idx].x - x, points[idx].y - y);
}

/** Heading of the sampled path at whichever sample the robot is closest to. */
function nearestTangent(points: Coordinate[], x: number, y: number): number {
    const idx = Math.min(nearestIdx(points, x, y), points.length - 2);
    return toDeg(Math.atan2(points[idx + 1].x - points[idx].x, points[idx + 1].y - points[idx].y));
}

type Result = {
    done: boolean,
    ticks: number,
    dist: number,
    headErr: number,
    maxCrossTrack: number,
    /** Worst gap between the robot heading and the path tangent, once it has had time to swing on. */
    maxTangentLag: number,
    /** First tick the robot was on its commanded heading, or Infinity if it never got there. */
    ticksToHeading: number,
    finite: boolean,
};

type HolonomicFollowPath = (robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: mikConstants[]) => boolean;

/** A fresh module per motion, since the follower keeps its PIDs, path and flags in module state. */
async function freshHolonomicFollowPath(): Promise<HolonomicFollowPath> {
    vi.resetModules();
    const { holonomic_follow_path } = await import("./HolonomicFollowPath");
    // The PID clock reads SIM_CONSTANTS, which only precomputePath writes and resetModules puts
    // back to its default. Keep it in step with the dt driven here so settle and timeout
    // windows count real milliseconds.
    const { SIM_CONSTANTS } = await import("../../../core/ComputePathSim");
    SIM_CONSTANTS.dt = dt;
    SIM_CONSTANTS.dt_ms = dt * 1000;
    return holonomic_follow_path;
}

function constants(drive: Partial<mikConstants>, heading: Partial<mikConstants>): mikConstants[] {
    return [{ ...kMikDrive, ...drive }, { ...kMikHeading, ...heading }];
}

function simulate(followPath: HolonomicFollowPath, robot: Robot, b: Bezier, end_angle: number | null, k: mikConstants[]): Result {
    const points = sampleBezier(b, SAMPLES);
    const expectedHeading = end_angle ?? tangentDeg(b, 1);

    let done = false;
    let ticks = 0;
    let maxCrossTrack = 0;
    let maxTangentLag = 0;
    let ticksToHeading = Infinity;

    while (!done && ticks < MAX_TICKS) {
        done = followPath(robot, dt, points, end_angle, k);
        ticks++;

        maxCrossTrack = Math.max(maxCrossTrack, crossTrack(points, robot.getX(), robot.getY()));

        const target = end_angle ?? nearestTangent(points, robot.getX(), robot.getY());
        const off = Math.abs(reduce_negative_180_to_180(robot.getAngle() - target));
        if (off < ON_HEADING) ticksToHeading = Math.min(ticksToHeading, ticks);
        if (ticks > SWING_TICKS) maxTangentLag = Math.max(maxTangentLag, off);
    }

    return {
        done,
        ticks,
        dist: Math.hypot(b.p1.x - robot.getX(), b.p1.y - robot.getY()),
        headErr: Math.abs(reduce_negative_180_to_180(robot.getAngle() - expectedHeading)),
        maxCrossTrack,
        maxTangentLag,
        ticksToHeading,
        finite: Number.isFinite(robot.getX()) && Number.isFinite(robot.getY()) && Number.isFinite(robot.getAngle()),
    };
}

async function run(
    b: Bezier,
    opts: {
        start?: Pose,
        end_angle?: number | null,
        drive?: Partial<mikConstants>,
        heading?: Partial<mikConstants>,
    } = {},
): Promise<Result> {
    const followPath = await freshHolonomicFollowPath();
    const start = opts.start ?? { ...bezierPointAt(b, 0), angle: tangentDeg(b, 0) };
    return simulate(followPath, makeRobot(start), b, opts.end_angle ?? null, constants(opts.drive ?? {}, opts.heading ?? {}));
}

function expectReached(result: Result, tolerance: { dist?: number, heading?: number } = {}) {
    expect(result.done).toBe(true);
    expect(result.ticks).toBeLessThan(MAX_TICKS);
    expect(result.finite).toBe(true);
    expect(result.dist).toBeLessThan(tolerance.dist ?? POSITION_TOLERANCE);
    expect(result.headErr).toBeLessThan(tolerance.heading ?? HEADING_TOLERANCE);
}

describe("holonomic_follow_path tracks the curve", () => {
    const cases: { name: string, curve: Bezier, drive?: Partial<mikConstants>, xtrack: number }[] = [
        { name: "a near straight curve", curve: curves.nearStraight, xtrack: 0.5 },
        { name: "a gentle 90 degree curve", curve: curves.gentle, xtrack: 2.5 },
        { name: "an s-curve", curve: curves.sCurve, xtrack: 3 },
        { name: "a tight 90 degree curve", curve: curves.tight90, xtrack: 2 },
        { name: "a 130in curve", curve: curves.long, drive: { timeout: 8000 }, xtrack: 1 },
    ];

    it.each(cases)("lands on the end of $name without leaving it", async ({ curve, drive, xtrack }) => {
        const result = await run(curve, { drive });

        expectReached(result);
        expect(result.maxCrossTrack).toBeLessThan(xtrack);
    });
});

describe("holonomic_follow_path tangential heading", () => {
    const cases: { name: string, curve: Bezier, drive?: Partial<mikConstants>, lag: number }[] = [
        { name: "a gentle 90 degree curve", curve: curves.gentle, lag: 20 },
        { name: "an s-curve", curve: curves.sCurve, lag: 25 },
        { name: "a tight 90 degree curve", curve: curves.tight90, lag: 20 },
        { name: "a 130in curve", curve: curves.long, drive: { timeout: 8000 }, lag: 10 },
    ];

    it.each(cases)("rides the tangent the whole way round $name", async ({ curve, drive, lag }) => {
        const result = await run(curve, { drive });

        // No angle commanded, so the heading is whatever the curve is doing under the robot
        expectReached(result);
        expect(result.maxTangentLag).toBeLessThan(lag);
    });

    it("ends on the exit tangent rather than the entry one", async () => {
        // The tight curve enters heading +y and leaves heading +x, so the two cannot be confused
        const result = await run(curves.tight90);

        expectReached(result);
        expect(Math.abs(reduce_negative_180_to_180(tangentDeg(curves.tight90, 1) - tangentDeg(curves.tight90, 0)))).toBeGreaterThan(45);
    });
});

describe("holonomic_follow_path commanded heading", () => {
    const cases: { name: string, curve: Bezier, angle: number }[] = [
        { name: "0 (square to the curve exit)", curve: curves.gentle, angle: 0 },
        { name: "90", curve: curves.gentle, angle: 90 },
        { name: "180", curve: curves.gentle, angle: 180 },
        { name: "-45 on an s-curve", curve: curves.sCurve, angle: -45 },
        { name: "0 against a tight curve", curve: curves.tight90, angle: 0 },
    ];

    it.each(cases)("swings onto a commanded angle of $name mid path and holds it", async ({ curve, angle }) => {
        const result = await run(curve, { end_angle: angle });

        expectReached(result);
        // Arrived on the heading well before the end, the way HolonomicToPose turns while it drives
        expect(result.ticksToHeading).toBeLessThan(result.ticks / 2);
    });

    it("keeps a commanded heading from costing position, unlike the tank follower", async () => {
        const tangential = await run(curves.gentle);
        const square = await run(curves.gentle, { end_angle: 90 });

        expectReached(tangential);
        expectReached(square);
        expect(square.dist).toBeLessThan(POSITION_TOLERANCE);
    });
});

describe("holonomic_follow_path recovery", () => {
    it("rejoins the curve after starting 12in off it", async () => {
        expectReached(await run(curves.gentle, { start: { x: -12, y: 12, angle: 0 } }));
    });

    it("picks the curve up from the middle instead of driving back to its start", async () => {
        expectReached(await run(curves.gentle, { start: { x: 6, y: 30, angle: 30 } }));
    });

    it("strafes back to the end after starting past it", async () => {
        // A holonomic chassis can close this sideways, so it should not settle for the tank result
        expectReached(await run(curves.gentle, { start: { x: 30, y: 56, angle: 0 } }));
    });

    it("turns onto the tangent when it starts facing backwards", async () => {
        expectReached(await run(curves.gentle, { start: { x: 0, y: 0, angle: 180 } }));
    });
});

describe("holonomic_follow_path tuning constants", () => {
    const cases: { name: string, drive?: Partial<mikConstants>, heading?: Partial<mikConstants> }[] = [
        { name: "max_voltage 4", drive: { max_voltage: 4 } },
        { name: "max_voltage 12", drive: { max_voltage: 12 } },
        { name: "min_voltage 3", drive: { min_voltage: 3 } },
        { name: "slew 0 (no ramp)", drive: { slew: 0 } },
        { name: "slew 6 (fast ramp)", drive: { slew: 6 } },
        { name: "aggressive drive PID", drive: { kp: 3, kd: 20 } },
        { name: "sluggish drive PID", drive: { kp: 0.6, timeout: 8000 } },
        { name: "aggressive heading PID", heading: { kp: 0.8 } },
        { name: "heading capped at 4v", heading: { max_voltage: 4 } },
        { name: "tight settle window", drive: { settle_error: 0.5, settle_time: 300, timeout: 8000 } },
    ];

    it.each(cases)("still lands on the end with $name", async ({ drive, heading }) => {
        expectReached(await run(curves.gentle, { drive, heading }));
    });

    it("takes longer to arrive at a lower max_voltage", async () => {
        const slow = await run(curves.gentle, { drive: { max_voltage: 4 } });
        const fast = await run(curves.gentle, { drive: { max_voltage: 12 } });

        expectReached(slow);
        expectReached(fast);
        expect(slow.ticks).toBeGreaterThan(fast.ticks);
    });
});

describe("holonomic_follow_path exit conditions", () => {
    it("gives up on timeout, short of the end", async () => {
        const result = await run(curves.long, { drive: { timeout: 500 } });

        expect(result.done).toBe(true);
        expect(result.finite).toBe(true);
        // 500ms at 60hz, plus the tick that trips it
        expect(result.ticks).toBeLessThan(40);
        expect(result.dist).toBeGreaterThan(POSITION_TOLERANCE);
    });

    it("exits early on the crossed line once min_voltage is set", async () => {
        const settled = await run(curves.gentle, { drive: { min_voltage: 3, exit_error: 0 } });
        const early = await run(curves.gentle, { drive: { min_voltage: 3, exit_error: 6 } });

        expectReached(settled);
        expect(early.done).toBe(true);
        expect(early.ticks).toBeLessThan(settled.ticks);
        expect(early.dist).toBeGreaterThan(settled.dist);
        expect(early.dist).toBeLessThan(8);
    });

    it("does not exit early just because it started past the end line", async () => {
        // prev_line_settled is seeded on the first tick, so a robot behind the end plane still drives
        const result = await run(curves.gentle, {
            start: { x: 30, y: 56, angle: 0 },
            drive: { min_voltage: 3 },
        });

        expectReached(result);
    });

    it("returns immediately for a path it cannot follow", async () => {
        const followPath = await freshHolonomicFollowPath();
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });

        expect(followPath(robot, dt, [], null, constants({}, {}))).toBe(true);
        expect(followPath(robot, dt, [{ x: 0, y: 0 }], null, constants({}, {}))).toBe(true);
    });

    it("settles out on a zero length path instead of hanging", async () => {
        const followPath = await freshHolonomicFollowPath();
        const robot = makeRobot({ x: 12, y: 12, angle: 0 });
        const flat = [{ x: 12, y: 12 }, { x: 12, y: 12 }];

        let ticks = 0;
        while (!followPath(robot, dt, flat, null, constants({}, {})) && ticks < MAX_TICKS) ticks++;

        expect(ticks).toBeLessThan(30);
        expect(Number.isFinite(robot.getX()) && Number.isFinite(robot.getY()) && Number.isFinite(robot.getAngle())).toBe(true);
    });
});

describe("holonomic_follow_path state between motions", () => {
    it("resets itself so a second path on the same module still lands", async () => {
        const followPath = await freshHolonomicFollowPath();
        const robot = makeRobot({ ...bezierPointAt(curves.gentle, 0), angle: tangentDeg(curves.gentle, 0) });

        const first = simulate(followPath, robot, curves.gentle, null, constants({}, {}));
        // Picks up where the first left off, so the second curve starts at the first one's end
        const second = simulate(followPath, robot, curves.tight90, 45, constants({ timeout: 8000 }, {}));

        expectReached(first);
        expect(second.done).toBe(true);
        expect(second.finite).toBe(true);
    });
});
