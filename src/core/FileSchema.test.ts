import { describe, expect, it, vi } from "vitest";

// FileSchema reads localStorage at import time, and node has none
const storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
});
vi.stubGlobal("alert", () => { });

import {
    DEFAULT_FIELD_KEY, deserializeToState, newFileFormat, seedFileFormat, serializeFile, type FieldType,
} from "./FileSchema";
import { FORMATS, everyKindSegments, expectValidFileFormat, rawSegment as segment } from "./FileSchema.fixtures";
import { defaultRobotConstants } from "./Robot";

describe("seedFileFormat", () => {
    const hostile: [string, unknown][] = [
        ["undefined", undefined],
        ["null", null],
        ["a number", 0],
        ["a string", "not a file"],
        ["an array", []],
        ["an empty object", {}],
        ["an unknown format", { format: "BananaLib" }],
        ["a null format", { format: null }],
        ["an unknown field", { field: "mars-v9-match" }],
        ["a null path", { path: null }],
        ["a non-array segment list", { path: { segments: "nope" } }],
        ["a non-string path name", { path: { name: 42, segments: [] } }],
        ["a segment that is not an object", { path: { segments: [null, "x", 7] } }],
        ["an unknown segment kind", { path: { segments: [segment({ kind: "teleport" })] } }],
        ["a missing segment kind", { path: { segments: [segment({ kind: undefined })] } }],
        ["null constants", { path: { segments: [segment({ constants: null })] } }],
        ["empty constants", { path: { segments: [segment({ constants: [] })] } }],
        ["string constants", { path: { segments: [segment({ constants: "x" })] } }],
        ["a missing pose", { path: { segments: [segment({ pose: undefined })] } }],
        ["a NaN pose", { path: { segments: [segment({ pose: { x: NaN, y: "3", angle: Infinity } })] } }],
        ["null controls", { path: { segments: [segment({ controls: null })] } }],
        ["junk controls", { path: { segments: [segment({ controls: [{}, null, 5] })] } }],
        ["a string distance", { path: { segments: [segment({ distance: "5", time: NaN })] } }],
        ["duplicate ids", { path: { segments: [segment(), segment(), segment()] } }],
        ["a missing id", { path: { segments: [segment({ id: "" })] } }],
        ["non-boolean flags", { path: { segments: [segment({ visible: "yes", turnLocked: 1 })] } }],
        ["a first motion that is not a start", { path: { segments: [segment({ kind: "poseDrive" })] } }],
        ["a garbage robot", { robot: { width: "13.5", speed: NaN, height: null } }],
        ["a garbage formatDef", { formatDef: "nope" }],
        ["a formatDef with no segments", { formatDef: {} }],
    ];

    it.each(hostile)("returns a usable file format for %s", (_label, raw) => {
        expectValidFileFormat(seedFileFormat(raw));
    });

    it("keeps the values that are good and only replaces the ones that are not", () => {
        const state = seedFileFormat({ robot: { width: 13.5, height: 15, speed: NaN } });

        expect(state.robot.width).toBe(13.5);
        expect(state.robot.height).toBe(15);
        expect(state.robot.speed).toBe(defaultRobotConstants.speed);
    });

    it("keeps a valid format and field rather than defaulting them", () => {
        const state = seedFileFormat({ format: "LemLib", field: "pushback-v5-skills" });

        expect(state.format).toBe("LemLib");
        expect(state.field).toBe("pushback-v5-skills");
        expect(state.formatDef.segments.pointDrive).toBeDefined();
    });

    it("reports nothing to repair for a file the current app just wrote", () => {
        const repairs: string[] = [];
        seedFileFormat(JSON.parse(serializeFile(newFileFormat())), repairs);

        expect(repairs).toEqual([]);
    });

    it("reports a repair when a file is genuinely stale, so the alert is not spurious", () => {
        const repairs: string[] = [];
        seedFileFormat({ format: "BananaLib", field: "mars-v9" }, repairs);

        expect(repairs.length).toBeGreaterThan(0);
    });

    it("gives every segment a distinct id even when the file repeats one", () => {
        const state = seedFileFormat({ path: { segments: [segment(), segment(), segment()] } });

        expect(new Set(state.path.segments.map(s => s.id)).size).toBe(3);
    });

    it("drops only the unusable segments and keeps the rest", () => {
        const state = seedFileFormat({
            path: { segments: [segment(), null, segment({ id: "s2", kind: "poseDrive" }), segment({ id: "s3", kind: "teleport" })] },
        });

        expect(state.path.segments.map(s => s.kind)).toEqual(["start", "poseDrive"]);
    });
});

