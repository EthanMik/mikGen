import { describe, expect, it, vi } from "vitest";
import { Robot } from "../../../core/Robot";
import { bezierPointAt, bezierTangentAt, sampleBezier, type Bezier } from "../../../core/Types/Bezier";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { toDeg, toRad } from "../../../core/Util";
import { kMikDrive, kMikHeading, type mikConstants } from "../MikConstants";
import { reduce_negative_180_to_180, reduce_negative_90_to_90 } from "../Util";

const dt = 1 / 60;
/** 20s at 60hz. Every motion here exits far sooner; hitting this means it never settled. */
const MAX_TICKS = 60 * 20;
/** Reaching the end means landing inside the drive settle error the motion claims to settle on. */
const POSITION_TOLERANCE = 2;
const HEADING_TOLERANCE = 3;
/** Matches the sample count Conversion.ts hands the simulator. */
const SAMPLES = 400;
/** Ticks allowed for a robot seeded off the curve to rejoin it. */
const REJOIN_TICKS = 60;

type Pose = { x: number, y: number, angle: number };

function makeRobot(pose: Pose) {
    return new Robot(
        pose.x, pose.y, pose.angle,
        14, 12, 14, 6,
        0, 0,
        0, 0, 0, 0,
        0, 0, true,
        0, 0, true,
        0, 0, true,
        0, 0, true,
        0.2, 0.1,
    );
}

const curves = {
    nearStraight: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 16 }, c2: { x: 0, y: 32 }, p1: { x: 0, y: 48 } },
    gentle: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 24 }, c2: { x: 24, y: 24 }, p1: { x: 24, y: 48 } },
    sCurve: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 30 }, c2: { x: 24, y: 10 }, p1: { x: 24, y: 48 } },
    tight90: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 36 }, c2: { x: 12, y: 48 }, p1: { x: 48, y: 48 } },
    long: { p0: { x: 0, y: 0 }, c1: { x: 20, y: 60 }, c2: { x: 40, y: 80 }, p1: { x: 48, y: 120 } },
    hairpin: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 60 }, c2: { x: -30, y: 60 }, p1: { x: -6, y: 6 } },
} satisfies Record<string, Bezier>;

function tangentDeg(b: Bezier, t: number): number {
    const tan = bezierTangentAt(b, t);
    return toDeg(Math.atan2(tan.x, tan.y));
}

function crossTrack(points: Coordinate[], x: number, y: number): number {
    let best = Infinity;
    for (const p of points) best = Math.min(best, Math.hypot(p.x - x, p.y - y));
    return best;
}

type Result = {
    done: boolean,
    ticks: number,
    dist: number,
    /** Off the expected end heading. */
    headErr: number,
    /** Off the expected end heading axis, so a robot that finished back first still reads as aligned. */
    axisErr: number,
    maxCrossTrack: number,
    /** Cross track once the robot has had REJOIN_TICKS to get back onto the curve. */
    lateCrossTrack: number,
    /** Signed travel along the robot's own heading, sampled only while outside the settle radius. */
    minForwardStep: number,
    maxForwardStep: number,
    finite: boolean,
};

type FollowPath = (robot: Robot, dt: number, points: Coordinate[], end_angle: number | null, p: mikConstants[]) => boolean;

/** A fresh module per motion, since follow_path keeps its PIDs, path and flags in module state. */
async function freshFollowPath(): Promise<FollowPath> {
    vi.resetModules();
    const { follow_path } = await import("./FollowPath");
    return follow_path;
}

function constants(drive: Partial<mikConstants>, heading: Partial<mikConstants>): mikConstants[] {
    return [{ ...kMikDrive, ...drive }, { ...kMikHeading, ...heading }];
}

