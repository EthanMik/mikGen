import { describe, expect, it, vi } from "vitest";

// Runs before every import: the store modules read localStorage as they load, and node has none
vi.hoisted(() => {
    (globalThis as { localStorage?: unknown }).localStorage ??= {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
        clear: () => { },
        key: () => null,
        length: 0,
    };
});

// Loaded first: FormatDefinition and useFileFormat import each other, and the registry only
// initializes when the cycle is entered from the useFileFormat side, as the app does
import "../hooks/useFileFormat";
import { defaultRobotConstants, Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";
import type { Coordinate } from "../core/Types/Coordinate";
import { createControlPoint } from "../core/Types/Pose";
import type { Segment } from "../core/Types/Segment";
import { applyTurnLocks, convertPathToSim, convertPathToString, convertStringToPath, templateToRegex } from "./Conversion";
import {
    FORMAT_REGISTRY,
    getDefaultConstants,
    type Format,
    type FormatDef,
    type SegmentDef,
    type SegmentKind,
} from "./FormatDefinition";
import { kMikDrive, mikLibDef, type mikConstants } from "./mikLibSim/MikConstants";

let nextId = 0;

/** A bare segment with cloned default constants, so tests can mutate them freely. */
function makeSeg(
    format: Format,
    kind: SegmentKind,
    pose: { x: number | null; y: number | null; angle: number | null },
    extra: Partial<Segment> = {},
): Segment {
    const defaults = getDefaultConstants(undefined, format, kind) ?? [kMikDrive];
    return {
        id: `seg-${nextId++}`,
        selected: false,
        disabled: false,
        visible: true,
        format,
        kind,
        pose,
        turnPose: { x: 0, y: 0, angle: 0 },
        turnLocked: false,
        constants: defaults.map(c => ({ ...c })) as Segment["constants"],
        controls: [],
        distance: 0,
        time: 0,
        ...extra,
    };
}

function mkPath(segments: Segment[]): Path {
    return { name: "", segments };
}

const mikDef = mikLibDef as unknown as FormatDef<"mikLib">;

/** A point turn's own pose is empty: its target and offset live on turnPose. */
const NO_POSE = { x: null, y: null, angle: null };

function mikSeg(kind: SegmentKind, pose: { x: number | null; y: number | null; angle: number | null }, extra: Partial<Segment> = {}) {
    return makeSeg("mikLib", kind, pose, extra);
}

/** First constants group, typed for mikLib assertions. */
function k0(seg: Segment): mikConstants {
    return seg.constants[0] as mikConstants;
}

describe("templateToRegex", () => {
    it("captures coordinate placeholders as signed decimals in template order", () => {
        const { regex, groups } = templateToRegex("chassis.drive_to_pose(${x}, ${y}, ${angle}, ${kBuilder});");

        expect(groups).toEqual(["x", "y", "angle", "kBuilder"]);
        const match = "chassis.drive_to_pose(-12.5, 0.25, 180);".match(regex);
        expect(match).not.toBeNull();
        expect(match!.slice(1, 4)).toEqual(["-12.5", "0.25", "180"]);
        expect(match![4]).toBeUndefined();
    });

    it("captures the optional kBuilder block when present", () => {
        const { regex } = templateToRegex("chassis.drive_to_pose(${x}, ${y}, ${angle}, ${kBuilder});");

        const match = "chassis.drive_to_pose(1, 2, 3, {.max_voltage = 6, .direction = reversed});".match(regex);
        expect(match).not.toBeNull();
        expect(match![4]).toBe("{.max_voltage = 6, .direction = reversed}");
    });

    it("rejects lines whose fixed text differs", () => {
        const { regex } = templateToRegex("chassis.drive_to_pose(${x}, ${y}, ${angle}, ${kBuilder});");

        expect("chassis.drive_to_point(1, 2, 3);".match(regex)).toBeNull();
        expect("drive_to_pose(1, 2, 3);".match(regex)).toBeNull();
    });

    it("captures a field placeholder embedded in an identifier", () => {
        const { regex, groups } = templateToRegex("chassis.${swing_direction}_swing_to_angle(${angle}, ${kBuilder});");

        expect(groups).toEqual(["swing_direction", "angle", "kBuilder"]);
        const match = "chassis.left_swing_to_angle(90);".match(regex);
        expect(match).not.toBeNull();
        expect(match![1]).toBe("left");
        expect(match![2]).toBe("90");
    });

    it("escapes regex special characters in the fixed template text", () => {
        const { regex } = templateToRegex("chassis.follow_path({${c1x}, ${c1y}}, {${c2x}, ${c2y}}, {${x}, ${y}}, ${kBuilder});");

        const match = "chassis.follow_path({6, 12}, {18, 42}, {30, 60});".match(regex);
        expect(match).not.toBeNull();
        expect(match!.slice(1, 7)).toEqual(["6", "12", "18", "42", "30", "60"]);
        expect("chassis.follow_pathX{6, 12}, {18, 42}, {30, 60});".match(regex)).toBeNull();
    });

    it("names indexed placeholders by their full token", () => {
        const { regex, groups } = templateToRegex("chassis.pid_${0:wait}();");

        expect(groups).toEqual(["0:wait"]);
        const match = "chassis.pid_wait_quick_chain();".match(regex);
        expect(match).not.toBeNull();
        expect(match![1]).toBe("wait_quick_chain");
    });
});

describe("convertPathToString (mikLib)", () => {
    it("emits a start segment as set_coordinates", () => {
        const out = convertPathToString(mikDef, mkPath([mikSeg("start", { x: 0, y: 0, angle: 90 })]));

        expect(out).toBe("chassis.set_coordinates(0, 0, 90);\n");
    });

    it("rounds coordinates to two decimals", () => {
        const out = convertPathToString(mikDef, mkPath([mikSeg("start", { x: 12.346, y: 6.784, angle: 90 })]));

        expect(out).toBe("chassis.set_coordinates(12.35, 6.78, 90);\n");
    });

    it("strips the kBuilder slot when constants are all defaults", () => {
        const out = convertPathToString(mikDef, mkPath([mikSeg("poseDrive", { x: 24, y: 48, angle: 45 })]));

        expect(out).toBe("chassis.drive_to_pose(24, 48, 45);\n");
    });

    it("emits only changed constants inside the kBuilder braces", () => {
        const seg = mikSeg("poseDrive", { x: 24, y: 48, angle: 45 });
        k0(seg).max_voltage = 6;
        (seg.constants[1] as mikConstants).kp = 0.5;

        const out = convertPathToString(mikDef, mkPath([seg]));

        expect(out).toBe("chassis.drive_to_pose(24, 48, 45, {.max_voltage = 6, .heading_k.p = 0.5});\n");
    });

    it("emits the drive direction as a valid mikLib spelling", () => {
        const rev = mikSeg("poseDrive", { x: 24, y: 48, angle: 45 });
        k0(rev).drive_direction = "reversed";
        const fwd = mikSeg("pointDrive", { x: 24, y: 48, angle: null });
        k0(fwd).drive_direction = "forwards";

        const out = convertPathToString(mikDef, mkPath([rev, fwd]));

        expect(out).toBe(
            "chassis.drive_to_pose(24, 48, 45, {.direction = reverse});\n" +
            "chassis.drive_to_point(24, 48, {.direction = forward});\n",
        );
    });

    it("points turn segments at the next segment position, not their own pose", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("pointTurn", { x: null, y: null, angle: 0 }),
            mikSeg("poseDrive", { x: 24, y: 48, angle: 90 }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.turn_to_point(24, 48);");
    });

    it("carries a point turn angle offset through the kBuilder", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("pointTurn", NO_POSE, { turnPose: { x: 0, y: 0, angle: 180 } }),
            mikSeg("poseDrive", { x: 24, y: 48, angle: 90 }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.turn_to_point(24, 48, {.angle_offset = 180});");
    });

    it("emits a locked turn's own coordinate instead of the segment in front of it", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("pointTurn", NO_POSE, { turnPose: { x: -12, y: 6, angle: 0 }, turnLocked: true }),
            mikSeg("poseDrive", { x: 24, y: 48, angle: 90 }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.turn_to_point(-12, 6);");
    });

    it("aims a turn with nothing after it at the field centre it was created with", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 30, y: 30, angle: 0 }),
            mikSeg("pointTurn", NO_POSE),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.turn_to_point(0, 0);");
    });

    it("substitutes the swing direction into the method name without leaking it into kBuilder", () => {
        const seg = mikSeg("angleSwing", { x: null, y: null, angle: 90 });
        k0(seg).swing_direction = "right";

        const out = convertPathToString(mikDef, mkPath([seg]));

        expect(out).toBe("chassis.right_swing_to_angle(90);\n");
    });

    it("emits wait time rounded to whole milliseconds", () => {
        const out = convertPathToString(mikDef, mkPath([mikSeg("wait", { x: null, y: null, angle: null }, { time: 500.4 })]));

        expect(out).toBe("task::sleep(500);\n");
    });

    it("emits a distance drive with its stored distance and heading", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("distanceDrive", { x: 24, y: 0, angle: 90 }, { distance: 24 }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.drive_distance(24, {.heading = 90});");
    });

    it("derives the distance from the poses when none is stored", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("distanceDrive", { x: 36, y: 10, angle: 90 }, { distance: null as unknown as number }),
        ]));

        // Projection of the (36, 10) offset onto the commanded 90 degree heading (+x)
        expect(out.split("\n")[1]).toBe("chassis.drive_distance(36, {.heading = 90});");
    });

    it("emits a bezier with its two control points", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("bezierCurve", { x: 30, y: 60, angle: null }, { controls: [createControlPoint(6, 12), createControlPoint(18, 42)] }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.follow_path({6, 12}, {18, 42}, {30, 60});");
    });

    it("degree elevates a single-control bezier to a cubic", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("bezierCurve", { x: 30, y: 60, angle: null }, { controls: [createControlPoint(12, 24)] }),
        ]));

        // Quadratic P0 (0,0), C (12,24), P1 (30,60) elevated: c1 = P0 + 2/3 (C - P0), c2 = P1 + 2/3 (C - P1)
        expect(out.split("\n")[1]).toBe("chassis.follow_path({8, 16}, {18, 36}, {30, 60});");
    });

    it("emits a control-less bezier with controls at the endpoints", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("bezierCurve", { x: 30, y: 60, angle: null }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.follow_path({0, 0}, {30, 60}, {30, 60});");
    });

    it("emits a bezier heading through the kBuilder when one is commanded", () => {
        const out = convertPathToString(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("bezierCurve", { x: 30, y: 60, angle: 45 }, { controls: [createControlPoint(6, 12), createControlPoint(18, 42)] }),
        ]));

        expect(out.split("\n")[1]).toBe("chassis.follow_path({6, 12}, {18, 42}, {30, 60}, {.heading = 45});");
    });

    it("resolves castTo kinds to the target segment template", () => {
        const seg = mikSeg("strafeDrive", { x: null, y: null, angle: null }, {
            distance: 24,
            constants: getDefaultConstants(undefined, "mikLib", "distanceDrive")!.map(c => ({ ...c })) as Segment["constants"],
        });

        const out = convertPathToString(mikDef, mkPath([seg]));

        expect(out).toBe("chassis.drive_distance(24);\n");
    });

    it("emits only selected segments when asked to", () => {
        const kept = mikSeg("start", { x: 0, y: 0, angle: 0 }, { selected: true });
        const dropped = mikSeg("poseDrive", { x: 24, y: 48, angle: 45 });

        const out = convertPathToString(mikDef, mkPath([kept, dropped]), true);

        expect(out).toBe("chassis.set_coordinates(0, 0, 0);\n");
    });

    it("skips kinds the format does not define instead of crashing", () => {
        const startOnly = { ...mikDef, segments: { start: mikDef.segments.start } } as FormatDef<"mikLib">;
        const out = convertPathToString(startOnly, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("poseDrive", { x: 24, y: 48, angle: 45 }),
        ]));

        expect(out).toBe("chassis.set_coordinates(0, 0, 0);\n");
    });

    it("returns an empty string for an empty path", () => {
        expect(convertPathToString(mikDef, mkPath([]))).toBe("");
    });
});

