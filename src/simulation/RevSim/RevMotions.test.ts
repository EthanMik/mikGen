import { describe, expect, it, vi } from "vitest";
import { defaultRobotConstants, Robot } from "../../core/Robot";
import {
    kRevDrive, kRevHeading, kRevTranslational, kRevTurn, type revConstants,
} from "./RevConstants";
import { wrap_angle_180 } from "./Util";
import { sampleBezier } from "../../core/Types/Bezier";

const dt = 1 / 60;
const MAX_TICKS = 60 * 20;

type Pose = { x: number, y: number, angle: number };

function makeRobot(pose: Pose, holonomic = false) {
    return new Robot({ ...defaultRobotConstants, holonomicRobot: holonomic }, pose);
}

function run(step: (robot: Robot) => boolean, robot: Robot) {
    let done = false;
    let ticks = 0;
    let finite = true;
    while (!done && ticks < MAX_TICKS) {
        done = step(robot);
        ticks++;
        if (!Number.isFinite(robot.getX()) || !Number.isFinite(robot.getY()) || !Number.isFinite(robot.getAngle())) {
            finite = false;
            break;
        }
    }
    return { done, ticks, finite };
}

function driveK(drive: Partial<revConstants> = {}, heading: Partial<revConstants> = {}): revConstants[] {
    return [{ ...kRevDrive, ...drive }, { ...kRevHeading, ...heading }];
}

describe("ReveilLib simulation", () => {
    it("drives to a pose and lands on it", async () => {
        vi.resetModules();
        const { drive_to_pose } = await import("./DriveMotions/DriveToPose");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const k = driveK();
        const r = run(b => drive_to_pose(b, dt, 24, 36, 90, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(r.ticks).toBeLessThan(MAX_TICKS);
        expect(Math.hypot(24 - robot.getX(), 36 - robot.getY())).toBeLessThan(3);
        expect(Math.abs(wrap_angle_180(90 - robot.getAngle()))).toBeLessThan(6);
    });

    it("drives to a point and lands on it", async () => {
        vi.resetModules();
        const { drive_to_point } = await import("./DriveMotions/DriveToPoint");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const k = driveK();
        const r = run(b => drive_to_point(b, dt, -30, 20, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(Math.hypot(-30 - robot.getX(), 20 - robot.getY())).toBeLessThan(3);
    });

    it("drives a set distance along its heading", async () => {
        vi.resetModules();
        const { drive_distance } = await import("./DriveMotions/DriveDistance");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const k = driveK();
        const r = run(b => drive_distance(b, dt, 24, 0, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(robot.getY()).toBeGreaterThan(21);
        expect(robot.getY()).toBeLessThan(27);
        expect(Math.abs(robot.getX())).toBeLessThan(2);
    });

    it("turns to an angle", async () => {
        vi.resetModules();
        const { turn_to_angle } = await import("./DriveMotions/TurnToAngle");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const k = [{ ...kRevTurn }];
        const r = run(b => turn_to_angle(b, dt, 135, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(Math.abs(wrap_angle_180(135 - robot.getAngle()))).toBeLessThan(4);
    });

    it("turns to face a point", async () => {
        vi.resetModules();
        const { turn_to_point } = await import("./DriveMotions/TurnToPoint");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const k = [{ ...kRevTurn }];
        const r = run(b => turn_to_point(b, dt, 24, 24, 0, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(Math.abs(wrap_angle_180(45 - robot.getAngle()))).toBeLessThan(4);
    });

    it("swings to an angle on one side", async () => {
        vi.resetModules();
        const { swing_to_angle } = await import("./DriveMotions/SwingToAngle");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const k = [{ ...kRevTurn }];
        const r = run(b => swing_to_angle(b, dt, 90, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(Math.abs(wrap_angle_180(90 - robot.getAngle()))).toBeLessThan(4);
    });

    it("follows a path to its end", async () => {
        vi.resetModules();
        const { drive_on_path } = await import("./DriveMotions/DriveOnPath");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 });
        const points = sampleBezier({ p0: { x: 0, y: 0 }, c1: { x: 0, y: 24 }, c2: { x: 24, y: 24 }, p1: { x: 24, y: 48 } }, 400);
        const k = driveK();
        const r = run(b => drive_on_path(b, dt, points, null, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(Math.hypot(24 - robot.getX(), 48 - robot.getY())).toBeLessThan(4);
    });

    it("strafes to a pose on a mecanum chassis", async () => {
        vi.resetModules();
        const { strafe_to_pose } = await import("../RevHolonomicSim/DriveMotions/StrafeToPose");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 }, true);
        const k = [{ ...kRevDrive }, { ...kRevHeading }, { ...kRevTranslational }];
        const r = run(b => strafe_to_pose(b, dt, 24, 24, 90, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(Math.hypot(24 - robot.getX(), 24 - robot.getY())).toBeLessThan(3);
        expect(Math.abs(wrap_angle_180(90 - robot.getAngle()))).toBeLessThan(6);
    });

    it("strafes a set distance sideways", async () => {
        vi.resetModules();
        const { strafe_distance } = await import("../RevHolonomicSim/DriveMotions/StrafeDistance");
        const robot = makeRobot({ x: 0, y: 0, angle: 0 }, true);
        const k = driveK();
        const r = run(b => strafe_distance(b, dt, 24, 0, k), robot);

        expect(r.finite).toBe(true);
        expect(r.done).toBe(true);
        expect(robot.getX()).toBeGreaterThan(21);
        expect(robot.getX()).toBeLessThan(27);
        expect(Math.abs(robot.getY())).toBeLessThan(3);
    });
});
