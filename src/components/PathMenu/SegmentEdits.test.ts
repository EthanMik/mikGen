import { describe, expect, it } from "vitest";
import { FORMAT_REGISTRY, type Format, type FormatDef, type SegmentKind } from "../../simulation/FormatDefinition";
import { createSegment, type Segment } from "../../core/Types/Segment";
import { createControlPoint, type Pose } from "../../core/Types/Pose";
import type { Path } from "../../core/Types/Path";
import {
    buildDraggingIds, cycle, moveSegments, pressAction, selectSegment, setGroupDefaults,
    toggleSegmentVisibility, writeFields, writeGroup,
} from "./SegmentEdits";
import { buildSegmentView } from "./SegmentView";

const defOf = (format: Format) => FORMAT_REGISTRY[format] as FormatDef<Format>;

function segmentOf(format: Format, kind: SegmentKind, id: string, pose: Pose = { x: 1, y: 2, angle: 45 }): Segment {
    const seg = createSegment(defOf(format), format, kind, pose);
    return { ...seg, id, constants: seg.constants.map(c => ({ ...(c as object) })) as Segment["constants"] };
}

/** A start pose plus the kinds asked for, which is the shape every real path has. */
function pathOf(format: Format, kinds: SegmentKind[]): Path {
    return {
        name: "test",
        segments: [
            segmentOf(format, "start", "start", { x: 0, y: 0, angle: 0 }),
            ...kinds.map((kind, i) => segmentOf(format, kind, `s${i}`, { x: 10 + i * 10, y: 10, angle: 0 })),
        ],
    };
}

const groupOf = (path: Path, id: string, header: string) => {
    const segment = path.segments.find(s => s.id === id)!;
    return buildSegmentView(defOf(segment.format), segment).groups.find(g => g.header === header)!;
};

const constantsOf = (path: Path, id: string, idx = 0) =>
    path.segments.find(s => s.id === id)!.constants[idx] as unknown as Record<string, unknown>;

describe("selectSegment", () => {
    const withSelection = (path: Path, ids: string[]): Path => ({
        ...path,
        segments: path.segments.map(s => ({ ...s, selected: ids.includes(s.id) })),
    });

    it("exclusive selects one row and clears the rest", () => {
        const path = withSelection(pathOf("mikLib", ["pointDrive", "pointDrive"]), ["s0"]);
        const next = selectSegment(path, "s1", "exclusive");

        expect(next.segments.map(s => s.selected)).toEqual([false, false, true]);
    });

    it("exclusive also hands the selection back from the controls", () => {
        const path = pathOf("mikLib", ["bezierCurve"]);
        path.segments[1].controls = [createControlPoint(1, 1)];
        path.segments[1].controls[0].selected = true;

        const next = selectSegment(path, "s0", "exclusive");
        expect(next.segments[1].controls[0].selected).toBe(false);
    });

    it("toggle flips only its own row and leaves controls alone", () => {
        const path = pathOf("mikLib", ["bezierCurve", "pointDrive"]);
        path.segments[1].controls = [createControlPoint(1, 1)];
        path.segments[1].controls[0].selected = true;
        const selected = withSelection(path, ["s1"]);

        const next = selectSegment(selected, "s0", "toggle");
        expect(next.segments.map(s => s.selected)).toEqual([false, true, true]);
        expect(next.segments[1].controls[0].selected).toBe(true);

        expect(selectSegment(next, "s0", "toggle").segments.map(s => s.selected)).toEqual([false, false, true]);
    });

    it("range runs from the row selected last to the one clicked", () => {
        const path = withSelection(pathOf("mikLib", ["pointDrive", "pointDrive", "pointDrive"]), ["s0"]);

        expect(selectSegment(path, "s2", "range").segments.map(s => s.selected)).toEqual([false, true, true, true]);
        // Clicking above the anchor selects upwards just the same
        const anchoredLast = withSelection(path, ["s2"]);
        expect(selectSegment(anchoredLast, "s0", "range").segments.map(s => s.selected)).toEqual([false, true, true, true]);
    });

    it("range with nothing selected picks only the clicked row", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive"]);
        expect(selectSegment(path, "s1", "range").segments.map(s => s.selected)).toEqual([false, false, true]);
    });

    it("leaves the path alone for an id it does not have", () => {
        const path = pathOf("mikLib", ["pointDrive"]);
        expect(selectSegment(path, "nope", "range")).toBe(path);
    });
});

