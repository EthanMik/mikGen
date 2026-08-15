import { describe, it, expect } from "vitest";
import { defaultRobotConstants, Robot } from "./Robot";

const dt = 1 / 60;

function makeRobot(trackwidth = 12, height = 14) {
    return new Robot({ ...defaultRobotConstants, trackwidth, height });
}

function poseIsFinite(robot: Robot) {
    return Number.isFinite(robot.getX()) && Number.isFinite(robot.getY()) && Number.isFinite(robot.getAngle());
}

describe("Robot.tankDrive", () => {
    it("ignores a NaN motor command instead of poisoning the pose", () => {
        const robot = makeRobot();
        robot.tankDrive(NaN, NaN, dt);
        expect(poseIsFinite(robot)).toBe(true);
    });

    it("keeps the pose finite with a 0in track width", () => {
        const robot = makeRobot(0);
        for (let i = 0; i < 10; i++) robot.tankDrive(0.5, 0.5, dt);
        expect(poseIsFinite(robot)).toBe(true);
    });

    it("still drives forward normally", () => {
        const robot = makeRobot();
        for (let i = 0; i < 60; i++) robot.tankDrive(1, 1, dt);
        expect(poseIsFinite(robot)).toBe(true);
        expect(Math.hypot(robot.getX(), robot.getY())).toBeGreaterThan(0);
    });
});

describe("Robot.mecanumDrive", () => {
    it("ignores a NaN motor command instead of poisoning the pose", () => {
        const robot = makeRobot();
        robot.mecanumDrive(NaN, 0.5, NaN, 0.5, dt);
        expect(poseIsFinite(robot)).toBe(true);
    });

    it("keeps the pose finite with a 0in track width and height", () => {
        const robot = makeRobot(0, 0);
        for (let i = 0; i < 10; i++) robot.mecanumDrive(1, -1, 1, -1, dt);
        expect(poseIsFinite(robot)).toBe(true);
    });
});
