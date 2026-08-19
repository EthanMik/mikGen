import { defaultRobotConstants, type RobotConstants } from "./Robot"
import { propagateStates, turnHeadingAt, type Path } from "./Types/Path"
import { createSegment, type Segment } from "./Types/Segment"
import { normalizeDeg } from "./Util"
import type { ControlPoint, Pose } from "./Types/Pose"
import {
    FORMAT_REGISTRY, getDefaultConstants, mergeFormatDef, mergeSavedConstants, resolveKind,
    stripFormatDefForSave, type Format, type FormatDef,
} from "../simulation/FormatDefinition"

// One list, so the type and the runtime check can never drift apart
const FIELD_KEYS = [
    "pushback-v5-match", "pushback-v5-skills", "pushback-vexu-match",
    "override-v5-match", "override-v5-skills", "override-vexu-match", "override-vexu-skills",
    "highstakes-v5-match", "highstakes-v5-skills", "highstakes-vexu-match", "highstakes-vexu-skills",
    "empty",
] as const;

export type FieldType = typeof FIELD_KEYS[number];
export const VALID_FIELDS = new Set<FieldType>(FIELD_KEYS);

export type FileFormat = {
    format: Format,
    field: FieldType,
    formatDef: FormatDef<Format>,
    path: Path,
    robot: RobotConstants
}

export const DEFAULT_FIELD_KEY: FieldType = "override-v5-match";
const DEFAULT_FORMAT_KEY: Format = "mikLib";

export function newFileFormat(format: Format = DEFAULT_FORMAT_KEY, field: FieldType = DEFAULT_FIELD_KEY, name = ""): FileFormat {
    return {
        format,
        field,
        formatDef: FORMAT_REGISTRY[format] as FormatDef<Format>,
        path: { segments: [], name },
        robot: defaultRobotConstants,
    };
}

export const DEFAULT_FORMAT: FileFormat = newFileFormat(DEFAULT_FORMAT_KEY, DEFAULT_FIELD_KEY, "mikLib Path");

export function serializeFile(fileFormat: FileFormat): string {
    return JSON.stringify({ ...fileFormat, formatDef: stripFormatDefForSave(fileFormat.formatDef) });
}

/**
 * Returns undefined for anything that is not JSON, so a truncated file becomes a seeding fallback
 * instead of a throw at the call site. Older saves prefixed a version line that nothing was ever
 * keyed off; it is no longer written, but it still has to be skipped to open those files.
 */
function parseFileContent(content: string): unknown {
    for (const body of [content, content.slice(content.indexOf("\n") + 1)]) {
        try { return JSON.parse(body); } catch { /* fall through to the next candidate */ }
    }
    return undefined;
}

/**
 * The one way file content becomes store state. Seeding handles every version of the format,
 * legacy files included, so this cannot throw on a corrupt or hand-edited file. `repairs` comes
 * back non-empty when the file needed fixing up, which is the caller's cue to tell the user.
 */
export function deserializeToState(content: string, fileName: string, repairs: string[] = []): FileFormat {
    const seeded = seedFileFormat(parseFileContent(content), repairs);
    return { ...seeded, path: { ...seeded.path, name: fileName } };
}