describe("toggleSegmentVisibility", () => {
    it("hides the row and the whole selection while anything is still visible", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive", "pointDrive"]);
        path.segments[1].selected = true;
        path.segments[2].visible = false;
        path.segments[2].selected = true;

        const next = toggleSegmentVisibility(path, "s0");
        expect(next.segments.map(s => s.visible)).toEqual([true, false, false, true]);
    });

    it("brings them all back once every affected row is hidden", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive"]);
        path.segments[1].visible = false;
        path.segments[1].selected = true;
        path.segments[2].visible = false;
        path.segments[2].selected = true;

        expect(toggleSegmentVisibility(path, "s0").segments.map(s => s.visible)).toEqual([true, true, true]);
    });

    it("moves an unselected row on its own and leaves the selection alone", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive"]);
        path.segments[2].selected = true;

        const next = toggleSegmentVisibility(path, "s0");
        expect(next.segments.map(s => s.visible)).toEqual([true, false, true]);
    });

    it("shows an unselected hidden row back on its own", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive"]);
        path.segments[1].visible = false;
        path.segments[2].visible = false;
        path.segments[2].selected = true;

        expect(toggleSegmentVisibility(path, "s0").segments.map(s => s.visible)).toEqual([true, true, false]);
    });

    it("touches nothing for an unknown row with no selection", () => {
        const path = pathOf("mikLib", ["pointDrive"]);
        expect(toggleSegmentVisibility(path, "nope")).toBe(path);
    });

    it("touches nothing for an unknown row while rows are selected", () => {
        const path = pathOf("mikLib", ["pointDrive"]);
        path.segments[1].selected = true;
        expect(toggleSegmentVisibility(path, "nope")).toBe(path);
    });
});

describe("writeFields and writeGroup", () => {
    it("writes a constants key into the entry its group names", () => {
        const path = pathOf("mikLib", ["poseDrive"]);
        const heading = groupOf(path, "s0", "Heading Constants");

        const next = writeGroup(path, { segmentId: "s0" }, heading, { kp: 3.5 });
        expect(constantsOf(next, "s0", 1).kp).toBe(3.5);
        expect(constantsOf(next, "s0", 0).kp).toBe(constantsOf(path, "s0", 0).kp);
    });

    it("writes a segment-backed key onto the segment", () => {
        const path = pathOf("mikLib", ["wait"]);
        const wait = groupOf(path, "s0", "Wait Settings");

        const next = writeGroup(path, { segmentId: "s0" }, wait, { time: 750 });
        expect(next.segments[1].time).toBe(750);
        expect(constantsOf(next, "s0", 0).time).toBeUndefined();
    });

    it("leaves every other row alone", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive"]);
        const group = groupOf(path, "s0", "Drive Constants");

        const next = writeGroup(path, { segmentId: "s0" }, group, { kp: 7 });
        expect(constantsOf(next, "s1", 0).kp).not.toBe(7);
        expect(next.segments[2]).toBe(path.segments[2]);
    });

    it("applies to every row of a kind and no other kind", () => {
        const path = pathOf("mikLib", ["pointDrive", "pointDrive", "angleTurn"]);
        const group = groupOf(path, "s0", "Drive Constants");

        const next = writeGroup(path, { kind: "pointDrive" }, group, { kp: 7 });
        expect(constantsOf(next, "s0", 0).kp).toBe(7);
        expect(constantsOf(next, "s1", 0).kp).toBe(7);
        expect(constantsOf(next, "s2", 0).kp).not.toBe(7);
    });

    it("ignores keys the group does not declare, and no-ops when nothing is left", () => {
        const path = pathOf("mikLib", ["pointDrive"]);
        const exit = groupOf(path, "s0", "Exit Conditions");

        const next = writeGroup(path, { segmentId: "s0" }, exit, { kp: 7, settle_time: 400 });
        expect(constantsOf(next, "s0", 0).settle_time).toBe(400);
        expect(constantsOf(next, "s0", 0).kp).toBe(constantsOf(path, "s0", 0).kp);
        expect(writeGroup(path, { segmentId: "s0" }, exit, { kp: 7 })).toBe(path);
        expect(writeFields(path, { segmentId: "s0" }, [])).toBe(path);
    });
});

