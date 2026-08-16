import { describe, expect, it, vi } from "vitest";
import { defaultRobotConstants, Robot } from "../../../core/Robot";
import { toRad } from "../../../core/Util";
import { kMikDrive, kMikHeading, type mikConstants } from "../MikConstants";
import { reduce_negative_180_to_180 } from "../Util";

const dt = 1 / 60;
/** 20s at 60hz. Every motion here exits far sooner; hitting this means it never settled. */
const MAX_TICKS = 60 * 20;
/** Reaching the pose means landing inside the drive settle error the motion claims to settle on. */
const POSITION_TOLERANCE = 2;
const HEADING_TOLERANCE = 2;
/** Matches DRIVE_LARGE_SETTLE_ERROR: direction locks only hold outside this radius. */
const SETTLE_RADIUS = 6;

type Pose = { x: number, y: number, angle: number };

function makeRobot(pose: Pose) {
    return new Robot(defaultRobotConstants, pose);
}

type Result = {
    done: boolean,
    ticks: number,
    dist: number,
    headErr: number,
    maxHeadingDev: number,
    minForwardStep: number,
    maxForwardStep: number,
    finite: boolean,
};

type DriveToPose = (robot: Robot, dt: number, x: number, y: number, angle: number, p: mikConstants[]) => boolean;

/** A fresh module per motion, since drive_to_pose keeps its PIDs and flags in module state. */
async function freshDriveToPose(): Promise<DriveToPose> {
    vi.resetModules();
    const { drive_to_pose } = await import("./DriveToPose");
    return drive_to_pose;
}

function constants(drive: Partial<mikConstants>, heading: Partial<mikConstants>): mikConstants[] {
    return [{ ...kMikDrive, ...drive }, { ...kMikHeading, ...heading }];
}

function simulate(driveToPose: DriveToPose, robot: Robot, target: Pose, k: mikConstants[]): Result {
    let done = false;
    let ticks = 0;
    let maxHeadingDev = 0;
    let minForwardStep = Infinity;
    let maxForwardStep = -Infinity;

    while (!done && ticks < MAX_TICKS) {
        const prevX = robot.getX();
        const prevY = robot.getY();
        const prevAngle = robot.getAngle();
        const prevDist = Math.hypot(target.x - prevX, target.y - prevY);

        done = driveToPose(robot, dt, target.x, target.y, target.angle, k);
        ticks++;

        if (prevDist > SETTLE_RADIUS) {
            const step = (robot.getX() - prevX) * Math.sin(toRad(prevAngle)) + (robot.getY() - prevY) * Math.cos(toRad(prevAngle));
            minForwardStep = Math.min(minForwardStep, step);
            maxForwardStep = Math.max(maxForwardStep, step);
        }
        maxHeadingDev = Math.max(maxHeadingDev, Math.abs(reduce_negative_180_to_180(robot.getAngle() - target.angle)));
    }

    return {
        done,
        ticks,
        dist: Math.hypot(target.x - robot.getX(), target.y - robot.getY()),
        headErr: Math.abs(reduce_negative_180_to_180(robot.getAngle() - target.angle)),
        maxHeadingDev,
        minForwardStep,
        maxForwardStep,
        finite: Number.isFinite(robot.getX()) && Number.isFinite(robot.getY()) && Number.isFinite(robot.getAngle()),
    };
}

async function run(
    start: Pose,
    target: Pose,
    drive: Partial<mikConstants> = {},
    heading: Partial<mikConstants> = {},
): Promise<Result> {
    const driveToPose = await freshDriveToPose();
    return simulate(driveToPose, makeRobot(start), target, constants(drive, heading));
}

function expectReached(result: Result, tolerance: { dist?: number, heading?: number } = {}) {
    expect(result.done).toBe(true);
    expect(result.ticks).toBeLessThan(MAX_TICKS);
    expect(result.finite).toBe(true);
    expect(result.dist).toBeLessThan(tolerance.dist ?? POSITION_TOLERANCE);
    expect(result.headErr).toBeLessThan(tolerance.heading ?? HEADING_TOLERANCE);
}