const asRecord = (raw: unknown): Record<string, unknown> =>
    (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

const finite = (v: unknown, fallback: number): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;

/** Pose values are legitimately null (a turn has no position), so bad input degrades to null. */
const coord = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

const flag = (v: unknown, fallback: boolean): boolean =>
    typeof v === "boolean" ? v : fallback;

function seedPose(raw: unknown): Pose {
    const p = asRecord(raw);
    return { x: coord(p.x), y: coord(p.y), angle: coord(p.angle) };
}

/**
 * A turn's target, with the offset always a number so consumers never coalesce it themselves.
 * Files written before turnPose existed kept the offset on `pose.angle`; `migrated` moves it across
 * and leaves x/y null, so those turns keep aiming exactly where they used to (the forward waypoint,
 * or the positional fallback) instead of jumping to a coordinate they never stored.
 */
function seedTurnPose(raw: unknown, migrated: number | null): Pose {
    if (raw === undefined) return { x: null, y: null, angle: migrated ?? 0 };
    const p = asRecord(raw);
    return { x: coord(p.x), y: coord(p.y), angle: coord(p.angle) ?? 0 };
}

function seedControls(raw: unknown): ControlPoint[] {
    if (!Array.isArray(raw)) return [];
    return raw.map(c => ({ ...seedPose(c), selected: flag(asRecord(c).selected, false), visible: flag(asRecord(c).visible, true) }));
}

/**
 * Per-key merge, never all-or-nothing: a file saved before a constant existed keeps every value
 * it does have and picks up defaults for the rest, instead of losing its whole robot config.
 */
function seedRobot(raw: unknown, repairs: string[]): RobotConstants {
    const robot = asRecord(raw);
    const merged: Record<string, unknown> = { ...defaultRobotConstants };
    let reset = 0;
    for (const [key, def] of Object.entries(defaultRobotConstants)) {
        const value = robot[key];
        if (typeof value !== typeof def || (typeof value === "number" && !Number.isFinite(value))) { reset++; continue; }
        merged[key] = value;
    }
    if (reset > 0 && raw !== undefined) repairs.push(`${reset} robot constant(s) seeded with defaults`);
    return merged as RobotConstants;
}

/**
 * Builds from createSegment so every key exists with a usable value, then overlays only the saved
 * fields that survive validation. A segment can therefore never reach the store missing a key,
 * however old or hand-edited the file is.
 */
function seedSegment(formatDef: FormatDef<Format>, format: Format, raw: unknown, ids: Set<string>, repairs: string[]): Segment | null {
    if (!raw || typeof raw !== "object") {
        repairs.push("dropped a segment that was not an object");
        return null;
    }
    const s = raw as Record<string, unknown>;
    const savedKind = s.kind as Segment["kind"];
    if (!formatDef.segments[savedKind]) {
        repairs.push(`dropped segment of unknown kind "${String(s.kind)}"`);
        return null;
    }

    const kind = resolveKind(formatDef, savedKind);
    if (kind !== savedKind) repairs.push(`cast "${savedKind}" to "${kind}"`);

    const pose = seedPose(s.pose);
    // Keyed off the resolved kind, not the saved one: a pointSwing that casts to angleSwing keeps a
    // real heading on pose.angle, and clearing it would destroy the motion
    const isPointTurn = kind === "pointTurn" || kind === "pointSwing";
    const turnPose = seedTurnPose(s.turnPose, isPointTurn ? pose.angle : null);
    if (isPointTurn && s.turnPose === undefined) pose.angle = null;

    const base = createSegment(formatDef, format, kind, pose);
    const id = typeof s.id === "string" && s.id !== "" && !ids.has(s.id) ? s.id : base.id;
    ids.add(id);

    const constants = mergeSavedConstants(base.constants, s.constants) ?? base.constants;
    if (Array.isArray(s.constants) && s.constants.length !== constants.length) {
        repairs.push(`padded "${kind}" constants to ${constants.length} entries`);
    }

    return {
        ...base,
        id,
        ...(typeof s.groupId === "string" ? { groupId: s.groupId } : {}),
        selected: flag(s.selected, false),
        disabled: flag(s.disabled, false),
        visible: flag(s.visible, true),
        turnPose,
        turnLocked: flag(s.turnLocked, false),
        distance: finite(s.distance, 0),
        time: finite(s.time, 0),
        controls: seedControls(s.controls),
        constants,
    };
}

/**
 * Segment-level seeding for callers holding segments but no file, such as a clipboard paste whose
 * text came from a hand-edited .cpp. Deliberately does not apply the start-pose rule: these are
 * inserted into an existing path rather than becoming one.
 */
export function seedSegments(formatDef: FormatDef<Format>, format: Format, raw: unknown[]): Segment[] {
    const ids = new Set<string>();
    const repairs: string[] = [];
    return raw
        .map(s => seedSegment(formatDef, format, s, ids, repairs))
        .filter((s): s is Segment => s !== null);
}

function seedPath(formatDef: FormatDef<Format>, format: Format, raw: unknown, repairs: string[]): Path {
    const p = asRecord(raw);
    const name = typeof p.name === "string" ? p.name : "";

    if (!Array.isArray(p.segments)) {
        if (raw !== undefined) repairs.push("path had no usable segment list");
        return { name, segments: [] };
    }

    const ids = new Set<string>();
    const segments = p.segments
        .map(s => seedSegment(formatDef, format, s, ids, repairs))
        .filter((s): s is Segment => s !== null);

    // Everything downstream propagates from a known starting pose, so the first motion must be one
    if (segments.length > 0 && segments[0].kind !== "start") {
        segments[0] = { ...segments[0], kind: "start", constants: getDefaultConstants(formatDef, format, "start") };
        repairs.push("first motion was not a start pose");
    }
    return { name, segments };
}

/**
 * The one way untrusted data becomes a FileFormat. Never throws and never returns a hole: anything
 * it cannot make sense of is replaced with the correct default, and what it replaced is pushed to
 * `repairs` so the caller can tell the user their file is old.
 */
export function seedFileFormat(raw: unknown, repairs: string[] = []): FileFormat {
    const p = asRecord(raw);

    let format = DEFAULT_FORMAT.format;
    if (typeof p.format === "string" && p.format in FORMAT_REGISTRY) format = p.format as Format;
    else if (p.format !== undefined) repairs.push(`unknown format "${String(p.format)}"`);

    let field = DEFAULT_FIELD_KEY;
    if (VALID_FIELDS.has(p.field as FieldType)) field = p.field as FieldType;
    else if (p.field !== undefined) repairs.push(`unknown field "${String(p.field)}"`);

    // The saved def carries the user's edited defaults and templates, so it merges over the
    // registry rather than replacing it. "defaults" is what pre-1.0.0 files called this key.
    const formatDef = mergeFormatDef(FORMAT_REGISTRY[format] as FormatDef<Format>, p.formatDef ?? p.defaults);

    return {
        format,
        field,
        formatDef,
        robot: seedRobot(p.robot, repairs),
        path: seedPath(formatDef, format, p.path, repairs),
    };
}

/** Re-homes a path onto another format, casting every kind that format cannot represent. */
export function recastPath(formatDef: FormatDef<Format>, format: Format, path: Path): Path {
    // Read off the pre-cast path, so a turn that is about to lose its target can be resolved first
    const states = propagateStates(path);

    return {
        ...path,
        name: path.name || formatDef.formatPathName,
        segments: path.segments.map((s, i) => {
            const kind = resolveKind(formatDef, s.kind);
            const wasPointBased = s.kind === "pointTurn" || s.kind === "pointSwing";
            const nowAngleBased = kind === "angleTurn" || kind === "angleSwing";
            // A format with no turn-to-point casts to a heading turn, which has nowhere to keep a
            // target: bake in the absolute heading the point turn was resolving to
            const pose = wasPointBased && nowAngleBased
                ? { ...s.pose, angle: states[i].pos ? normalizeDeg(turnHeadingAt(path, i, states[i].pos!)) : 0 }
                : s.pose;

            return {
                ...s,
                pose,
                format,
                kind,
                constants: getDefaultConstants(formatDef, format, s.kind),
            };
        }),
    };
}

function loadAppState(): FileFormat {
    try {
        const saved = localStorage.getItem("appState");
        if (!saved) return DEFAULT_FORMAT;
        const repairs: string[] = [];
        // Not deserializeToState: the autosave keeps its own path name, it has no filename to take
        const state = seedFileFormat(parseFileContent(saved), repairs);
        // The boot path never alerts: a repaired autosave is not something to interrupt startup for
        if (repairs.length > 0) console.warn("Repaired saved state:", repairs);
        return state;
    } catch {
        return DEFAULT_FORMAT;
    }
}

export const VALIDATED_APP_STATE = loadAppState();