describe("setGroupDefaults", () => {
    it("stores the group's constants on the kind the format implements", () => {
        const formatDef = defOf("mikLib");
        const path = pathOf("mikLib", ["poseDrive"]);
        const heading = groupOf(path, "s0", "Heading Constants");

        const next = setGroupDefaults(formatDef, "poseDrive", heading, { kp: 4.25 });
        const defaults = next.segments.poseDrive!.defaults!;
        expect((defaults[1] as unknown as Record<string, unknown>).kp).toBe(4.25);
        // The entry the group did not name, and the registry itself, stay put
        expect(defaults[0]).toBe(formatDef.segments.poseDrive!.defaults![0]);
        expect((formatDef.segments.poseDrive!.defaults![1] as unknown as Record<string, unknown>).kp).not.toBe(4.25);
    });

    it("follows castTo so an alias never grows defaults of its own", () => {
        const formatDef = defOf("LemLib");
        const path: Path = { name: "t", segments: [segmentOf("LemLib", "start", "start"), segmentOf("LemLib", "bezierCurve", "s0")] };
        const group = groupOf(path, "s0", "Angular Settings");

        const next = setGroupDefaults(formatDef, "bezierCurve", group, { kp: 5 });
        expect((next.segments.pointDrive!.defaults![1] as unknown as Record<string, unknown>).kp).toBe(5);
        expect(next.segments.bezierCurve!.defaults).toBeUndefined();
    });

    it("does nothing for a group formatDef has nowhere to keep", () => {
        const formatDef = defOf("mikLib");
        const path = pathOf("mikLib", ["wait"]);
        const wait = groupOf(path, "s0", "Wait Settings");

        expect(setGroupDefaults(formatDef, "wait", wait, { time: 999 })).toBe(formatDef);
    });
});

describe("cycle", () => {
    it("writes the raw value the generated code will carry", () => {
        const path = pathOf("mikLib", ["angleTurn"]);
        const button = buildSegmentView(defOf("mikLib"), path.segments[1]).cycleButtons[0];

        const next = cycle(path, "s0", button, "ccw");
        expect(constantsOf(next, "s0", 0).turn_direction).toBe("ccw");
    });

    it("moves the turnPose for a turnPose-backed button without touching constants", () => {
        const path = pathOf("mikLib", ["pointTurn"]);
        const button = buildSegmentView(defOf("mikLib"), path.segments[1]).cycleButtons
            .find(b => b.label === "angle_offset")!;

        const next = cycle(path, "s0", button, "180");
        expect(next.segments[1].turnPose.angle).toBe(180);
        expect(next.segments[1].pose).toBe(path.segments[1].pose);
        expect(next.segments[1].constants).toBe(path.segments[1].constants);
    });

    it("carries a turnPose effect alongside the constants write", () => {
        const path = pathOf("LemLib", ["pointTurn"]);
        const button = buildSegmentView(defOf("LemLib"), path.segments[1]).cycleButtons
            .find(b => b.label === "forwards")!;

        const next = cycle(path, "s0", button, "false");
        expect(constantsOf(next, "s0", 0).forwards).toBe(false);
        expect(next.segments[1].turnPose.angle).toBe(180);
    });

    it("ignores a value the button does not offer", () => {
        const path = pathOf("mikLib", ["angleTurn"]);
        const button = buildSegmentView(defOf("mikLib"), path.segments[1]).cycleButtons[0];

        expect(cycle(path, "s0", button, "sideways")).toBe(path);
        expect(cycle(path, "s0", button, null)).toBe(path);
    });
});