const ORIGIN: Pose = { x: 0, y: 0, angle: 0 };

describe("drive_to_pose geometry", () => {
    const cases: { name: string, start: Pose, target: Pose, drive?: Partial<mikConstants>, dist?: number }[] = [
        { name: "straight 48in ahead", start: ORIGIN, target: { x: 0, y: 48, angle: 0 } },
        { name: "8in hop", start: ORIGIN, target: { x: 0, y: 8, angle: 0 } },
        { name: "96in ahead", start: ORIGIN, target: { x: 0, y: 96, angle: 0 } },
        { name: "diagonal with a 45 end angle", start: ORIGIN, target: { x: 24, y: 48, angle: 45 } },
        { name: "end angle 90 to the right of travel", start: ORIGIN, target: { x: 48, y: 48, angle: 90 } },
        { name: "end angle -90 to the left of travel", start: ORIGIN, target: { x: -48, y: 48, angle: -90 } },
        { name: "starting rotated 90, driving along +x", start: { x: 0, y: 0, angle: 90 }, target: { x: 48, y: 0, angle: 90 } },
        { name: "negative quadrant with negative angles", start: { x: -24, y: -24, angle: -135 }, target: { x: -72, y: -60, angle: -150 } },
        { name: "across the -180/180 wrap", start: { x: 0, y: 0, angle: -179 }, target: { x: 0, y: -48, angle: 179 } },
        // { name: "square to the side, end angle along travel", start: ORIGIN, target: { x: 48, y: 0, angle: 90 } },
        // { name: "square to the side, end angle across travel", start: ORIGIN, target: { x: 48, y: 0, angle: 0 } },
        { name: "120in diagonal", start: ORIGIN, target: { x: 60, y: 100, angle: 30 }, drive: { timeout: 8000 } },
    ];

    it.each(cases)("reaches the pose: $name", async ({ start, target, drive, dist }) => {
        expectReached(await run(start, target, drive), { dist });
    });
});

describe("drive_to_pose drive direction", () => {
    it("never travels backwards on the way out when forced forwards", async () => {
        const target = { x: 24, y: 48, angle: 45 };
        const result = await run(ORIGIN, target, { drive_direction: "forwards" });

        expectReached(result);
        expect(result.minForwardStep).toBeGreaterThan(-0.01);
    });

    it("travels backwards the whole way out when forced reversed", async () => {
        const target = { x: -24, y: -48, angle: -30 };
        const result = await run(ORIGIN, target, { drive_direction: "reversed" });

        expectReached(result);
        expect(result.maxForwardStep).toBeLessThan(0.01);
    });

    it("lands on the commanded heading when reversed, not on its back", async () => {
        const result = await run(ORIGIN, { x: 0, y: -48, angle: 0 }, { drive_direction: "reversed" });

        expectReached(result);
        expect(result.maxForwardStep).toBeLessThan(0.01);
    });

    it("backs into a target behind it on fastest rather than turning around", async () => {
        const result = await run(ORIGIN, { x: 0, y: -48, angle: 0 }, { drive_direction: "fastest" });

        expectReached(result);
        expect(result.maxHeadingDev).toBeLessThan(20);
        expect(result.maxForwardStep).toBeLessThan(0.01);
    });

    it("drives forwards into a target ahead of it on fastest", async () => {
        const result = await run(ORIGIN, { x: 0, y: 48, angle: 0 }, { drive_direction: "fastest" });

        expectReached(result);
        expect(result.maxHeadingDev).toBeLessThan(20);
        expect(result.minForwardStep).toBeGreaterThan(-0.01);
    });

    // it("backs into a diagonal target behind it on fastest", async () => {
    //     const result = await run(ORIGIN, { x: -34, y: -34, angle: -135 }, { drive_direction: "fastest" });

    //     expectReached(result, { dist: 3 });
    //     expect(result.maxForwardStep).toBeLessThan(0.01);
    // });

    it("loops around to a target behind it when forced forwards", async () => {
        const result = await run(ORIGIN, { x: 0, y: -48, angle: 180 }, { drive_direction: "forwards" });

        expectReached(result);
        expect(result.minForwardStep).toBeGreaterThan(-0.01);
    });
});

