import { describe, expect, it } from "vitest";
import { convertPathToString, convertStringToPath } from "../Conversion";
import { FORMAT_REGISTRY, type Format, type FormatDef, type SegmentKind } from "../FormatDefinition";
import type { Path } from "../../core/Types/Path";
import type { Segment } from "../../core/Types/Segment";
import { getDefaultConstants } from "../FormatDefinition";
import { createControlPoint } from "../../core/Types/Pose";

const revDef = FORMAT_REGISTRY["ReveilLib"] as unknown as FormatDef<Format>;
const revHoloDef = FORMAT_REGISTRY["ReveilLib Holonomic"] as unknown as FormatDef<Format>;

function seg(format: Format, def: FormatDef<Format>, kind: SegmentKind, pose: { x: number | null, y: number | null, angle: number | null }, extra: Partial<Segment> = {}): Segment {
    return {
        id: kind + Math.random().toString(36).slice(2, 8),
        selected: false, disabled: false, visible: true,
        format, kind, pose,
        turnPose: { x: 0, y: 0, angle: 0 },
        turnLocked: false,
        constants: structuredClone(getDefaultConstants(def, format, kind)),
        controls: [],
        distance: 0,
        time: 0,
        ...extra,
    } as Segment;
}

function roundTrip(def: FormatDef<Format>, format: Format, segments: Segment[]) {
    const path: Path = { name: "t", segments };
    const text = convertPathToString(def, path);
    const parsed = convertStringToPath(def, format, text);
    return { text, parsed };
}