describe("convertStringToPath (mikLib)", () => {
    it("parses a full script and skips lines it does not recognize", () => {
        const segs = convertStringToPath(mikDef, "mikLib", [
            "// autonomous routine",
            "chassis.set_coordinates(0, 0, 0);",
            "intake.move(127);",
            "chassis.drive_to_point(-24.5, 48.25, {.max_voltage = 6});",
            "",
            "chassis.turn_to_angle(90);",
            "task::sleep(500);",
        ].join("\n"));

        expect(segs.map(s => s.kind)).toEqual(["start", "pointDrive", "angleTurn", "wait"]);
        expect(segs.map(s => s.format)).toEqual(["mikLib", "mikLib", "mikLib", "mikLib"]);
        expect(new Set(segs.map(s => s.id)).size).toBe(segs.length);

        expect(segs[1].pose).toEqual({ x: -24.5, y: 48.25, angle: null });
        expect(k0(segs[1]).max_voltage).toBe(6);
        expect(segs[2].pose.angle).toBe(90);
        expect(segs[3].time).toBe(500);
    });

    it("tolerates indentation and padding inside parentheses", () => {
        const segs = convertStringToPath(mikDef, "mikLib", "    chassis.turn_to_angle( 90 );");

        expect(segs).toHaveLength(1);
        expect(segs[0].kind).toBe("angleTurn");
        expect(segs[0].pose.angle).toBe(90);
    });

    it("parses every accepted mikLib direction spelling", () => {
        const segs = convertStringToPath(mikDef, "mikLib", [
            "chassis.drive_to_point(10, 10, { .direction = directionType::fwd });",
            "chassis.drive_to_point(10, 10, { .direction = directionType::rev });",
            "chassis.drive_to_point(10, 10, { .direction = forward });",
            "chassis.drive_to_point(10, 10, { .direction = reverse });",
            "chassis.drive_to_point(10, 10, { .direction = fwd });",
        ].join("\n"));

        expect(segs.map(s => k0(s).drive_direction)).toEqual([
            "forwards", "reversed", "forwards", "reversed", "forwards",
        ]);
    });

    it("leaves point turns without their own coordinates and reads the angle offset", () => {
        const segs = convertStringToPath(mikDef, "mikLib", [
            "chassis.turn_to_point(24, 48);",
            "chassis.turn_to_point(24, 48, {.angle_offset = 180});",
        ].join("\n"));

        // The coordinate is the turn's target, and the offset rides with it, so pose stays empty
        expect(segs[0].pose).toEqual({ x: null, y: null, angle: null });
        expect(segs[1].pose).toEqual({ x: null, y: null, angle: null });
        expect(segs[0].turnPose).toEqual({ x: 24, y: 48, angle: 0 });
        expect(segs[1].turnPose).toEqual({ x: 24, y: 48, angle: 180 });
        // Parsing never locks: paste decides that once the rows are among their new neighbours
        expect(segs.map(s => s.turnLocked)).toEqual([false, false]);
    });

    it("locks a parsed turn only when its coordinate is not the one the path derives", () => {
        const tracking = convertStringToPath(mikDef, "mikLib", [
            "chassis.set_coordinates(0, 0, 0);",
            "chassis.turn_to_point(24, 48);",
            "chassis.drive_to_pose(24, 48, 90);",
        ].join("\n"));
        const aimedElsewhere = convertStringToPath(mikDef, "mikLib", [
            "chassis.set_coordinates(0, 0, 0);",
            "chassis.turn_to_point(-12, 6);",
            "chassis.drive_to_pose(24, 48, 90);",
        ].join("\n"));

        const locksOf = (segs: Segment[]) =>
            applyTurnLocks({ name: "", segments: segs }, 0, segs.length).map(s => s.turnLocked);

        // The turn already faces the drive after it, so it goes on tracking
        expect(locksOf(tracking)[1]).toBe(false);
        // This one names a coordinate the path would never derive, so it has to hold on to it
        expect(locksOf(aimedElsewhere)[1]).toBe(true);
    });

    it("survives an export of a locked turn and back", () => {
        const path = mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("pointTurn", NO_POSE, { turnPose: { x: -12, y: 6, angle: 180 }, turnLocked: true }),
            mikSeg("poseDrive", { x: 24, y: 48, angle: 90 }),
        ]);
        const str = convertPathToString(mikDef, path);
        const segs = applyTurnLocks({ name: "", segments: convertStringToPath(mikDef, "mikLib", str) }, 0, 3);

        expect(segs[1].turnLocked).toBe(true);
        expect(segs[1].turnPose).toEqual({ x: -12, y: 6, angle: 180 });
        expect(convertPathToString(mikDef, { name: "", segments: segs })).toBe(str);
    });

    it("reads the swing direction out of the method name", () => {
        const segs = convertStringToPath(mikDef, "mikLib", "chassis.right_swing_to_angle(45);");

        expect(segs[0].kind).toBe("angleSwing");
        expect(k0(segs[0]).swing_direction).toBe("right");
        expect(segs[0].pose.angle).toBe(45);
    });

    it("splits kBuilder entries into drive and heading constants groups", () => {
        const segs = convertStringToPath(
            mikDef,
            "mikLib",
            "chassis.drive_to_pose(24, 48, 45, {.drive_k.p = 2, .timeout = 8000, .heading_k.p = 0.6, .wait = false});",
        );

        expect(k0(segs[0]).kp).toBe(2);
        expect(k0(segs[0]).timeout).toBe(8000);
        expect(k0(segs[0]).wait).toBe(false);
        expect((segs[0].constants[1] as mikConstants).kp).toBe(0.6);
    });

    it("rebuilds the distance drive pose from its distance and heading", () => {
        const segs = convertStringToPath(mikDef, "mikLib", [
            "chassis.set_coordinates(0, 0, 0);",
            "chassis.drive_distance(24, {.heading = 90});",
        ].join("\n"));

        expect(segs[1].kind).toBe("distanceDrive");
        expect(segs[1].distance).toBe(24);
        expect(segs[1].pose.angle).toBe(90);
        expect(segs[1].pose.x).toBeCloseTo(24, 6);
        expect(segs[1].pose.y).toBeCloseTo(0, 6);
    });

    it("parses bezier control points into segment controls", () => {
        const segs = convertStringToPath(mikDef, "mikLib", "chassis.follow_path({6, 12}, {18, 42}, {30, 60});");

        expect(segs[0].kind).toBe("bezierCurve");
        expect(segs[0].pose.x).toBe(30);
        expect(segs[0].pose.y).toBe(60);
        expect(segs[0].controls.map(c => [c.x, c.y])).toEqual([[6, 12], [18, 42]]);
    });

    it("returns nothing for input with no recognizable lines", () => {
        expect(convertStringToPath(mikDef, "mikLib", "")).toEqual([]);
        expect(convertStringToPath(mikDef, "mikLib", "int main() {\n  return 0;\n}")).toEqual([]);
    });
});