describe("deserializeToState", () => {
    it("takes the path name from the filename", () => {
        const state = deserializeToState(serializeFile(newFileFormat()), "Push-Back-AWP");

        expect(state.path.name).toBe("Push-Back-AWP");
    });

    it.each([
        ["a truncated body", '{"format":"mikLib","path":{'],
        ["an empty file", ""],
        ["plain text", "hello world"],
        ["a bare version line", "mikGen v1.0.0\n"],
    ])("survives %s", (_label, content) => {
        expectValidFileFormat(deserializeToState(content, "broken"));
    });

    it("still opens files that carry the old version header", () => {
        const legacy = "mikGen v1.0.0\n" + JSON.stringify(newFileFormat("LemLib"));
        const state = deserializeToState(legacy, "old");

        expect(state.format).toBe("LemLib");
        expectValidFileFormat(state);
    });

    it.each(FORMATS)("round trips a %s file without losing anything", format => {
        const before = seedFileFormat({
            format,
            field: "pushback-v5-skills",
            robot: { ...defaultRobotConstants, width: 13.5, speed: 5.5 },
            path: { name: "p", segments: everyKindSegments(format) },
        });

        const after = deserializeToState(serializeFile(before), "p");

        expect(after.format).toBe(before.format);
        expect(after.field).toBe(before.field);
        expect(after.robot).toEqual(before.robot);
        expect(after.path.segments.map(s => s.kind)).toEqual(before.path.segments.map(s => s.kind));
        expect(after.path.segments.map(s => s.pose)).toEqual(before.path.segments.map(s => s.pose));
        expect(after.path.segments.map(s => s.turnPose)).toEqual(before.path.segments.map(s => s.turnPose));
        expect(after.path.segments.map(s => s.turnLocked)).toEqual(before.path.segments.map(s => s.turnLocked));
        expect(after.path.segments.map(s => s.constants)).toEqual(before.path.segments.map(s => s.constants));
        expectValidFileFormat(after);
    });
});

describe("turnPose migration", () => {
    /** A file written before turnPose existed, when the offset lived on a point turn's pose.angle. */
    const legacy = (kind: string, angle: number) => seedFileFormat({
        format: "mikLib",
        path: {
            segments: [
                segment({ id: "start", kind: "start", pose: { x: 0, y: 0, angle: 0 }, turnPose: undefined }),
                segment({ id: "t", kind, pose: { x: null, y: null, angle }, turnPose: undefined }),
                segment({ id: "d", kind: "poseDrive", pose: { x: 24, y: 48, angle: 90 }, turnPose: undefined }),
            ],
        },
    }).path.segments[1];

    it.each(["pointTurn", "pointSwing"])("moves a %s offset onto turnPose and clears the pose", kind => {
        const seg = legacy(kind, 180);

        expect(seg.turnPose.angle).toBe(180);
        expect(seg.pose.angle).toBeNull();
        // x/y stay null so the turn keeps resolving to the waypoint it always did, not to a
        // coordinate the file never stored
        expect(seg.turnPose.x).toBeNull();
        expect(seg.turnPose.y).toBeNull();
        expect(seg.turnLocked).toBe(false);
    });

    it("leaves a heading turn's angle alone", () => {
        const seg = legacy("angleTurn", 135);

        expect(seg.pose.angle).toBe(135);
        expect(seg.turnPose.angle).toBe(0);
    });

    it("is idempotent, so a re-save does not clear an already migrated offset", () => {
        const once = seedFileFormat({
            format: "mikLib",
            path: { segments: [segment({ kind: "start" }), segment({ id: "t", kind: "pointTurn", pose: { x: null, y: null, angle: 180 }, turnPose: undefined })] },
        });
        const twice = deserializeToState(serializeFile(once), "p");

        expect(twice.path.segments[1].turnPose.angle).toBe(180);
        expect(twice.path.segments[1].pose.angle).toBeNull();
    });
});

/** The old mikConstants shape, before poseDrive gained its translational entry. */
const oldDrive = {
    max_voltage: 12, min_voltage: 0, kp: 1.5, ki: 0, kd: 10, starti: 0,
    exit_error: 0, settle_error: 2, settle_time: 200, timeout: 5000,
    slew: 2, drift: 2, lead: 0.5,
    turn_direction: "fastest", drive_direction: "fastest", swing_direction: "left",
    opposite_voltage: 0,
};
const oldHeading = { ...oldDrive, kp: 0.4, kd: 1, settle_error: 1, timeout: 3000, slew: 0, drift: 0, lead: 0 };

/**
 * A trimmed copy of the file that crashed: old version header, stale defaults, stale robot keys.
 * Saved under "Holonomic", the key the format carried before it became "mikLib Holonomic".
 */
const staleFile = "mikGen v1.0.0\n" + JSON.stringify({
    format: "Holonomic",
    field: "pushback-vexu-match",
    formatDef: {
        constants: [oldDrive],
        kMaxSpeed: 12,
        formatPathName: "Holonomic Path",
        segments: { poseDrive: { name: "Holonomic to Pose", defaults: [oldDrive, oldHeading] } },
    },
    path: {
        name: "",
        segments: [
            segment({ id: "s1", format: "Holonomic", kind: "start", pose: { x: -47, y: -15.5, angle: 90 }, constants: [oldDrive] }),
            segment({ id: "s2", format: "Holonomic", kind: "poseDrive", pose: { x: -47.5, y: -47, angle: 90 }, constants: [oldDrive, oldHeading] }),
        ],
    },
    robot: {
        width: 13.5, height: 15, speed: 6, lateralTau: 0.2, angularTau: 0.1,
        cogOffsetX: 0, cogOffsetY: 0,
        expansionFront: 0, expansionLeft: 0, expansionRight: 0, expansionRear: 0,
        isOmni: false,
    },
});

