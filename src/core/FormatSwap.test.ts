import { beforeEach, describe, expect, it, vi } from "vitest";

// The store module reads localStorage as it loads, and node has none
const storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
});
vi.stubGlobal("alert", () => { });

import { changeFormat, fileFormatStore } from "../hooks/useFileFormat";
import { seedFileFormat } from "./FileSchema";
import { FORMATS, everyKindSegments, expectValidFileFormat } from "./FileSchema.fixtures";
import { FORMAT_REGISTRY, type Format, type FormatDef } from "../simulation/FormatDefinition";
import { convertPathToSim } from "../simulation/Conversion";
import { precomputePath } from "./ComputePathSim";
import { Robot, defaultRobotConstants } from "./Robot";

/** A path holding one segment of every kind the format defines, tuned away from the defaults. */
function loadEveryKind(format: Format, name = "My Auton") {
    const state = seedFileFormat({ format, path: { name, segments: everyKindSegments(format) } });
    const tuned = {
        ...state,
        path: {
            ...state.path,
            segments: state.path.segments.map(s => ({
                ...s,
                constants: s.constants.map(c => ({ ...c, kp: 99 })) as typeof s.constants,
            })),
        },
    };
    fileFormatStore.setState(tuned);
    return tuned;
}

const simulate = () => {
    const state = fileFormatStore.getState();
    const robot = new Robot({ ...defaultRobotConstants, holonomicRobot: state.format === "mikLib Holonomic" });
    return precomputePath(robot, convertPathToSim(state.formatDef, state.path));
};

beforeEach(() => fileFormatStore.setState(seedFileFormat(undefined)));

describe("changeFormat", () => {
    // Every ordered pair, because the crashes live in the kinds one format has and another aliases
    const pairs = FORMATS.flatMap(from => FORMATS.map(to => [from, to] as const));

    it.each(pairs)("swaps %s to %s without leaving a hole", (from, to) => {
        loadEveryKind(from);
        changeFormat(to);

        const state = fileFormatStore.getState();
        expect(state.format).toBe(to);
        expect(state.formatDef).toBe(FORMAT_REGISTRY[to]);
        expectValidFileFormat(state, `${from} -> ${to}`);
    });

    it.each(pairs)("still simulates after swapping %s to %s", (from, to) => {
        loadEveryKind(from);
        changeFormat(to);

        const sim = simulate();
        expect(sim.trajectory.length).toBeGreaterThan(0);
        expect(sim.trajectory.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    });

    it("keeps the file name, which the export markers are keyed to", () => {
        loadEveryKind("mikLib", "Left-Side-AWP");
        changeFormat("LemLib");

        expect(fileFormatStore.getState().path.name).toBe("Left-Side-AWP");
    });

    it("falls back to the format's name only when the path has none", () => {
        loadEveryKind("mikLib", "");
        changeFormat("LemLib");

        expect(fileFormatStore.getState().path.name).toBe(FORMAT_REGISTRY["LemLib"].formatPathName);
    });

    it("preserves poses and controls across a round trip", () => {
        const before = loadEveryKind("mikLib");
        changeFormat("LemLib");
        changeFormat("mikLib");
        const after = fileFormatStore.getState();

        expect(after.path.segments.length).toBe(before.path.segments.length);
        expect(after.path.segments.map(s => s.pose)).toEqual(before.path.segments.map(s => s.pose));
        expect(after.path.segments.map(s => s.turnPose)).toEqual(before.path.segments.map(s => s.turnPose));
        expect(after.path.segments.map(s => s.turnLocked)).toEqual(before.path.segments.map(s => s.turnLocked));
        expect(after.path.segments.map(s => s.controls)).toEqual(before.path.segments.map(s => s.controls));
        expect(after.path.segments.map(s => s.id)).toEqual(before.path.segments.map(s => s.id));
    });

    it("bakes a point swing's resolved heading in when the format only has heading turns", () => {
        // A start at the origin then a swing aimed at (0, 24) is due +Y, so 0 degrees
        fileFormatStore.setState(seedFileFormat({
            format: "mikLib",
            path: {
                segments: [
                    { id: "start", kind: "start", pose: { x: 0, y: 0, angle: 90 } },
                    { id: "sw", kind: "pointSwing", pose: { x: null, y: null, angle: null }, turnPose: { x: 0, y: 24, angle: 0 } },
                ],
            },
        }));

        // JAR has no swing-to-point, so pointSwing casts to angleSwing, which reads pose.angle
        changeFormat("JAR-Template");
        const swung = fileFormatStore.getState().path.segments[1];

        expect(swung.kind).toBe("angleSwing");
        expect(swung.pose.angle).toBe(0);
    });

    it("reseeds constants, which is the documented cost of swapping", () => {
        loadEveryKind("mikLib");
        changeFormat("LemLib");

        for (const seg of fileFormatStore.getState().path.segments) {
            for (const entry of seg.constants) expect((entry as { kp?: number }).kp).not.toBe(99);
        }
    });

    // The reachable crash before this refactor: alias entries carry no defaults of their own
    it("casts LemLib's alias kinds to real constants instead of undefined", () => {
        loadEveryKind("mikLib");
        changeFormat("LemLib");

        const state = fileFormatStore.getState();
        const lemLib = FORMAT_REGISTRY["LemLib"] as FormatDef<Format>;
        expect(state.path.segments.some(s => s.kind === "pointDrive")).toBe(true);
        for (const seg of state.path.segments) {
            expect(seg.constants, seg.kind).toBeDefined();
            expect(lemLib.segments[seg.kind]?.defaults, `${seg.kind} resolved to an alias`).toBeDefined();
        }
    });

    it("survives the mikLib Holonomic drivetrain toggle on a path full of tank motions", () => {
        loadEveryKind("mikLib");
        changeFormat("mikLib Holonomic");
        expectValidFileFormat(fileFormatStore.getState(), "to mikLib Holonomic");

        changeFormat("mikLib");
        expectValidFileFormat(fileFormatStore.getState(), "back to mikLib");
    });

    it("never lets format and formatDef disagree", () => {
        for (const format of FORMATS) {
            changeFormat(format);
            const state = fileFormatStore.getState();
            expect(state.formatDef).toBe(FORMAT_REGISTRY[state.format]);
        }
    });
});