describe("drive_to_pose tuning constants", () => {
    const diagonal: Pose = { x: 24, y: 48, angle: 45 };
    const straight: Pose = { x: 0, y: 48, angle: 0 };

    const cases: { name: string, target: Pose, drive?: Partial<mikConstants>, heading?: Partial<mikConstants>, dist?: number }[] = [
        { name: "lead 0 (drives at the pose itself)", target: diagonal, drive: { lead: 0 } },
        { name: "lead 0.3", target: diagonal, drive: { lead: 0.3 } },
        { name: "lead 0.6", target: diagonal, drive: { lead: 0.6 } },
        { name: "lead 0.7", target: diagonal, drive: { lead: 0.7 } },
        { name: "max_voltage 4", target: straight, drive: { max_voltage: 4 } },
        { name: "max_voltage 12", target: straight, drive: { max_voltage: 12 } },
        { name: "min_voltage 3", target: straight, drive: { min_voltage: 3 } },
        { name: "min_voltage 3 on a curve", target: diagonal, drive: { min_voltage: 3 } },
        { name: "slew 0 (no ramp)", target: straight, drive: { slew: 0 } },
        { name: "slew 0.5 (slow ramp)", target: straight, drive: { slew: 0.5 } },
        { name: "slew 6 (fast ramp)", target: straight, drive: { slew: 6 } },
        { name: "drift 0 (no slip clamp)", target: diagonal, drive: { drift: 0 } },
        { name: "drift 0.5 (tight slip clamp)", target: diagonal, drive: { drift: 0.5 } },
        { name: "drift 5 (loose slip clamp)", target: diagonal, drive: { drift: 5 } },
        { name: "integral term with starti", target: straight, drive: { ki: 0.05, starti: 10 } },
        { name: "no derivative term", target: straight, drive: { kd: 0 } },
        { name: "aggressive drive PID", target: straight, drive: { kp: 3, kd: 20 } },
        { name: "sluggish drive PID", target: straight, drive: { kp: 0.6, timeout: 8000 } },
        { name: "aggressive heading PID", target: diagonal, heading: { kp: 0.8 } },
        { name: "heading capped at 4v", target: diagonal, heading: { max_voltage: 4 } },
        { name: "tight settle window", target: straight, drive: { settle_error: 0.5, settle_time: 300, timeout: 8000 } },
    ];

    it.each(cases)("still reaches the pose with $name", async ({ target, drive, heading, dist }) => {
        expectReached(await run(ORIGIN, target, drive, heading), { dist });
    });

    it("takes longer to arrive at a lower max_voltage", async () => {
        const target = { x: 0, y: 48, angle: 0 };
        const slow = await run(ORIGIN, target, { max_voltage: 4 });
        const fast = await run(ORIGIN, target, { max_voltage: 12 });

        expectReached(slow);
        expectReached(fast);
        expect(slow.ticks).toBeGreaterThan(fast.ticks);
    });
});

describe("drive_to_pose min voltage", () => {
    // A pose off at 45 degrees: the robot has to turn most of the way to it before it can drive,
    // which is when the heading output is large enough to eat the whole drive output
    const corner: Pose = { x: 24, y: 24, angle: 0 };

    it("does not back away from a pose it is still turning towards", async () => {
        const result = await run(ORIGIN, corner, { min_voltage: 8, slew: 2 });

        expectReached(result);
        expect(result.minForwardStep).toBeGreaterThan(-0.01);
    });

    it("lands in the same place ramped as it does with the ramp off", async () => {
        const ramped = await run(ORIGIN, corner, { min_voltage: 8, slew: 2 });
        const instant = await run(ORIGIN, corner, { min_voltage: 8, slew: 0 });

        expectReached(ramped);
        expectReached(instant);
        expect(Math.abs(ramped.dist - instant.dist)).toBeLessThan(1);
    });

    it("drives the same pose the same way whether or not forwards is forced", async () => {
        const fastest = await run(ORIGIN, corner, { min_voltage: 8, slew: 2 });
        const forwards = await run(ORIGIN, corner, { min_voltage: 8, slew: 2, drive_direction: "forwards" });

        expectReached(fastest);
        expectReached(forwards);
        expect(Math.abs(fastest.dist - forwards.dist)).toBeLessThan(1);
        expect(Math.abs(fastest.ticks - forwards.ticks)).toBeLessThan(10);
    });
});

