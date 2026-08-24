import { describe, expect, it } from "vitest";
import { FORMAT_REGISTRY, getDefaultConstants, mergeFormatDef, mergeSavedConstants, resolveKind, type Format, type FormatDef } from "./FormatDefinition";
import type { mikConstants } from "./mikLibSim/MikConstants";

const holonomicDef = FORMAT_REGISTRY["mikLib Holonomic"] as FormatDef<Format>;
const poseDefaults = holonomicDef.segments.poseDrive2!.defaults!;

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

describe("resolveKind", () => {
    // Alias entries carry only castTo, so asking them for constants directly used to yield undefined
    it("follows castTo to the kind that actually carries defaults", () => {
        const lemLibDef = FORMAT_REGISTRY["LemLib"] as FormatDef<Format>;
        expect(resolveKind(lemLibDef, "bezierCurve")).toBe("pointDrive");
        expect(resolveKind(lemLibDef, "strafeDrive")).toBe("pointDrive");
        expect(resolveKind(lemLibDef, "poseDrive")).toBe("poseDrive");
    });

    it("terminates on a castTo cycle a hand-edited file could introduce", () => {
        const cyclic = {
            ...holonomicDef,
            segments: {
                ...holonomicDef.segments,
                strafeDrive: { castTo: "bezierCurve" as const },
                bezierCurve: { castTo: "strafeDrive" as const },
            },
        } as FormatDef<Format>;
        expect(() => resolveKind(cyclic, "strafeDrive")).not.toThrow();
    });
});

describe("getDefaultConstants", () => {
    it("never returns undefined, whatever the format and kind", () => {
        for (const format of Object.keys(FORMAT_REGISTRY) as Format[]) {
            const def = FORMAT_REGISTRY[format] as FormatDef<Format>;
            for (const kind of Object.keys(def.segments) as (keyof typeof def.segments)[]) {
                const constants = getDefaultConstants(def, format, kind);
                expect(Array.isArray(constants), `${format}/${kind}`).toBe(true);
                expect(constants.length, `${format}/${kind}`).toBeGreaterThan(0);
            }
        }
    });

    it("falls back to the format constants for a kind it has never heard of", () => {
        const constants = getDefaultConstants(holonomicDef, "mikLib Holonomic", "teleport" as never);
        expect(Array.isArray(constants)).toBe(true);
    });
});

describe("mergeFormatDef", () => {
    it("pads stale saved defaults out to the registry shape", () => {
        const savedFile = {
            segments: {
                poseDrive2: { defaults: [{ ...poseDefaults[0], kp: 7 }, poseDefaults[1]] },
            },
        };
        const merged = mergeFormatDef(holonomicDef, savedFile);
        const defaults = merged.segments.poseDrive2!.defaults!;

        expect(defaults).toHaveLength(3);
        expect((defaults[0] as mikConstants).kp).toBe(7);
        expect((defaults[2] as mikConstants).kp).toBe((poseDefaults[2] as mikConstants).kp);
    });
});