function simulate(followPath: FollowPath, robot: Robot, b: Bezier, end_angle: number | null, k: mikConstants[]): Result {
    const points = sampleBezier(b, SAMPLES);
    const reversed = k[0].drive_direction === "reversed";
    const expectedHeading = end_angle ?? tangentDeg(b, 1) + (reversed ? 180 : 0);

    let done = false;
    let ticks = 0;
    let maxCrossTrack = 0;
    let lateCrossTrack = 0;
    let minForwardStep = Infinity;
    let maxForwardStep = -Infinity;

    while (!done && ticks < MAX_TICKS) {
        const prevX = robot.getX();
        const prevY = robot.getY();
        const prevAngle = robot.getAngle();
        const prevEndDist = Math.hypot(b.p1.x - prevX, b.p1.y - prevY);

        done = followPath(robot, dt, points, end_angle, k);
        ticks++;

        if (prevEndDist > 6) {
            const step = (robot.getX() - prevX) * Math.sin(toRad(prevAngle)) + (robot.getY() - prevY) * Math.cos(toRad(prevAngle));
            minForwardStep = Math.min(minForwardStep, step);
            maxForwardStep = Math.max(maxForwardStep, step);
        }

        const off = crossTrack(points, robot.getX(), robot.getY());
        maxCrossTrack = Math.max(maxCrossTrack, off);
        if (ticks > REJOIN_TICKS) lateCrossTrack = Math.max(lateCrossTrack, off);
    }

    return {
        done,
        ticks,
        dist: Math.hypot(b.p1.x - robot.getX(), b.p1.y - robot.getY()),
        headErr: Math.abs(reduce_negative_180_to_180(robot.getAngle() - expectedHeading)),
        axisErr: Math.abs(reduce_negative_90_to_90(robot.getAngle() - expectedHeading)),
        maxCrossTrack,
        lateCrossTrack,
        minForwardStep,
        maxForwardStep,
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
    const followPath = await freshFollowPath();
    const reversed = opts.drive?.drive_direction === "reversed";
    const start = opts.start ?? { ...bezierPointAt(b, 0), angle: tangentDeg(b, 0) + (reversed ? 180 : 0) };
    return simulate(followPath, makeRobot(start), b, opts.end_angle ?? null, constants(opts.drive ?? {}, opts.heading ?? {}));
}

function expectReached(
    result: Result,
    tolerance: { dist?: number, heading?: number, directionFree?: boolean } = {},
) {
    expect(result.done).toBe(true);
    expect(result.ticks).toBeLessThan(MAX_TICKS);
    expect(result.finite).toBe(true);
    expect(result.dist).toBeLessThan(tolerance.dist ?? POSITION_TOLERANCE);
    // On "fastest" the follower may finish back first, so only the heading axis is pinned
    const headErr = tolerance.directionFree ? result.axisErr : result.headErr;
    expect(headErr).toBeLessThan(tolerance.heading ?? HEADING_TOLERANCE);
}

describe("follow_path tracks the curve", () => {
    const cases: { name: string, curve: Bezier, drive?: Partial<mikConstants>, xtrack: number }[] = [
        { name: "a near straight curve", curve: curves.nearStraight, xtrack: 1 },
        { name: "a gentle 90 degree curve", curve: curves.gentle, xtrack: 2 },
        { name: "an s-curve", curve: curves.sCurve, xtrack: 2 },
        { name: "a tight 90 degree curve", curve: curves.tight90, xtrack: 2 },
        { name: "a 130in curve", curve: curves.long, drive: { timeout: 8000 }, xtrack: 1.5 },
        { name: "a hairpin back on itself", curve: curves.hairpin, xtrack: 4 },
    ];

    it.each(cases)("lands on the end of $name without leaving it", async ({ curve, drive, xtrack }) => {
        const result = await run(curve, { drive });

        expectReached(result);
        expect(result.maxCrossTrack).toBeLessThan(xtrack);
    });
});

describe("follow_path end heading", () => {
    it("rides the exit tangent when no angle is commanded", async () => {
        // The gentle curve exits pointing back up +y, so the tangent is the only thing that can place it
        expectReached(await run(curves.gentle));
    });

    it("holds a commanded angle that matches the exit tangent", async () => {
        expectReached(await run(curves.gentle, { end_angle: 0 }), { heading: 1 });
    });

    it("holds a commanded angle 45 off the exit tangent", async () => {
        // Rotating at the end trades away some position, since the settle law only closes error
        // along the robot's own heading
        expectReached(await run(curves.tight90, { end_angle: 45 }), { dist: 4 });
    });

    it("holds a commanded angle square to the exit tangent", async () => {
        expectReached(await run(curves.gentle, { end_angle: 90 }), { dist: 6 });
    });
});

describe("follow_path drive direction", () => {
    it("never travels backwards when forced forwards", async () => {
        const result = await run(curves.gentle, { drive: { drive_direction: "forwards" } });

        expectReached(result);
        expect(result.minForwardStep).toBeGreaterThan(-0.01);
    });

    it("travels backwards the whole way and ends back first when reversed", async () => {
        const result = await run(curves.sCurve, { drive: { drive_direction: "reversed" } });

        expectReached(result);
        expect(result.maxForwardStep).toBeLessThan(0.01);
    });

    it("drives a path behind it back first on fastest instead of spinning around", async () => {
        const result = await run(curves.gentle, {
            start: { x: 0, y: 0, angle: 180 },
            drive: { drive_direction: "fastest" },
        });

        expectReached(result, { directionFree: true });
        expect(result.maxForwardStep).toBeLessThan(0.1);
        // It really did finish on its back end rather than turning to face the tangent
        expect(result.headErr).toBeGreaterThan(90);
    });

    it("drives forwards on fastest when it already faces the path", async () => {
        const result = await run(curves.gentle, { drive: { drive_direction: "fastest" } });

        expectReached(result);
        expect(result.minForwardStep).toBeGreaterThan(-0.1);
    });
});

describe("follow_path recovery", () => {
    it("rejoins the curve after starting 12in off it", async () => {
        const result = await run(curves.gentle, {
            start: { x: -12, y: 12, angle: 0 },
            drive: { drive_direction: "forwards" },
        });

        expectReached(result);
        expect(result.lateCrossTrack).toBeLessThan(3);
    });

    it("rejoins an s-curve after starting 12in off it", async () => {
        const result = await run(curves.sCurve, {
            start: { x: 12, y: 6, angle: 0 },
            drive: { drive_direction: "forwards" },
        });

        expectReached(result);
        expect(result.lateCrossTrack).toBeLessThan(3);
    });

    it("picks the curve up from the middle instead of driving back to its start", async () => {
        const result = await run(curves.gentle, { start: { x: 6, y: 30, angle: 30 } });

        expectReached(result, { directionFree: true });
        expect(result.lateCrossTrack).toBeLessThan(3);
    });

    it("comes back to the end pose after starting past it", async () => {
        // No arc is left to follow from out here, so the settle law does the work and leaves
        // more error than a normal run
        const result = await run(curves.gentle, { start: { x: 30, y: 56, angle: 0 } });

        expectReached(result, { dist: 4, directionFree: true });
    });

    it("turns onto the curve when it starts square to it", async () => {
        expectReached(await run(curves.gentle, { start: { x: 0, y: 0, angle: 90 } }));
    });
});

describe("follow_path tuning constants", () => {
    const cases: { name: string, drive?: Partial<mikConstants>, heading?: Partial<mikConstants> }[] = [
        { name: "max_voltage 4", drive: { max_voltage: 4 } },
        { name: "max_voltage 12", drive: { max_voltage: 12 } },
        { name: "min_voltage 3", drive: { min_voltage: 3 } },
        { name: "slew 0 (no ramp)", drive: { slew: 0 } },
        { name: "slew 6 (fast ramp)", drive: { slew: 6 } },
        { name: "drift 0 (no slip clamp)", drive: { drift: 0 } },
        { name: "lead 0 (carrot on the path)", drive: { lead: 0 } },
        { name: "lead 0.8 (carrot deep behind the lookahead)", drive: { lead: 0.8 } },
        { name: "drift 0.5 (tight slip clamp)", drive: { drift: 0.5, timeout: 8000 } },
        { name: "drift 5 (loose slip clamp)", drive: { drift: 5 } },
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

    it("runs the curve faster without the slip clamp", async () => {
        const clamped = await run(curves.gentle, { drive: { drift: 2 } });
        const loose = await run(curves.gentle, { drive: { drift: 0 } });

        expectReached(clamped);
        expectReached(loose);
        expect(loose.ticks).toBeLessThan(clamped.ticks);
    });
});

describe("follow_path exit conditions", () => {
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

    it("returns immediately for a path it cannot follow", async () => {
        const followPath = await freshFollowPath();
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });

        expect(followPath(robot, dt, [], null, constants({}, {}))).toBe(true);
        expect(followPath(robot, dt, [{ x: 0, y: 0 }], null, constants({}, {}))).toBe(true);
    });

    it("settles out on a zero length path instead of hanging", async () => {
        const followPath = await freshFollowPath();
        const robot = makeRobot({ x: 12, y: 12, angle: 0 });
        const flat = [{ x: 12, y: 12 }, { x: 12, y: 12 }];

        let ticks = 0;
        while (!followPath(robot, dt, flat, null, constants({}, {})) && ticks < MAX_TICKS) ticks++;

        // Only the settle_time window, and the pose survives the degenerate tangent
        expect(ticks).toBeLessThan(30);
        expect(Number.isFinite(robot.getX()) && Number.isFinite(robot.getY()) && Number.isFinite(robot.getAngle())).toBe(true);
    });
});

describe("follow_path state between motions", () => {
    it("resets itself so a second path on the same module still lands", async () => {
        const followPath = await freshFollowPath();
        const robot = makeRobot({ ...bezierPointAt(curves.gentle, 0), angle: tangentDeg(curves.gentle, 0) });

        const first = simulate(followPath, robot, curves.gentle, null, constants({}, {}));
        // Picks up where the first left off, so the second curve starts at the first one's end
        const second = simulate(followPath, robot, curves.tight90 ,null, constants({ timeout: 8000 }, {}));

        expectReached(first);
        expect(second.done).toBe(true);
        expect(second.finite).toBe(true);
    });
});