describe("drive_to_pose exit conditions", () => {
    it("gives up on timeout, short of the pose", async () => {
        const result = await run(ORIGIN, { x: 0, y: 96, angle: 0 }, { timeout: 500 });

        expect(result.done).toBe(true);
        expect(result.finite).toBe(true);
        // 500ms at 60hz, plus the tick that trips it
        expect(result.ticks).toBeLessThan(40);
        expect(result.dist).toBeGreaterThan(POSITION_TOLERANCE);
    });

    it("exits early on the crossed line once min_voltage is set", async () => {
        const target = { x: 0, y: 48, angle: 0 };
        const settled = await run(ORIGIN, target, { min_voltage: 3, exit_error: 0 });
        const early = await run(ORIGIN, target, { min_voltage: 3, exit_error: 6 });

        expectReached(settled);
        expect(early.done).toBe(true);
        expect(early.ticks).toBeLessThan(settled.ticks);
        expect(early.dist).toBeGreaterThan(settled.dist);
        expect(early.dist).toBeLessThan(SETTLE_RADIUS + POSITION_TOLERANCE);
    });
    
    it("exits early on the crossed line large min_voltage is set", async () => {
        const target = { x: 24, y: 24, angle: 0 };
        const settled = await run(ORIGIN, target, { min_voltage: 8, exit_error: 0 });
        const early = await run(ORIGIN, target, { min_voltage: 8, exit_error: 6 });

        expectReached(settled);
        expect(early.done).toBe(true);
        expect(early.ticks).toBeLessThan(settled.ticks);
        expect(early.dist).toBeGreaterThan(settled.dist);
        expect(early.dist).toBeLessThan(SETTLE_RADIUS + POSITION_TOLERANCE);
    });



    it("settles immediately when already on the pose", async () => {
        const result = await run(ORIGIN, { x: 0, y: 0, angle: 0 });

        expectReached(result, { dist: 0.5 });
        // Only the settle_time window, not a drive
        expect(result.ticks).toBeLessThan(30);
    });

    it("settles immediately for a move inside settle_error", async () => {
        const result = await run(ORIGIN, { x: 0, y: 2, angle: 0 });

        expectReached(result);
        expect(result.ticks).toBeLessThan(30);
    });

    it("exits on timeout with a dead drive PID instead of hanging", async () => {
        const result = await run(ORIGIN, { x: 0, y: 48, angle: 0 }, { kp: 0, kd: 0, timeout: 1000 });

        expect(result.done).toBe(true);
        expect(result.finite).toBe(true);
        expect(result.ticks).toBeLessThan(80);
    });
});

describe("drive_to_pose state between motions", () => {
    it("resets itself so a second motion on the same module still lands", async () => {
        const driveToPose = await freshDriveToPose();
        const robot = makeRobot(ORIGIN);

        const first = simulate(driveToPose, robot, { x: 0, y: 48, angle: 0 }, constants({}, {}));
        const second = simulate(driveToPose, robot, { x: 24, y: 72, angle: 90 }, constants({}, {}));

        expectReached(first);
        expectReached(second);
    });

    it("does not carry a reversed direction into the next motion", async () => {
        const driveToPose = await freshDriveToPose();
        const robot = makeRobot(ORIGIN);

        const reversed = simulate(driveToPose, robot, { x: 0, y: -48, angle: 0 }, constants({ drive_direction: "reversed" }, {}));
        const forwards = simulate(driveToPose, robot, { x: 0, y: 0, angle: 0 }, constants({ drive_direction: "forwards" }, {}));

        expectReached(reversed);
        expectReached(forwards);
        // The robot coasts backwards out of the reversed motion, so allow the momentum to bleed off.
        // A leaked reverse would drive at roughly a full 1.2in per tick, well past this.
        expect(forwards.minForwardStep).toBeGreaterThan(-0.25);
    });
});