describe("convertStringToPath (EZ-Template, multi-line templates)", () => {
    const ezDef = FORMAT_REGISTRY["EZ-Template"];

    it("consumes both lines of a two-line template as one segment", () => {
        const segs = convertStringToPath(ezDef, "EZ-Template", [
            "chassis.odom_xyt_set(0_in, 0_in, 0_deg);",
            "chassis.set_drive_pid(24_in, 110, true);",
            "chassis.pid_wait();",
            "chassis.pid_turn_set(90_deg, 90, shortest, true);",
            "chassis.pid_wait_quick_chain();",
        ].join("\n"));

        expect(segs.map(s => s.kind)).toEqual(["start", "distanceDrive", "angleTurn"]);
        expect(segs[1].distance).toBe(24);
        expect((segs[1].constants[0] as unknown as { speed: number }).speed).toBe(110);
        expect(segs[2].pose.angle).toBe(90);
    });

    it("routes indexed placeholders back into their constants group", () => {
        const segs = convertStringToPath(ezDef, "EZ-Template", [
            "chassis.set_drive_pid(24_in, 110, true);",
            "chassis.pid_wait_quick_chain();",
        ].join("\n"));

        expect((segs[0].constants[0] as unknown as { wait: string }).wait).toBe("wait_quick_chain");
    });
});

