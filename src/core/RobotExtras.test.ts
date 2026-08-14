import { describe, it, expect } from "vitest";
import { DISABLED_EXTRAS, Robot, type RobotExtras } from "./Robot";

const dt = 0.01;

function makeRobot(extras: Partial<RobotExtras> = {}) {
    return new Robot(
        0, 0, 0,
        14, 12, 14, 6,
        0, 0,
        0, 0, 0, 0,
        0, 0, true,
        0, 0, true,
        0, 0, true,
        0, 0, true,
        0.2, 0.1,
        { ...DISABLED_EXTRAS, ...extras },
    );
}

function driveStraight(robot: Robot, ticks: number, cmd = 1) {
    for (let i = 0; i < ticks; i++) robot.tankDrive(cmd, cmd, dt);
}

describe("extras disabled", () => {
    it("keeps the sensed pose identical to the true pose", () => {
        const robot = makeRobot();
        driveStraight(robot, 100);
        expect(robot.getX()).toBe(robot.getTrueX());
        expect(robot.getY()).toBe(robot.getTrueY());
        expect(robot.getAngle()).toBe(robot.getTrueAngle());
    });
});

describe("control loop", () => {
    it("always reports the fixed 10ms tick", () => {
        expect(makeRobot().getControlDt()).toBeCloseTo(0.01, 10);
    });
});

describe("latency", () => {
    it("makes the controller read a pose behind the true one while moving", () => {
        const robot = makeRobot({ latencyMs: 50 });
        driveStraight(robot, 100);
        // Heading 0 drives +y, so the delayed sensed pose trails the true pose
        expect(robot.getY()).toBeLessThan(robot.getTrueY() - 0.5);
    });

    it("catches back up once the robot sits still", () => {
        const robot = makeRobot({ latencyMs: 50 });
        driveStraight(robot, 100);
        driveStraight(robot, 200, 0);
        expect(Math.abs(robot.getY() - robot.getTrueY())).toBeLessThan(0.05);
    });
});

describe("odometry", () => {
    it("tracks the true pose when the encoders have no scale error", () => {
        const robot = makeRobot({ odomDriftPercent: 0 });
        driveStraight(robot, 200);
        expect(Math.abs(robot.getY() - robot.getTrueY())).toBeLessThan(0.1);
    });

    it("drifts ahead of the true pose by the scale error", () => {
        const robot = makeRobot({ odomDriftPercent: 2 });
        driveStraight(robot, 300);
        const err = robot.getY() - robot.getTrueY();
        const expected = robot.getTrueY() * 0.02;
        expect(err).toBeGreaterThan(expected * 0.5);
        expect(err).toBeLessThan(expected * 1.5);
    });

    it("includes imu drift: the sensed heading walks away from the true one", () => {
        const robot = makeRobot({ odomDriftPercent: 0 });
        // A minute of sim time sitting still; 0.5 deg/min of drift, either sign
        driveStraight(robot, 6000, 0);
        const raw = robot.getAngle() - robot.getTrueAngle();
        const err = Math.abs(((raw + 540) % 360) - 180);
        expect(err).toBeGreaterThan(0.25);
        expect(err).toBeLessThan(0.75);
    });

    it("is deterministic for the same robot config", () => {
        const a = makeRobot({ odomDriftPercent: 1, latencyMs: 25 });
        const b = makeRobot({ odomDriftPercent: 1, latencyMs: 25 });
        driveStraight(a, 200);
        driveStraight(b, 200);
        expect(a.getTrueY()).toBe(b.getTrueY());
        expect(a.getAngle()).toBe(b.getAngle());
    });
});

describe("setPose", () => {
    it("resets the sensors so the controller does not read a stale pose", () => {
        const robot = makeRobot({ latencyMs: 50, odomDriftPercent: 1 });
        driveStraight(robot, 100);
        robot.setPose(24, 24, 90);
        expect(robot.getX()).toBeCloseTo(24, 6);
        expect(robot.getY()).toBeCloseTo(24, 6);
        expect(robot.getAngle()).toBeCloseTo(90, 6);
    });
});
