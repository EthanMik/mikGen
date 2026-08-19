import { describe, expect, it } from "vitest";
import {
    FORMAT_REGISTRY, type Format, type FormatDef, type SegmentKind,
} from "../../simulation/FormatDefinition";
import { createSegment, type Segment } from "../../core/Types/Segment";
import type { Pose } from "../../core/Types/Pose";
import {
    buildSegmentView, fieldSource, readField, sliderPercent, sliderStep, sliderValueAt,
} from "./SegmentView";

const FORMATS = Object.keys(FORMAT_REGISTRY) as Format[];
const defOf = (format: Format) => FORMAT_REGISTRY[format] as FormatDef<Format>;

/** Constants come out of the registry by reference, so every fixture takes its own copy. */
function segmentOf(format: Format, kind: SegmentKind, pose: Pose = { x: 1, y: 2, angle: 45 }, turnPose?: Pose): Segment {
    const seg = createSegment(defOf(format), format, kind, pose);
    return {
        ...seg,
        ...(turnPose ? { turnPose } : {}),
        constants: seg.constants.map(c => ({ ...(c as object) })) as Segment["constants"],
    };
}

const kindsOf = (format: Format) => Object.keys(defOf(format).segments) as SegmentKind[];

describe("buildSegmentView across every format", () => {
    it("shows exactly what the format declares", () => {
        for (const format of FORMATS) {
            const formatDef = defOf(format);
            for (const kind of kindsOf(format)) {
                if (formatDef.segments[kind]?.castTo) continue;
                const segDef = formatDef.segments[kind]!;
                const view = buildSegmentView(formatDef, segmentOf(format, kind));
                const at = `${format}/${kind}`;

                expect(view.name, at).toBe(segDef.name ?? "");
                expect(view.kind, at).toBe(kind);
                expect(view.groups.map(g => g.header), at).toEqual((segDef.numberInputs ?? []).map(g => g.headerName));
                expect(view.cycleButtons.map(c => c.label), at).toEqual((segDef.cycleButtons ?? []).map(b => String(b.key)));
                expect(view.actions.map(a => a.def), at).toEqual(segDef.actionButtons ?? []);
                expect(view.actions.map(a => a.label), at).toEqual((segDef.actionButtons ?? []).map(a => a.label));
                // A state-dependent icon is resolved here, never by the row
                for (const action of view.actions) expect(typeof action.srcImg, at).toBe("string");
                expect(view.slider === null, at).toBe(segDef.slider === undefined);
            }
        }
    });

    it("never indexes past the constants a segment carries", () => {
        for (const format of FORMATS) {
            for (const kind of kindsOf(format)) {
                const segment = segmentOf(format, kind);
                const view = buildSegmentView(defOf(format), segment);
                for (const group of view.groups) {
                    expect(segment.constants[group.constantsIdx], `${format}/${kind} ${group.header}`).toBeDefined();
                    for (const field of group.fields) {
                        expect(field.value, `${format}/${kind} ${group.header}.${field.key}`).toBeDefined();
                    }
                }
            }
        }
    });

    it("reads every field from the entry its group names", () => {
        const segment = segmentOf("mikLib", "poseDrive");
        segment.constants[1] = { ...(segment.constants[1] as object), kp: 9.5 } as never;
        const view = buildSegmentView(defOf("mikLib"), segment);

        const heading = view.groups.find(g => g.header === "Heading Constants")!;
        const drive = view.groups.find(g => g.header === "Drive Constants")!;
        expect(heading.constantsIdx).toBe(1);
        expect(heading.fields.find(f => f.key === "kp")!.value).toBe(9.5);
        expect(drive.fields.find(f => f.key === "kp")!.value).not.toBe(9.5);
    });

    it("keeps defaults on the format, not on the segment being edited", () => {
        const formatDef = defOf("mikLib");
        const segment = segmentOf("mikLib", "pointDrive");
        const before = buildSegmentView(formatDef, segment).groups[1].fields.find(f => f.key === "kp")!;

        segment.constants[0] = { ...(segment.constants[0] as object), kp: 99 } as never;
        const after = buildSegmentView(formatDef, segment).groups[1].fields.find(f => f.key === "kp")!;

        expect(after.value).toBe(99);
        expect(after.defaultValue).toBe(before.defaultValue);
        expect(after.defaultValue).not.toBe(99);
    });
});

describe("fields the segment stores itself", () => {
    it("routes a wait's time to the segment and defaults it to zero", () => {
        const segment = { ...segmentOf("mikLib", "wait"), time: 250 };
        const view = buildSegmentView(defOf("mikLib"), segment);
        const time = view.groups[0].fields[0];

        expect(time.key).toBe("time");
        expect(time.source).toEqual({ on: "segment", key: "time" });
        expect(time.value).toBe(250);
        // The bug this replaces compared time against itself, so Reset could never light up
        expect(time.defaultValue).toBe(0);
        expect(view.groups[0].canSetDefault).toBe(false);
    });

    it("lets a constants entry shadow a segment key of the same name", () => {
        const segment = segmentOf("mikLib", "wait");
        segment.constants[0] = { ...(segment.constants[0] as object), time: 42 } as never;

        expect(fieldSource(segment, 0, "time")).toEqual({ on: "constants", idx: 0, key: "time" });
        expect(readField(segment, fieldSource(segment, 0, "time"))).toBe(42);
    });

    it("treats a key that is neither as a constant, and reads undefined", () => {
        const segment = segmentOf("mikLib", "wait");
        const source = fieldSource(segment, 0, "not_a_key");

        expect(source).toEqual({ on: "constants", idx: 0, key: "not_a_key" });
        expect(readField(segment, source)).toBeUndefined();
    });
});

