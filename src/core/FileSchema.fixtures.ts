import { expect } from "vitest";
import { FORMAT_REGISTRY, getDefaultConstants, type Format, type FormatDef } from "../simulation/FormatDefinition";
import { VALID_FIELDS, type FileFormat } from "./FileSchema";
import type { Segment } from "./Types/Segment";
import { defaultRobotConstants } from "./Robot";

/**
 * Test support only: nothing in the app imports this, so it never reaches the bundle. Lives outside
 * a .test.ts file so the suites can share it without re-running each other's describe blocks.
 */

export const FORMATS = Object.keys(FORMAT_REGISTRY) as Format[];

/** A raw, file-shaped segment, ready to be corrupted one key at a time. */
export const rawSegment = (over: Record<string, unknown> = {}) => ({
    id: "s1", selected: false, disabled: false, visible: true,
    pose: { x: 0, y: 0, angle: 0 }, turnPose: { x: 0, y: 0, angle: 0 }, turnLocked: false,
    format: "mikLib", kind: "start", constants: [{}],
    distance: 0, time: 0, controls: [], ...over,
});

/** One raw segment per kind the format names, in an order that always starts with a start pose. */
export function everyKindSegments(format: Format): Record<string, unknown>[] {
    const kinds = Object.keys((FORMAT_REGISTRY[format] as FormatDef<Format>).segments);
    return [
        rawSegment({ id: "start", kind: "start" }),
        ...kinds.filter(k => k !== "start").map((kind, i) =>
            rawSegment({ id: `s${i}`, kind, pose: { x: 10 + i, y: -12 - i, angle: 45 }, distance: 12, time: 500 })),
    ];
}

/**
 * The contract the whole refactor exists to hold: whatever came in, this segment cannot make the
 * UI or the simulator throw. Every consumer indexes constants positionally and reads pose fields
 * without guarding, so those are the invariants worth pinning.
 */
export function expectValidSegment(seg: Segment, formatDef: FormatDef<Format>, format: Format, where = "") {
    const at = `${where} ${format}/${seg.kind}`;

    expect(Array.isArray(seg.constants), at).toBe(true);
    const expected = getDefaultConstants(formatDef, format, seg.kind);
    expect(seg.constants.length, `${at} constants length`).toBeGreaterThanOrEqual(expected.length);
    for (const entry of seg.constants) expect(typeof entry, `${at} constants entry`).toBe("object");

    for (const key of ["x", "y", "angle"] as const) {
        for (const [name, pose] of [["pose", seg.pose], ["turnPose", seg.turnPose]] as const) {
            const v = pose[key];
            expect(v === null || (typeof v === "number" && Number.isFinite(v)), `${at} ${name}.${key} = ${v}`).toBe(true);
        }
    }
    // The offset is always a real number, so no consumer has to coalesce it
    expect(Number.isFinite(seg.turnPose.angle), `${at} turnPose.angle`).toBe(true);
    expect(typeof seg.turnLocked, `${at} turnLocked`).toBe("boolean");

    expect(Array.isArray(seg.controls), `${at} controls`).toBe(true);
    expect(typeof seg.id, `${at} id`).toBe("string");
    expect(Number.isFinite(seg.distance), `${at} distance`).toBe(true);
    expect(Number.isFinite(seg.time), `${at} time`).toBe(true);
    expect(seg.format, `${at} format`).toBe(format);

    // A kind the format has no definition for renders nothing and simulates nothing
    const segDef = formatDef.segments[seg.kind];
    expect(segDef, `${at} kind is defined`).toBeDefined();
    // Alias entries carry only castTo, so a segment left sitting on one has no constants of its own
    expect(segDef?.defaults, `${at} landed on an alias kind`).toBeDefined();

    // Every numberInput and cycleButton indexes constants positionally, unguarded
    for (const group of segDef?.numberInputs ?? []) {
        expect(seg.constants[group.constantsIdx], `${at} numberInput "${group.headerName}"`).toBeDefined();
    }
    for (const btn of segDef?.cycleButtons ?? []) {
        expect(seg.constants[btn.constantsIdx], `${at} cycleButton "${String(btn.key)}"`).toBeDefined();
    }
    if (segDef?.slider) {
        const idx = segDef.slider.constantsIdx ?? 0;
        const key = String(segDef.slider.key);
        expect(key in seg || seg.constants[idx] !== undefined, `${at} slider "${key}"`).toBe(true);
    }
}

export function expectValidFileFormat(state: FileFormat, where = "") {
    expect(FORMATS, where).toContain(state.format);
    expect(VALID_FIELDS.has(state.field), `${where} field ${state.field}`).toBe(true);
    expect(state.formatDef?.segments, where).toBeDefined();
    expect(Array.isArray(state.path.segments), where).toBe(true);
    expect(typeof state.path.name, where).toBe("string");

    for (const [key, def] of Object.entries(defaultRobotConstants)) {
        const v = state.robot[key as keyof typeof defaultRobotConstants];
        expect(typeof v, `${where} robot.${key}`).toBe(typeof def);
        if (typeof v === "number") expect(Number.isFinite(v), `${where} robot.${key}`).toBe(true);
    }

    const ids = new Set<string>();
    for (const seg of state.path.segments) {
        expectValidSegment(seg, state.formatDef, state.format, where);
        expect(ids.has(seg.id), `${where} duplicate id ${seg.id}`).toBe(false);
        ids.add(seg.id);
    }
    if (state.path.segments.length > 0) expect(state.path.segments[0].kind, where).toBe("start");
}