describe("pressAction", () => {
    it("applies the patch the action returns", () => {
        const path = pathOf("mikLib", ["bezierCurve"]);
        const action = buildSegmentView(defOf("mikLib"), path.segments[1]).actions[0].def;

        const next = pressAction(path, "s0", action);
        expect(next.segments[1].controls).toHaveLength(1);
        expect(pressAction(next, "s0", action).segments[1].controls).toHaveLength(2);
    });

    it("freezes a point turn's resolved target on the first press and releases it on the second", () => {
        // A real point turn has no position of its own, so it tracks the drive after it
        const path = pathOf("mikLib", ["pointTurn", "poseDrive"]);
        path.segments[1] = { ...path.segments[1], pose: { x: null, y: null, angle: null } };
        const lock = buildSegmentView(defOf("mikLib"), path.segments[1]).actions
            .find(a => a.label === "Lock Turn Target")!.def;

        const locked = pressAction(path, "s0", lock);
        expect(locked.segments[1].turnLocked).toBe(true);
        expect(locked.segments[1].turnPose).toMatchObject({ x: 20, y: 10 });

        // Unlocking leaves the coordinate behind, so pressing again lands in the same place
        const unlocked = pressAction(locked, "s0", lock);
        expect(unlocked.segments[1].turnLocked).toBe(false);
        expect(unlocked.segments[1].turnPose).toEqual(locked.segments[1].turnPose);
    });

    it("returns the same path when the action declines", () => {
        const path = pathOf("mikLib", ["bezierCurve"]);
        const action = buildSegmentView(defOf("mikLib"), path.segments[1]).actions[0].def;
        const full = pressAction(pressAction(path, "s0", action), "s0", action);

        expect(pressAction(full, "s0", action)).toBe(full);
        expect(pressAction(path, "nope", action)).toBe(path);
    });
});

describe("reorder", () => {
    const ids = (path: Path) => path.segments.map(s => s.id);
    const fourRows = () => pathOf("mikLib", ["pointDrive", "pointDrive", "pointDrive"]);

    it("drags the whole selection when the row grabbed is part of it", () => {
        const path = fourRows();
        path.segments[1].selected = true;
        path.segments[2].selected = true;

        expect(buildDraggingIds(path.segments, "s0")).toEqual(["s0", "s1"]);
        expect(buildDraggingIds(path.segments, "s2")).toEqual(["s2"]);
    });

    it("never carries the start pose, even when it is selected", () => {
        const path = fourRows();
        path.segments[0].selected = true;
        path.segments[1].selected = true;

        expect(buildDraggingIds(path.segments, "s0")).toEqual(["s0"]);
    });

    it("moves a row down and up, accounting for the gap it leaves", () => {
        const path = fourRows();
        expect(ids(moveSegments(path, ["s0"], 3))).toEqual(["start", "s1", "s0", "s2"]);
        expect(ids(moveSegments(path, ["s2"], 1))).toEqual(["start", "s2", "s0", "s1"]);
    });

    it("keeps the relative order of a multi-row drag", () => {
        const path = fourRows();
        // Dropping before s1 lands both rows there, one slot up because s0 came from above it
        expect(ids(moveSegments(path, ["s0", "s2"], 2))).toEqual(["start", "s0", "s2", "s1"]);
        expect(ids(moveSegments(path, ["s0", "s1"], 4))).toEqual(["start", "s2", "s0", "s1"]);
    });

    it("refuses the start pose and unknown ids", () => {
        const path = fourRows();

        expect(moveSegments(path, ["start"], 2)).toBe(path);
        expect(moveSegments(path, ["nope"], 1)).toBe(path);
        expect(moveSegments(path, [], 1)).toBe(path);
    });

    it("never inserts above the start pose", () => {
        const path = fourRows();
        expect(ids(moveSegments(path, ["s2"], 0))).toEqual(["start", "s2", "s0", "s1"]);
    });

    it("returns the same path when the rows land where they started", () => {
        const path = fourRows();
        expect(moveSegments(path, ["s0"], 1)).toBe(path);
        expect(moveSegments(path, ["s0"], 2)).toBe(path);
        expect(moveSegments(path, ["s0", "s1"], 1)).toBe(path);
        expect(moveSegments(path, ["s1"], 2)).toBe(path);
    });
});