describe("loading a file saved before poseDrive grew translational constants", () => {
    it("fills the missing constants entry on segments and defaults", () => {
        const state = deserializeToState(staleFile, "Push-Back-AWP");

        // The file's holonomic_to_pose was saved as poseDrive, which now means the tank drive
        const pose = state.path.segments.find(s => s.kind === "poseDrive2")!;
        expect(pose.constants).toHaveLength(3);
        expect((pose.constants[2] as { kp: number }).kp).toBeDefined();
        expect((pose.constants[0] as { kp: number }).kp).toBe(1.5);
        expect(state.formatDef.segments.poseDrive2!.defaults!).toHaveLength(3);
    });

    it("keeps the saved robot values and fills the missing keys", () => {
        const state = deserializeToState(staleFile, "Push-Back-AWP");

        expect(state.robot.width).toBe(13.5);
        expect(state.robot.height).toBe(15);
        expect(state.robot.trackwidth).toBe(12);
        expect(state.robot.holonomicRobot).toBe(false);
        expect(state.robot.latencyDisabled).toBe(true);
    });

    it("flags the file as repaired so the user is told to re-save", () => {
        const repairs: string[] = [];
        deserializeToState(staleFile, "Push-Back-AWP", repairs);

        expect(repairs.length).toBeGreaterThan(0);
    });

    it("simulates the loaded path without crashing", async () => {
        const { convertPathToSim } = await import("../simulation/Conversion");
        const { precomputePath } = await import("./ComputePathSim");
        const { Robot } = await import("./Robot");

        const state = deserializeToState(staleFile, "Push-Back-AWP");
        const robot = new Robot({ ...defaultRobotConstants, width: 13.5, height: 15, holonomicRobot: true });

        const sim = precomputePath(robot, convertPathToSim(state.formatDef, state.path));
        expect(sim.totalTime).toBeGreaterThan(0);
        expect(sim.trajectory.length).toBeGreaterThan(0);
        expect(Number.isFinite(sim.trajectory[sim.trajectory.length - 1].x)).toBe(true);
    });
});

describe("loading a file saved under the old \"Holonomic\" format key", () => {
    it("opens on mikLib Holonomic rather than falling back to the default format", () => {
        const state = deserializeToState(staleFile, "Push-Back-AWP");

        expect(state.format).toBe("mikLib Holonomic");
        expect(state.formatDef.segments.strafeDrive!.defaults).toBeDefined();
        expectValidFileFormat(state, "legacy Holonomic file");
    });

    it("moves its saved poseDrive motions onto poseDrive2, where holonomic_to_pose lives now", () => {
        const state = deserializeToState(staleFile, "Push-Back-AWP");

        expect(state.path.segments.map(s => s.kind)).toEqual(["start", "poseDrive2"]);
        expect(state.formatDef.segments.poseDrive2!.name).toBe("Holonomic to Pose");
        // The saved def's poseDrive edits moved with it, leaving the tank drive on the registry's
        expect(state.formatDef.segments.poseDrive!.name).toBe("Drive to Pose");
        expect(state.formatDef.segments.poseDrive!.defaults).toHaveLength(2);
    });

    it("does not report the rename as a repair", () => {
        const repairs: string[] = [];
        deserializeToState(staleFile, "Push-Back-AWP", repairs);

        expect(repairs.some(r => r.includes("format"))).toBe(false);
    });

    it("renames the stale path name the old key auto-assigned", () => {
        const state = seedFileFormat({ format: "Holonomic", path: { name: "Holonomic Path", segments: [] } });

        expect(state.path.name).toBe("mikLib Holonomic Path");
        expect(state.formatDef.formatPathName).toBe("mikLib Holonomic Path");
    });

    it("leaves a path name the user chose alone", () => {
        const state = seedFileFormat({ format: "Holonomic", path: { name: "Left-Side-AWP", segments: [] } });

        expect(state.path.name).toBe("Left-Side-AWP");
    });

    it("takes the format's current name over the one the file saved", () => {
        const state = seedFileFormat({
            format: "Holonomic",
            formatDef: { formatPathName: "Holonomic Path" },
            path: { name: "", segments: [] },
        });

        expect(state.formatDef.formatPathName).toBe("mikLib Holonomic Path");
    });
});

describe("newFileFormat", () => {
    it.each(FORMATS)("produces a valid empty file for %s", format => {
        const state = newFileFormat(format, DEFAULT_FIELD_KEY as FieldType);

        expect(state.path.segments).toEqual([]);
        expectValidFileFormat(state);
    });
});
