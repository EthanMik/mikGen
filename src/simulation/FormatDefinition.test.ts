import { describe, expect, it } from "vitest";
import { FORMAT_REGISTRY, mergeFormatDef, mergeSavedConstants, normalizePathConstants, type Format, type FormatDef } from "./FormatDefinition";
import type { Path } from "../core/Types/Path";
import type { Segment } from "../core/Types/Segment";
import type { mikConstants } from "./mikLibSim/MikConstants";

const holonomicDef = FORMAT_REGISTRY["Holonomic"] as FormatDef<Format>;
const poseDefaults = holonomicDef.segments.poseDrive!.defaults!;

function poseSegment(constants: unknown): Segment {
    return {
        id: "seg1",
        disabled: false,
        selected: false,
        locked: false,
        visible: true,
        pose: { x: 0, y: 0, angle: 0 },
        format: "Holonomic",
        kind: "poseDrive",
        constants: constants as Segment["constants"],
        distance: 0,
        time: 0,
        controls: [],
    };
}

describe("mergeSavedConstants", () => {
    it("pads a stale two-entry array out to the current three", () => {
        const saved = [{ ...poseDefaults[0], kp: 9 }, { ...poseDefaults[1] }];
        const merged = mergeSavedConstants(poseDefaults, saved)!;

        expect(merged).toHaveLength(3);
        expect((merged[0] as mikConstants).kp).toBe(9);
        expect((merged[2] as mikConstants).kp).toBe((poseDefaults[2] as mikConstants).kp);
    });

    it("fills keys an old entry never saved", () => {
        const saved = [{ kp: 9 }];
        const merged = mergeSavedConstants(poseDefaults, saved)!;

        expect((merged[0] as mikConstants).kp).toBe(9);
        expect((merged[0] as mikConstants).kd).toBe((poseDefaults[0] as mikConstants).kd);
    });

    it("returns the defaults for garbage input", () => {
        expect(mergeSavedConstants(poseDefaults, undefined)).toHaveLength(3);
        expect(mergeSavedConstants(poseDefaults, "nope")).toHaveLength(3);
    });
});

describe("normalizePathConstants", () => {
    it("repairs a loaded segment missing the translational constants", () => {
        const path: Path = { name: "p", segments: [poseSegment([poseDefaults[0], poseDefaults[1]])] };
        const fixed = normalizePathConstants(holonomicDef, "Holonomic", path);

        expect(fixed.segments[0].constants).toHaveLength(3);
        expect((fixed.segments[0].constants[2] as mikConstants).kp).toBeDefined();
    });
});

describe("mergeFormatDef", () => {
    it("pads stale saved defaults out to the registry shape", () => {
        const savedFile = {
            segments: {
                poseDrive: { defaults: [{ ...poseDefaults[0], kp: 7 }, poseDefaults[1]] },
            },
        };
        const merged = mergeFormatDef(holonomicDef, savedFile);
        const defaults = merged.segments.poseDrive!.defaults!;

        expect(defaults).toHaveLength(3);
        expect((defaults[0] as mikConstants).kp).toBe(7);
        expect((defaults[2] as mikConstants).kp).toBe((poseDefaults[2] as mikConstants).kp);
    });
});
