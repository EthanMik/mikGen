import { clamp } from "../../core/Util";
import type { Path } from "../../core/Types/Path";
import type { Segment } from "../../core/Types/Segment";
import {
    resolveKind, updateDefaultConstants,
    type ActionButtonField, type ConstantValue, type ConstantsRecord, type Format,
    type FormatConstants, type FormatDef, type SegmentConstants, type SegmentKind,
} from "../../simulation/FormatDefinition";
import { deselectControls } from "../Field/FieldUtils";
import type { CycleView, FieldSource, GroupView } from "./SegmentView";

/**
 * Every edit the path menu can make, as plain transforms. Each returns the path it was given when
 * nothing changed, so callers can tell an edit from a no-op and skip the undo snapshot.
 */

export type SelectMode = "exclusive" | "toggle" | "range";

/** Which segments an edit lands on: one row, or every row of a kind for "Apply". */
export type EditTarget = { segmentId: string } | { kind: SegmentKind };

const hits = (segment: Segment, target: EditTarget): boolean =>
    "segmentId" in target ? segment.id === target.segmentId : segment.kind === target.kind;

/** Mirrors selectControlInPath, so a row and a control answer to the same three gestures. */
export function selectSegment(path: Path, segmentId: string, mode: SelectMode): Path {
    if (mode === "toggle") {
        const willSelect = !path.segments.find(s => s.id === segmentId)?.selected;
        return {
            ...path,
            segments: path.segments.map(s => s.id === segmentId ? { ...s, selected: willSelect } : s),
        };
    }

    // Exclusive and range take ownership of the selection from the controls; ctrl only ever
    // toggles its own row
    const segments = deselectControls(path.segments);

    if (mode === "exclusive") {
        return { ...path, segments: segments.map(s => ({ ...s, selected: s.id === segmentId })) };
    }

    const clickedIdx = segments.findIndex(s => s.id === segmentId);
    if (clickedIdx === -1) return path;

    // The range runs from the last row already selected, so a shift click extends the newest end
    let anchorIdx = clickedIdx;
    for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i].selected) { anchorIdx = i; break; }
    }

    const start = Math.min(anchorIdx, clickedIdx);
    const end = Math.max(anchorIdx, clickedIdx);
    return { ...path, segments: segments.map((s, i) => ({ ...s, selected: i >= start && i <= end })) };
}

/** The row and the whole selection move together, and anything still visible hides first. */
export function toggleSegmentVisibility(path: Path, segmentId: string): Path {
    const affected = path.segments.filter(s => s.id === segmentId || s.selected);
    if (affected.length === 0) return path;
    const visible = !affected.some(s => s.visible);
    return {
        ...path,
        segments: path.segments.map(s => s.id === segmentId || s.selected ? { ...s, visible } : s),
    };
}

export function writeFields(
    path: Path,
    target: EditTarget,
    writes: { source: FieldSource; value: ConstantValue }[],
): Path {
    const segmentPatch: Record<string, ConstantValue> = {};
    const constantsPatches = new Map<number, ConstantsRecord>();

    for (const { source, value } of writes) {
        if (source.on === "segment") segmentPatch[source.key] = value;
        else constantsPatches.set(source.idx, { ...constantsPatches.get(source.idx), [source.key]: value });
    }

    const patchesSegment = Object.keys(segmentPatch).length > 0;
    if (!patchesSegment && constantsPatches.size === 0) return path;

    return {
        ...path,
        segments: path.segments.map(s => {
            if (!hits(s, target)) return s;
            const constants = constantsPatches.size === 0
                ? s.constants
                : s.constants.map((entry, i) => {
                    const patch = constantsPatches.get(i);
                    return patch ? { ...(entry as object), ...patch } as unknown as FormatConstants[Format] : entry;
                }) as SegmentConstants<Format>;
            return { ...s, ...segmentPatch, constants };
        }),
    };
}