describe("round trips", () => {
    it("holds a fixed point through string, parse, string for a mikLib path with modified constants", () => {
        const pose = mikSeg("poseDrive", { x: 24, y: 48, angle: 45 });
        k0(pose).max_voltage = 6;
        k0(pose).drive_direction = "reversed";
        (pose.constants[1] as mikConstants).kp = 0.6;

        const swing = mikSeg("angleSwing", { x: null, y: null, angle: 90 });
        k0(swing).swing_direction = "right";
        k0(swing).opposite_voltage = 3;

        const path = mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            pose,
            mikSeg("distanceDrive", { x: 30, y: 0, angle: 90 }, { distance: 30 }),
            mikSeg("pointTurn", { x: null, y: null, angle: 180 }),
            mikSeg("pointDrive", { x: 36, y: 12, angle: null }),
            swing,
            mikSeg("bezierCurve", { x: 30, y: 60, angle: null }, { controls: [createControlPoint(6, 12), createControlPoint(18, 42)] }),
            mikSeg("wait", { x: null, y: null, angle: null }, { time: 250 }),
        ]);

        const str1 = convertPathToString(mikDef, path);
        const parsed = convertStringToPath(mikDef, "mikLib", str1);
        const str2 = convertPathToString(mikDef, mkPath(parsed));

        expect(parsed.map(s => s.kind)).toEqual(path.segments.map(s => s.kind));
        expect(str2).toBe(str1);
    });

    const formats = Object.keys(FORMAT_REGISTRY) as Format[];

    /** A workable pose per kind: turn kinds face other segments, so they carry no coordinates. */
    function genericSeg(format: Format, kind: SegmentKind, idx: number): Segment {
        if (kind === "start") return makeSeg(format, kind, { x: 0, y: 0, angle: 0 });
        if (kind === "wait") return makeSeg(format, kind, { x: null, y: null, angle: null }, { time: 300 });
        if (kind === "pointTurn" || kind === "pointSwing") return makeSeg(format, kind, { x: null, y: null, angle: 0 });
        // Angle turn templates carry only the angle, so coordinates here could never survive a parse
        if (kind === "angleTurn" || kind === "angleSwing") return makeSeg(format, kind, { x: null, y: null, angle: 45 });
        if (kind === "distanceDrive" || kind === "strafeDrive") return makeSeg(format, kind, { x: null, y: null, angle: null }, { distance: 18 });
        if (kind === "bezierCurve") return makeSeg(format, kind, { x: 30, y: 44, angle: null }, {
            controls: [createControlPoint(10, 15), createControlPoint(22, 33)],
        });
        return makeSeg(format, kind, { x: 12 + 2 * idx, y: 20 + 2 * idx, angle: 45 });
    }

    it.each(formats)("holds a fixed point for every segment kind of %s at default constants", (format) => {
        const def = FORMAT_REGISTRY[format] as unknown as FormatDef<Format>;
        const ownKinds = (Object.entries(def.segments) as [SegmentKind, SegmentDef<Format>][])
            .filter(([, sd]) => sd && !sd.castTo && sd.toStringTemplate)
            .map(([kind]) => kind);

        // Start first so beziers have an anchor, beziers last so every kind sits at index > 0
        const ordered = [
            ...ownKinds.filter(k => k === "start"),
            ...ownKinds.filter(k => k !== "start" && k !== "bezierCurve"),
            ...ownKinds.filter(k => k === "bezierCurve"),
        ];
        const path = mkPath(ordered.map((kind, idx) => genericSeg(format, kind, idx)));

        const str1 = convertPathToString(def, path);
        const parsed = convertStringToPath(def, format, str1);
        const str2 = convertPathToString(def, mkPath(parsed));

        expect(str1.length).toBeGreaterThan(0);
        expect(parsed.map(s => s.kind)).toEqual(ordered);
        expect(str2).toBe(str1);
    });
});

