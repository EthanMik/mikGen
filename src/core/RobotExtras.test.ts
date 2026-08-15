import { describe, it, expect } from "vitest";
import { defaultRobotConstants, Robot, type RobotConstants } from "./Robot";

const dt = 0.01;

function makeRobot(overrides: Partial<RobotConstants> = {}) {
    return new Robot({
        ...defaultRobotConstants,
        // Passing a latency in a test means wanting it on
        latencyDisabled: overrides.latencyMs === undefined,
        ...overrides,
    });
}

function driveStraight(robot: Robot, ticks: number, cmd = 1, step = dt) {
    for (let i = 0; i < ticks; i++) robot.tankDrive(cmd, cmd, step);
}

describe("latency disabled", () => {
    it("keeps the sensed pose identical to the true pose", () => {
        const robot = makeRobot();
        driveStraight(robot, 100);
        expect(robot.getX()).toBe(robot.getTrueX());
        expect(robot.getY()).toBe(robot.getTrueY());
        expect(robot.getAngle()).toBe(robot.getTrueAngle());
    });
});

describe("control loop", () => {
    it("defaults to a 10ms tick", () => {
        expect(makeRobot().getControlDt()).toBeCloseTo(0.01, 10);
    });

    it("reports the tick the update rate asks for", () => {
        expect(makeRobot({ updateHz: 60 }).getControlDt()).toBeCloseTo(1 / 60, 10);
        expect(makeRobot({ updateHz: 20 }).getControlDt()).toBeCloseTo(0.05, 10);
    });

    it("drives the same distance per second whatever the rate", () => {
        // Same one second of sim time, split into different numbers of ticks
        const fast = makeRobot({ updateHz: 100 });
        const slow = makeRobot({ updateHz: 50 });
        driveStraight(fast, 100, 1, 0.01);
        driveStraight(slow, 50, 1, 0.02);
        expect(slow.getTrueY()).toBeCloseTo(fast.getTrueY(), 0);
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

    it("delays by the requested time rather than to the nearest tick", () => {
        // 25ms of delay on a 20ms grid only lands right if the log is interpolated
        const robot = makeRobot({ latencyMs: 25, updateHz: 50 });
        driveStraight(robot, 200, 1, 0.02);
        const lag = robot.getTrueY() - robot.getY();
        const expected = robot.getYVelocity() * 0.025;
        expect(lag).toBeGreaterThan(expected * 0.8);
        expect(lag).toBeLessThan(expected * 1.2);
    });

    it("leaves the true trajectory untouched", () => {
        const plain = makeRobot();
        const delayed = makeRobot({ latencyMs: 50 });
        driveStraight(plain, 100);
        driveStraight(delayed, 100);
        // Latency changes only what the controller reads, never the physics
        expect(delayed.getTrueY()).toBe(plain.getTrueY());
        expect(delayed.getTrueAngle()).toBe(plain.getTrueAngle());
    });
});

describe("setPose", () => {
    it("resets the sensors so the controller does not read a stale pose", () => {
        const robot = makeRobot({ latencyMs: 50 });
        driveStraight(robot, 100);
        robot.setPose(24, 24, 90);
        expect(robot.getX()).toBeCloseTo(24, 6);
        expect(robot.getY()).toBeCloseTo(24, 6);
        expect(robot.getAngle()).toBeCloseTo(90, 6);
    });
});