describe("ReveilLib codegen", () => {
    it("emits a bare chained kBuilder and reads it back", () => {
        const s = seg("ReveilLib", revDef, "poseDrive", { x: 24, y: 24, angle: 90 });
        (s.constants[0] as unknown as Record<string, unknown>).max_speed = 0.5;
        (s.constants[0] as unknown as Record<string, unknown>).lead = 0.4;
        (s.constants[0] as unknown as Record<string, unknown>).drive_direction = "reversed";
        (s.constants[1] as unknown as Record<string, unknown>).kp = 0.02;

        const { text, parsed } = roundTrip(revDef, "ReveilLib", [
            seg("ReveilLib", revDef, "start", { x: 0, y: 0, angle: 0 }), s,
        ]);
        console.log(text);

        expect(text).toContain("reckless.go(DriveToPose({24_in, 24_in, 90_deg})");
        expect(parsed.map(p => p.kind)).toEqual(["start", "poseDrive"]);
        const k = parsed[1].constants as unknown as Record<string, unknown>[];
        expect(k[0].max_speed).toBe(0.5);
        expect(k[0].lead).toBe(0.4);
        expect(k[0].drive_direction).toBe("reversed");
        expect(k[1].kp).toBe(0.02);
    });

    it("round trips every tank kind with no overrides", () => {
        const segments = [
            seg("ReveilLib", revDef, "start", { x: 0, y: 0, angle: 0 }),
            seg("ReveilLib", revDef, "poseDrive", { x: 10, y: 20, angle: 45 }),
            seg("ReveilLib", revDef, "pointDrive", { x: 30, y: 40, angle: null }),
            seg("ReveilLib", revDef, "distanceDrive", { x: 30, y: 60, angle: 30 }, { distance: 20 }),
            seg("ReveilLib", revDef, "angleTurn", { x: null, y: null, angle: 135 }),
            seg("ReveilLib", revDef, "pointTurn", { x: null, y: null, angle: null }, { turnPose: { x: 5, y: 5, angle: 0 }, turnLocked: true }),
            seg("ReveilLib", revDef, "angleSwing", { x: null, y: null, angle: 200 }),
            seg("ReveilLib", revDef, "bezierCurve", { x: 12, y: 90, angle: 10 }, { controls: [createControlPoint(4, 70), createControlPoint(8, 80)] }),
            seg("ReveilLib", revDef, "wait", { x: null, y: null, angle: null }, { time: 500 }),
        ];
        const { text, parsed } = roundTrip(revDef, "ReveilLib", segments);
        console.log(text);
        expect(parsed.map(p => p.kind)).toEqual(segments.map(p => p.kind));
    });

    it("drops the heading argument on a headless distance drive and parses it back", () => {
        const { text, parsed } = roundTrip(revDef, "ReveilLib", [
            seg("ReveilLib", revDef, "start", { x: 0, y: 0, angle: 0 }),
            seg("ReveilLib", revDef, "distanceDrive", { x: 0, y: 24, angle: null }, { distance: 24 }),
        ]);
        console.log(text);
        expect(text).toContain("reckless.go(DriveDistance(24_in));");
        expect(parsed.map(p => p.kind)).toEqual(["start", "distanceDrive"]);
        expect(parsed[1].pose.angle).toBe(null);
        expect(parsed[1].distance).toBe(24);
    });

    it("drops the end heading on a headless path follow", () => {
        const { text, parsed } = roundTrip(revDef, "ReveilLib", [
            seg("ReveilLib", revDef, "start", { x: 0, y: 0, angle: 0 }),
            seg("ReveilLib", revDef, "bezierCurve", { x: 12, y: 90, angle: null }, { controls: [createControlPoint(4, 70), createControlPoint(8, 80)] }),
        ]);
        console.log(text);
        expect(text).toContain("{12_in, 90_in}));");
        expect(parsed[1].kind).toBe("bezierCurve");
        expect(parsed[1].pose.angle).toBe(null);
    });

    it("emits swing side and turn offset", () => {
        const s = seg("ReveilLib", revDef, "pointSwing", { x: null, y: null, angle: null }, { turnPose: { x: 5, y: 5, angle: 180 }, turnLocked: true });
        (s.constants[0] as unknown as Record<string, unknown>).swing_side = "SwingSide::RIGHT";
        (s.constants[0] as unknown as Record<string, unknown>).turn_direction = "ccw";
        (s.constants[0] as unknown as Record<string, unknown>).opposite_speed = 0.3;

        const { text, parsed } = roundTrip(revDef, "ReveilLib", [
            seg("ReveilLib", revDef, "start", { x: 0, y: 0, angle: 0 }), s,
        ]);
        console.log(text);
        expect(text).toContain("Swing(SwingSide::RIGHT, {5_in, 5_in})");
        expect(text).toContain(".offset(180_deg)");
        expect(text).toContain(".direction(TurnDirection::CCW)");
        const k = parsed[1].constants as unknown as Record<string, unknown>[];
        expect(k[0].swing_side).toBe("SwingSide::RIGHT");
        expect(k[0].turn_direction).toBe("ccw");
        expect(k[0].opposite_speed).toBe(0.3);
        expect(parsed[1].turnPose.angle).toBe(180);
    });

    it("round trips the holonomic strafe kinds with translational overrides", () => {
        const sp = seg("ReveilLib Holonomic", revHoloDef, "poseDrive2", { x: 24, y: 48, angle: 90 });
        (sp.constants[2] as unknown as Record<string, unknown>).kp = 0.25;
        (sp.constants[1] as unknown as Record<string, unknown>).settle_error = 2;

        const segments = [
            seg("ReveilLib Holonomic", revHoloDef, "start", { x: 0, y: 0, angle: 0 }),
            sp,
            seg("ReveilLib Holonomic", revHoloDef, "strafeDrive", { x: 40, y: 48, angle: 90 }, { distance: 16 }),
        ];
        const { text, parsed } = roundTrip(revHoloDef, "ReveilLib Holonomic", segments);
        console.log(text);
        expect(text).toContain("reckless.go(StrafeToPose({24_in, 48_in, 90_deg})");
        expect(text).toContain(".translational_kp(0.25)");
        expect(text).toContain(".angular_settle_error(2_deg)");
        expect(text).toContain("reckless.go(StrafeDistance(16_in, 90_deg));");
        expect(parsed.map(p => p.kind)).toEqual(["start", "poseDrive2", "strafeDrive"]);
        const k = parsed[1].constants as unknown as Record<string, unknown>[];
        expect(k[2].kp).toBe(0.25);
        expect(k[1].settle_error).toBe(2);
    });
});