/** Keys the group does not declare are ignored: a group only ever writes its own fields. */
export function writeGroup(path: Path, target: EditTarget, group: GroupView, partial: ConstantsRecord): Path {
    return writeFields(path, target, group.fields.flatMap(field =>
        field.key in partial ? [{ source: field.source, value: partial[field.key] }] : []
    ));
}

export function pressAction(path: Path, segmentId: string, action: ActionButtonField): Path {
    const idx = path.segments.findIndex(s => s.id === segmentId);
    if (idx === -1) return path;
    const patch = action.onPress(path, idx);
    if (!patch) return path;
    return { ...path, segments: path.segments.map((s, i) => i === idx ? { ...s, ...patch } : s) };
}

/**
 * A turnPose-backed button writes only the turnPose; every other one writes its constants key. The
 * two are not exclusive: LemLib and EZ back the offset with a real key and patch the turnPose too.
 */
export function cycle(path: Path, segmentId: string, view: CycleView, rawKey: string | null): Path {
    const match = view.def.keyValues.find(kv => String(kv.value) === rawKey);
    if (match === undefined) return path;

    const turnPosePatch = view.def.turnPoseEffect?.(match.value as never);
    const writes = view.def.turnPoseValue
        ? []
        : [{ source: { on: "constants" as const, idx: view.def.constantsIdx, key: String(view.def.key) }, value: match.value as ConstantValue }];

    const next = writeFields(path, { segmentId }, writes);
    if (!turnPosePatch) return next;
    return {
        ...next,
        segments: next.segments.map(s => s.id === segmentId ? { ...s, turnPose: { ...s.turnPose, ...turnPosePatch } } : s),
    };
}

/** Segment-backed fields are skipped: formatDef has nowhere to keep a default for `time`. */
export function setGroupDefaults(
    formatDef: FormatDef<Format>,
    kind: SegmentKind,
    group: GroupView,
    partial: ConstantsRecord,
): FormatDef<Format> {
    const patch: ConstantsRecord = {};
    for (const field of group.fields) {
        if (field.source.on === "constants" && field.key in partial) patch[field.key] = partial[field.key];
    }
    if (Object.keys(patch).length === 0) return formatDef;
    return updateDefaultConstants(
        formatDef,
        resolveKind(formatDef, kind),
        group.constantsIdx,
        patch as Partial<FormatConstants[Format]>,
    );
}

/** Dragging a selected row carries the whole selection; dragging an unselected one carries itself. */
export function buildDraggingIds(segments: Segment[], segmentId: string): string[] {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment?.selected) return [segmentId];
    const selectedIds = segments.filter((s, idx) => s.selected && idx > 0).map(s => s.id);
    return selectedIds.length > 0 ? selectedIds : [segmentId];
}

/**
 * Moves every dragged row to `toIndex`, keeping their relative order. The start pose stays at index
 * 0, so a drag that would displace it is refused outright rather than clamped.
 */
export function moveSegments(path: Path, ids: string[], toIndex: number): Path {
    if (ids.length === 0) return path;

    const original = path.segments;
    const fromIndices = ids.map(id => original.findIndex(s => s.id === id));
    if (fromIndices.some(idx => idx <= 0)) return path;

    const moving = new Set(ids);
    const dropTarget = toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;
    if (dropTarget && moving.has(dropTarget.id)) return path;

    const sorted = [...fromIndices].sort((a, b) => a - b);
    const segments = original.filter(s => !moving.has(s.id));
    // The rows above the drop point are gone by the time it is inserted into
    const insertIdx = clamp(toIndex - sorted.filter(idx => idx < toIndex).length, 1, segments.length);
    segments.splice(insertIdx, 0, ...sorted.map(idx => original[idx]));

    // A drag that lands everything back where it started is not an edit, and must not push an undo
    if (segments.every((s, i) => s === original[i])) return path;
    return { ...path, segments };
}
