import { clamp } from "../../core/Util";
import type { Segment } from "../../core/Types/Segment";
import {
    getDefaultConstants, resolveKind,
    type ActionButtonField, type ConstantValue, type ConstantsRecord, type CycleButtonField,
    type Format, type FormatDef, type SegmentConstants, type SegmentKind, type SliderField,
} from "../../simulation/FormatDefinition";
import { FIELD_COLORS } from "../Field/FieldColors";
import type { ImageKey } from "../Util/CycleButton";

/**
 * Everything the path menu draws for one segment, read straight off formatDef. The menu renders
 * this and nothing else: no component derives values, defaults, or which store slot a field lives
 * in on its own. Edits go back through SegmentEdits, which takes the same FieldSource.
 */

/**
 * Where a field's value is stored. Formats name their inputs by key alone, and a key can address
 * either an entry in the segment's constants or a number the segment carries itself (`time`,
 * `distance`); the constants entry wins so a format can shadow one deliberately.
 */
export type FieldSource =
    | { on: "segment"; key: SegmentNumericKey }
    | { on: "constants"; idx: number; key: string };

/** The keys a segment keeps a number under itself, rather than in one of its constants entries. */
export type SegmentNumericKey = { [K in keyof Segment]-?: Segment[K] extends number ? K : never }[keyof Segment];

/**
 * What "default" means for those, since formatDef has nowhere to keep one. Typed against the
 * segment, so a new numeric field on it has to be given a default here before this compiles.
 */
const SEGMENT_FIELD_DEFAULTS: Record<SegmentNumericKey, number> = { distance: 0, time: 0 };

export type NumberInputSettings = {
    bounds: [number, number];
    stepSize: number;
    roundTo: number;
};

export type FieldView = {
    key: string;
    label: string;
    units: string;
    input?: NumberInputSettings;
    source: FieldSource;
    value: ConstantValue | undefined;
    defaultValue: ConstantValue | undefined;
};

export type GroupView = {
    header: string;
    constantsIdx: number;
    fields: FieldView[];
    /** False when the group holds nothing formatDef can store, so "Default" has nowhere to write. */
    canSetDefault: boolean;
};

export type CycleView = {
    def: CycleButtonField;
    /** The constants key itself: the tooltip names the parameter the generated code will carry. */
    label: string;
    value: string;
    imageKeys: [ImageKey, ImageKey, ...ImageKey[]];
};

export type SliderView = {
    source: FieldSource;
    value: number;
    min: number;
    max: number;
    /** Increment the value snaps to, in value units rather than percent. */
    roundTo: number;
    decimals: number;
};

export type SegmentView = {
    /** The kind the format actually implements, after following castTo. */
    kind: SegmentKind;
    name: string;
    accentColor: string;
    slider: SliderView | null;
    cycleButtons: CycleView[];
    actions: ActionButtonField[];
    groups: GroupView[];
};

const isSegmentNumericKey = (key: string): key is SegmentNumericKey => key in SEGMENT_FIELD_DEFAULTS;

const constantsAt = (constants: SegmentConstants<Format>, idx: number): ConstantsRecord | undefined =>
    constants[idx] as unknown as ConstantsRecord | undefined;

export function fieldSource(segment: Segment, constantsIdx: number, key: string): FieldSource {
    const constants = constantsAt(segment.constants, constantsIdx);
    if (isSegmentNumericKey(key) && !(constants && key in constants)) return { on: "segment", key };
    return { on: "constants", idx: constantsIdx, key };
}

export function readField(segment: Segment, source: FieldSource): ConstantValue | undefined {
    return source.on === "segment"
        ? segment[source.key]
        : constantsAt(segment.constants, source.idx)?.[source.key];
}

function readDefault(defaults: SegmentConstants<Format>, source: FieldSource): ConstantValue | undefined {
    return source.on === "segment"
        ? SEGMENT_FIELD_DEFAULTS[source.key]
        : (defaults[source.idx] as unknown as ConstantsRecord | undefined)?.[source.key];
}

/** The field layer colors a segment by its own kind, so the row's accent bar has to agree. */
function accentColor(kind: SegmentKind): string {
    return FIELD_COLORS.segmentColors[kind]?.[0]?.baseColor.replace(/,\s*[\d.]+\)$/, ", 1)") ?? "";
}

function buildSlider(def: SliderField | undefined, segment: Segment): SliderView | null {
    if (!def) return null;
    const source = fieldSource(segment, def.constantsIdx ?? 0, String(def.key));
    const value = readField(segment, source);
    const [min, max] = def.bounds;
    return {
        source,
        value: typeof value === "number" ? value : 0,
        min,
        max,
        roundTo: def.roundTo,
        decimals: max > 99.9 ? 0 : max > 9.9 ? 1 : 2,
    };
}

function buildCycle(def: CycleButtonField, segment: Segment): CycleView {
    const key = String(def.key);
    return {
        def,
        label: key,
        value: def.poseValue
            ? def.poseValue(segment.pose)
            : String(constantsAt(segment.constants, def.constantsIdx)?.[key]),
        imageKeys: def.keyValues.map(kv => ({ src: kv.srcImg, key: String(kv.value) })) as CycleView["imageKeys"],
    };
}

export function buildSegmentView(formatDef: FormatDef<Format>, segment: Segment): SegmentView {
    // An alias entry keeps its own name ("Follow Path") but borrows every control from the kind it
    // casts to, which is where its constants came from
    const alias = formatDef.segments[segment.kind];
    const kind = resolveKind(formatDef, segment.kind);
    const segDef = formatDef.segments[kind] ?? alias;
    const defaults = getDefaultConstants(formatDef, segment.format, kind);

    const groups = (segDef?.numberInputs ?? []).map(group => {
        const fields = group.fields.map(field => {
            const key = String(field.key);
            const source = fieldSource(segment, group.constantsIdx, key);
            return {
                key,
                label: field.label,
                units: field.units,
                input: field.input,
                source,
                value: readField(segment, source),
                defaultValue: readDefault(defaults, source),
            };
        });
        return {
            header: group.headerName,
            constantsIdx: group.constantsIdx,
            fields,
            canSetDefault: fields.some(f => f.source.on === "constants"),
        };
    });

    return {
        kind,
        name: alias?.name ?? segDef?.name ?? "",
        accentColor: accentColor(segment.kind),
        slider: buildSlider(segDef?.slider, segment),
        cycleButtons: (segDef?.cycleButtons ?? []).map(def => buildCycle(def, segment)),
        actions: segDef?.actionButtons ?? [],
        groups,
    };
}

/** The Slider component works in 0-100, so the view's value has to be mapped both ways. */
export const sliderPercent = (slider: SliderView): number =>
    slider.max === slider.min ? 0 : ((slider.value - slider.min) / (slider.max - slider.min)) * 100;

export const sliderStep = (slider: SliderView): number | undefined =>
    slider.roundTo === undefined || slider.max === slider.min
        ? undefined
        : (slider.roundTo / (slider.max - slider.min)) * 100;

/** Snapped to the format's increment: the percent round trip otherwise lands on 8.000000000000002. */
export function sliderValueAt(slider: SliderView, percent: number): number {
    const raw = slider.min + (clamp(percent, 0, 100) / 100) * (slider.max - slider.min);
    if (!slider.roundTo) return raw;
    return Number((Math.round(raw / slider.roundTo) * slider.roundTo).toFixed(6));
}