describe("alias kinds", () => {
    it("borrows the controls of the kind it casts to, keeping its own name", () => {
        const formatDef = defOf("LemLib");
        const view = buildSegmentView(formatDef, segmentOf("LemLib", "bezierCurve"));
        const pointDrive = buildSegmentView(formatDef, segmentOf("LemLib", "pointDrive"));

        expect(view.kind).toBe("pointDrive");
        expect(view.name).toBe("Follow Path");
        expect(view.groups.map(g => g.header)).toEqual(pointDrive.groups.map(g => g.header));
        expect(view.slider).not.toBeNull();
    });

    it("falls back to the resolved kind's name when the alias has none", () => {
        const view = buildSegmentView(defOf("ReveilLib"), segmentOf("ReveilLib", "pointSwing"));

        expect(view.kind).toBe("pointTurn");
        expect(view.name).toBe("Look At");
    });
});

describe("kinds with nothing to configure", () => {
    it("gives a start pose no groups and no slider", () => {
        for (const format of FORMATS) {
            const view = buildSegmentView(defOf(format), segmentOf(format, "start"));
            expect(view.groups, format).toEqual([]);
            expect(view.slider, format).toBeNull();
        }
    });

    it("survives a segment whose constants array came up short", () => {
        const segment = segmentOf("mikLib", "poseDrive");
        const short = { ...segment, constants: [segment.constants[0]] as Segment["constants"] };
        const view = buildSegmentView(defOf("mikLib"), short);

        expect(() => view.groups.map(g => g.fields.map(f => f.value))).not.toThrow();
        expect(view.groups.find(g => g.header === "Heading Constants")!.fields[0].value).toBeUndefined();
    });
});

describe("slider", () => {
    it("scales to the format's own range", () => {
        const mik = buildSegmentView(defOf("mikLib"), segmentOf("mikLib", "poseDrive")).slider!;
        const lem = buildSegmentView(defOf("LemLib"), segmentOf("LemLib", "poseDrive")).slider!;
        const rev = buildSegmentView(defOf("ReveilLib"), segmentOf("ReveilLib", "poseDrive")).slider!;

        expect([mik.max, mik.decimals]).toEqual([12, 1]);
        expect([lem.max, lem.decimals]).toEqual([127, 0]);
        expect([rev.max, rev.decimals]).toEqual([1, 2]);
    });

    it("maps value and percent both ways", () => {
        const slider = buildSegmentView(defOf("mikLib"), segmentOf("mikLib", "poseDrive")).slider!;

        expect(slider.value).toBe(8);
        expect(sliderPercent(slider)).toBeCloseTo((8 / 12) * 100, 10);
        expect(sliderStep(slider)).toBeCloseTo((0.1 / 12) * 100, 10);
        expect(sliderValueAt(slider, 0)).toBe(0);
        expect(sliderValueAt(slider, 100)).toBe(12);
    });

    it("snaps to the declared increment instead of leaking float noise", () => {
        const slider = buildSegmentView(defOf("mikLib"), segmentOf("mikLib", "poseDrive")).slider!;
        const step = sliderStep(slider)!;

        // The raw percent round trip lands on 1.3000000000000003
        expect(sliderValueAt(slider, step * 13)).toBe(1.3);
        for (let i = 0; i <= 120; i++) {
            const value = sliderValueAt(slider, step * i);
            expect(Number(value.toFixed(1)), `step ${i}`).toBe(value);
        }
    });

    it("clamps to the bounds the format declares", () => {
        const slider = buildSegmentView(defOf("LemLib"), segmentOf("LemLib", "pointTurn")).slider!;

        expect(sliderValueAt(slider, -20)).toBe(slider.min);
        expect(sliderValueAt(slider, 220)).toBe(slider.max);
    });

    it("follows a segment-backed key for a wait", () => {
        const slider = buildSegmentView(defOf("mikLib"), { ...segmentOf("mikLib", "wait"), time: 500 }).slider!;

        expect(slider.source).toEqual({ on: "segment", key: "time" });
        expect(slider.value).toBe(500);
        expect(sliderPercent(slider)).toBe(50);
    });
});

describe("cycle buttons", () => {
    it("reads a constants-backed button as the raw value the export writes", () => {
        const segment = segmentOf("mikLib", "angleTurn");
        segment.constants[0] = { ...(segment.constants[0] as object), turn_direction: "ccw" } as never;
        const button = buildSegmentView(defOf("mikLib"), segment).cycleButtons[0];

        expect(button.label).toBe("turn_direction");
        expect(button.value).toBe("ccw");
        expect(button.imageKeys.map(k => k.key)).toEqual(["cw", "ccw", "fastest"]);
    });

    it("reads a turnPose-backed button off the turnPose, not the pose", () => {
        const nullPose = { x: null, y: null, angle: null };
        const facing = buildSegmentView(defOf("mikLib"),
            segmentOf("mikLib", "pointTurn", nullPose, { x: 0, y: 0, angle: 180 }));
        const forward = buildSegmentView(defOf("mikLib"),
            segmentOf("mikLib", "pointTurn", nullPose, { x: 0, y: 0, angle: 0 }));

        expect(facing.cycleButtons.find(b => b.label === "angle_offset")!.value).toBe("180");
        expect(forward.cycleButtons.find(b => b.label === "angle_offset")!.value).toBe("0");
    });

    it("flips the lock icon with turnLocked", () => {
        const nullPose = { x: null, y: null, angle: null };
        const unlocked = segmentOf("mikLib", "pointTurn", nullPose);
        const locked = { ...unlocked, turnLocked: true };

        const iconOf = (seg: typeof unlocked) =>
            buildSegmentView(defOf("mikLib"), seg).actions.find(a => a.label === "Lock Turn Target")!.srcImg;

        expect(iconOf(unlocked)).not.toBe(iconOf(locked));
    });
});
