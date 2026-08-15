import { describe, expect, it, vi } from "vitest";

// FileUtils pulls in the app state module, which reads localStorage at import time
const storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
});
vi.stubGlobal("alert", () => { });

/** The old mikConstants shape, before poseDrive gained its translational entry. */
const oldDrive = {
    max_voltage: 12, min_voltage: 0, kp: 1.5, ki: 0, kd: 10, starti: 0,
    exit_error: 0, settle_error: 2, settle_time: 200, timeout: 5000,
    slew: 2, drift: 2, lead: 0.5,
    turn_direction: "fastest", drive_direction: "fastest", swing_direction: "left",
    opposite_voltage: 0,
};
const oldHeading = { ...oldDrive, max_voltage: 12, kp: 0.4, kd: 1, settle_error: 1, timeout: 3000, slew: 0, drift: 0, lead: 0 };

function segment(id: string, kind: string, pose: object, constants: object[]) {
    return {
        id, selected: false, hovered: false, disabled: false, locked: false, visible: true,
        pose, format: "Holonomic", kind, constants,
    };
}

/** A trimmed copy of the file that crashed: v1.0.0 header, stale defaults, stale robot keys. */
const staleFile = "mikGen v1.0.0\n" + JSON.stringify({
    format: "Holonomic",
    field: "pushback-vexu-match",
    formatDef: {
        constants: [oldDrive],
        kMaxSpeed: 12,
        formatPathName: "Holonomic Path",
        segments: {
            poseDrive: { name: "Holonomic to Pose", defaults: [oldDrive, oldHeading] },
        },
    },
    path: {
        segments: [
            segment("s1", "start", { x: -47, y: -15.5, angle: 90 }, [oldDrive]),
            segment("s2", "poseDrive", { x: -47.5, y: -47, angle: 90 }, [oldDrive, oldHeading]),
        ],
        name: "",
    },
    robot: {
        width: 13.5, height: 15, speed: 6, lateralTau: 0.2, angularTau: 0.1,
        cogOffsetX: 0, cogOffsetY: 0,
        expansionFront: 0, expansionLeft: 0, expansionRight: 0, expansionRear: 0,
        isOmni: false,
    },
});

describe("loading a file saved before poseDrive grew translational constants", () => {
    it("fills the missing constants entry on segments and defaults", async () => {
        const { deserializeToState } = await import("./FileUtils");
        const state = deserializeToState(staleFile, "Push-Back-AWP");

        const pose = state.path.segments.find(s => s.kind === "poseDrive")!;
        expect(pose.constants).toHaveLength(3);
        expect((pose.constants[2] as { kp: number }).kp).toBeDefined();
        expect((pose.constants[0] as { kp: number }).kp).toBe(1.5);

        const defaults = state.formatDef.segments.poseDrive!.defaults!;
        expect(defaults).toHaveLength(3);
    });

    it("keeps the saved robot values and fills the missing keys", async () => {
        const { deserializeToState } = await import("./FileUtils");
        const state = deserializeToState(staleFile, "Push-Back-AWP");

        expect(state.robot.width).toBe(13.5);
        expect(state.robot.height).toBe(15);
        expect(state.robot.trackwidth).toBe(12);
        expect(state.robot.holonomicRobot).toBe(false);
        expect(state.robot.latencyDisabled).toBe(true);
    });

    it("simulates the loaded path without crashing", async () => {
        const { deserializeToState } = await import("./FileUtils");
        const { convertPathToSim } = await import("../simulation/Conversion");
        const { precomputePath } = await import("./ComputePathSim");
        const { Robot, defaultRobotConstants } = await import("./Robot");

        const state = deserializeToState(staleFile, "Push-Back-AWP");
        const robot = new Robot({ ...defaultRobotConstants, width: 13.5, height: 15, holonomicRobot: true });

        const sim = precomputePath(robot, convertPathToSim(state.formatDef, state.path));
        expect(sim.totalTime).toBeGreaterThan(0);
        expect(sim.trajectory.length).toBeGreaterThan(0);
        expect(Number.isFinite(sim.trajectory[sim.trajectory.length - 1].x)).toBe(true);
    });
});