describe("convertPathToSim", () => {
    type SimCall = { kind: string; x: number; y: number; angle: number | null; points?: Coordinate[] };

    /** A stub format whose simFns record their arguments, isolating the dispatch plumbing under test. */
    function makeFakeDef() {
        const calls: SimCall[] = [];
        const resets: string[] = [];
        const rec = (kind: string, result = false): SegmentDef<"mikLib"> => ({
            simFn: (_robot, _dt, x, y, angle, _k, points) => {
                calls.push({ kind, x, y, angle, points });
                return result;
            },
            simReset: () => resets.push(kind),
        });
        const def = {
            constants: [kMikDrive],
            kMaxSpeed: 12,
            formatPathName: "fake",
            segments: {
                start: rec("start", true),
                wait: rec("wait"),
                poseDrive: rec("poseDrive"),
                pointDrive: rec("pointDrive"),
                angleTurn: rec("angleTurn"),
                pointTurn: rec("pointTurn"),
                distanceDrive: rec("distanceDrive"),
                strafeDrive: { castTo: "distanceDrive" },
                bezierCurve: rec("bezierCurve"),
                pointSwing: {},
            },
        } as unknown as FormatDef<"mikLib">;
        return { def, calls, resets };
    }

    function stubRobot(x = 0, y = 0, angle = 0) {
        const state = { x, y, angle };
        const robot = {
            getX: () => state.x,
            getY: () => state.y,
            getAngle: () => state.angle,
        } as unknown as Robot;
        return { state, robot };
    }

    it("builds one runner per segment and skips kinds without a simFn", () => {
        const { def } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("pointSwing", { x: null, y: null, angle: 0 }),
            mikSeg("angleSwing", { x: null, y: null, angle: 90 }),
            mikSeg("poseDrive", { x: 10, y: 10, angle: 0 }),
        ]));

        expect(auton).toHaveLength(2);
    });

    it("passes the start pose through and reports zero target distance", () => {
        const { def, calls } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("start", { x: 12, y: 24, angle: 90 })]));
        const { robot } = stubRobot();

        expect(auton[0](robot, 0.01)).toEqual([true, "start", 0]);
        expect(calls[0]).toMatchObject({ kind: "start", x: 12, y: 24, angle: 90 });
    });

    it("hands the wait time to the simFn and reports the sentinel distance", () => {
        const { def, calls } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("wait", { x: null, y: null, angle: null }, { time: 400 })]));
        const { robot } = stubRobot();

        expect(auton[0](robot, 0.01)).toEqual([false, "wait", 999]);
        expect(calls[0].x).toBe(400);
    });

    it("freezes the drive target distance at the first tick", () => {
        const { def } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("poseDrive", { x: 30, y: 40, angle: 0 })]));
        const { state, robot } = stubRobot(0, 0, 0);

        expect(auton[0](robot, 0.01)[2]).toBe(50);
        state.x = 30;
        state.y = 40;
        expect(auton[0](robot, 0.01)[2]).toBe(50);
    });

    it("resets the motion once on the first tick only", () => {
        const { def, resets } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("poseDrive", { x: 30, y: 40, angle: 0 })]));
        const { robot } = stubRobot();

        auton[0](robot, 0.01);
        auton[0](robot, 0.01);
        expect(resets).toEqual(["poseDrive"]);
    });

    it("reports the wrapped angle error as an angle turn's target distance", () => {
        const { def } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("angleTurn", { x: null, y: null, angle: 270 })]));
        const { robot } = stubRobot(0, 0, 0);

        expect(auton[0](robot, 0.01)[2]).toBe(90);
    });

    it("aims point turns at the next segment and measures the turn from there", () => {
        const { def, calls } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([
            mikSeg("pointTurn", { x: null, y: null, angle: 0 }),
            mikSeg("poseDrive", { x: 10, y: 0, angle: null }),
        ]));
        const { robot } = stubRobot(0, 0, 0);

        expect(auton[0](robot, 0.01)[2]).toBe(90);
        expect(calls[0]).toMatchObject({ kind: "pointTurn", x: 10, y: 0 });
    });

    it("hands distance drives their signed distance but reports it unsigned", () => {
        const { def, calls } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("distanceDrive", { x: null, y: null, angle: null }, { distance: -30 })]));
        const { robot } = stubRobot();

        expect(auton[0](robot, 0.01)[2]).toBe(30);
        expect(calls[0].x).toBe(-30);
    });

    it("routes castTo kinds to the target kind's simFn", () => {
        const { def, calls } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("strafeDrive", { x: null, y: null, angle: null }, { distance: 12 })]));
        const { robot } = stubRobot();

        auton[0](robot, 0.01);
        expect(calls[0].kind).toBe("distanceDrive");
        expect(calls[0].x).toBe(12);
    });

    it("samples the bezier once and reports its arc length, preserving a null heading", () => {
        const { def, calls } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("bezierCurve", { x: 30, y: 40, angle: null }),
        ]));
        const { robot } = stubRobot();

        const [, kind, targetDist] = auton[1](robot, 0.01);
        expect(kind).toBe("bezierCurve");
        expect(targetDist).toBeCloseTo(50, 6);
        expect(calls[0].angle).toBeNull();
        expect(calls[0].points).toHaveLength(401);
    });

    it("drops a bezier that cannot resolve instead of crashing", () => {
        const { def } = makeFakeDef();
        const auton = convertPathToSim(def, mkPath([mikSeg("bezierCurve", { x: 30, y: 40, angle: null })]));

        expect(auton).toHaveLength(0);
    });

    it("runs a real mikLib start and turn to completion", () => {
        const robot = new Robot(defaultRobotConstants);
        const auton = convertPathToSim(mikDef, mkPath([
            mikSeg("start", { x: 0, y: 0, angle: 0 }),
            mikSeg("angleTurn", { x: null, y: null, angle: 90 }),
        ]));

        expect(auton[0](robot, 1 / 60)[0]).toBe(true);
        expect(robot.getAngle()).toBe(0);

        let done = false;
        let ticks = 0;
        while (!done && ticks < 1200) {
            done = auton[1](robot, 1 / 60)[0];
            ticks++;
        }
        expect(done).toBe(true);
        expect(Math.abs(robot.getAngle() - 90)).toBeLessThan(3);
    });
});
