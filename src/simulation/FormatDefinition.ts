import { LemLibDef, type LemConstants } from "./LemLibSim/LemConstants";
import { mikLibDef, type mikConstants } from "./mikLibSim/MikConstants";
import { reveilLibDef, type ReveilLibConstants } from "./ReveiLibSim/RevConstants";
import type { Robot } from "../core/Robot";
import type { Dispatch, SetStateAction } from "react";
import type { Path } from "../core/Types/Path";
import type { Coordinate } from "../core/Types/Coordinate";
import type { Pose } from "../core/Types/Pose";
import { holonomicDef } from "./HolonomicSim/HolonomicConstants";
import { fileFormatStore } from "../hooks/useFileFormat";
import type { Segment } from "../core/Types/Segment";
import { JarTemplateDef, type JarConstants } from "./JarSim/JarConstants";
import { EZTemplateDef, type EZconstants } from "./EZSim/EZConstants";

export type Format =
    "mikLib"
    | "ReveilLib"
    | "JAR-Template"
    | "LemLib"
    | "RW-Template"
    | "Holonomic"
    | "EZ-Template"

export type SegmentKind =
    | "pointDrive"
    | "poseDrive"
    | "pointTurn"
    | "angleTurn"
    | "angleSwing"
    | "pointSwing"
    | "distanceDrive"
    | "strafeDrive"
    | "bezierCurve"
    | "start"
    | "wait"

export type FormatConstants = {
    mikLib: mikConstants;
    ReveilLib: ReveilLibConstants;
    "JAR-Template": JarConstants;
    LemLib: LemConstants;
    "Holonomic": mikConstants;
    "RW-Template": mikConstants;
    "EZ-Template": EZconstants;
};

export const FORMAT_REGISTRY = {
    LemLib: LemLibDef,
    mikLib: mikLibDef,
    ReveilLib: reveilLibDef,
    "JAR-Template": JarTemplateDef,
    "RW-Template": LemLibDef,
    Holonomic: holonomicDef,
    "EZ-Template": EZTemplateDef,

} as unknown as { [F in Format]: FormatDef<F> };


export type FormatDef<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>> = Partial<Record<SegmentKind, SegmentDef<F>>>> = {
    constants: SegmentConstants<F>;
    kMaxSpeed: number;
    formatPathName: string;
    segments: Segs;
    kBuilder?: (kDefault: SegmentConstants<F>, k: SegmentConstants<F>, pose?: Pose, kind?: SegmentKind) => string;
    kParser?: (kDefault: SegmentConstants<F>, kBuilderStr: string, kind: SegmentKind) => [SegmentConstants<F>, Partial<Pose>?];
};

export type SegmentDef<F extends Format = Format> = {
    defaults?: SegmentConstants<F>;
    toStringTemplate?: string;
    name?: string;
    castTo?: SegmentKind
    /** Heading a newly placed segment starts on. Left unset, kinds with an optional heading start with none. */
    defaultHeading?: number;
    simFn?: SegmentFactory<F>;
    simReset?: () => void;
    cycleButtons?: CycleButtonField<F>[];
    actionButtons?: ActionButtonField[];
    numberInputs?: NumberInputGroup<F>[];
    slider?: SliderField<F>;
};

/**
 * A one-shot button in the segment row, for edits a cycle button cannot express.
 * Returns the patch to apply to the segment, or undefined to do nothing.
 */
export type ActionButtonField = {
    srcImg: string;
    label: string;
    onPress: (path: Path, idx: number) => Partial<Segment> | undefined;
};

export type SimFn = (robot: Robot, dt: number) => [boolean, SegmentKind, number];

export function forSegments<F extends Format, K extends SegmentKind>(
    keys: K[],
    def: SegmentDef<F>
): Record<K, SegmentDef<F>> {
    return Object.fromEntries(keys.map(k => [k, def])) as Record<K, SegmentDef<F>>;
}

export type SegmentConstants<F extends Format> = [FormatConstants[F], ...FormatConstants[F][]];

export type SliderField<F extends Format = Format> = {
    key: keyof FormatConstants[F] | keyof Segment;
    bounds: [number, number];
    roundTo: number;
    constantsIdx?: number;
}

export type CycleButtonField<F extends Format = Format,
    K extends keyof FormatConstants[F] = keyof FormatConstants[F],
> = {
    constantsIdx: number;
    key: K | (string & {});
    keyValues: {
        srcImg: string;
        value: FormatConstants[F][K] | string;
    }[];
    poseEffect?: (newValue: FormatConstants[F][K] | string) => Partial<Pose> | undefined;
    // When set, the button state derives from the segment's pose instead of a constants key
    poseValue?: (pose: Pose) => string;
}

export type NumberInputGroup<F extends Format = Format> = {
    constantsIdx: number;
    headerName: string;
    fields: {
        key: keyof FormatConstants[F] | keyof Segment;
        units: string;
        label: string;
        input: {
            bounds: [number, number];
            stepSize: number;
            roundTo: number;
        }
    }[];
}

export type SegmentFactory<F extends Format = Format> = (
    robot: Robot,
    dt: number,
    x: number,
    y: number,
    angle: number | null,
    constants: SegmentConstants<F>,
    /** Pre-sampled trajectory, only supplied for path-following kinds like bezierCurve. */
    points?: Coordinate[]
) => boolean;

export type ConstantValue = number | boolean | string;
export type ConstantsRecord = Record<string, ConstantValue>;

/**
 * Rebuilds a saved constants array on top of the current one, entry by entry and key by key.
 * A file saved before a segment kind grew a constants entry (or an entry grew a key) comes back
 * short, and the motions index into it blind; every load path funnels through here so they can't.
 */
export function mergeSavedConstants(
    current: SegmentConstants<Format> | undefined,
    saved: unknown,
): SegmentConstants<Format> | undefined {
    if (!current) return saved as SegmentConstants<Format> | undefined;
    if (!Array.isArray(saved)) return current;
    return current.map((def, i) =>
        saved[i] && typeof saved[i] === "object"
            ? { ...(def as object), ...(saved[i] as object) }
            : { ...(def as object) }
    ) as SegmentConstants<Format>;
}

/** Fills every segment's constants out to the current format definition, keeping the saved values. */
export function normalizePathConstants(formatDef: FormatDef<Format> | undefined, format: Format, path: Path): Path {
    return {
        ...path,
        segments: path.segments.map(seg => {
            const defaults = getDefaultConstants(formatDef, format, seg.kind);
            if (!defaults) return seg;
            const constants = mergeSavedConstants(defaults, seg.constants);
            return constants ? { ...seg, constants } : seg;
        }),
    };
}

export function mergeFormatDef(registry: FormatDef<Format>, saved: unknown): FormatDef<Format> {
    if (!saved || typeof saved !== 'object') return registry;
    const s = saved as Record<string, unknown>;
    const segs = { ...registry.segments } as Record<SegmentKind, SegmentDef<Format>>;
    for (const [k, v] of Object.entries((s.segments ?? {}) as object)) {
        const reg = segs[k as SegmentKind];
        if (reg) segs[k as SegmentKind] = {
            ...reg, ...(v as object),
            defaults: mergeSavedConstants(reg.defaults, (v as { defaults?: unknown }).defaults),
            simFn: reg.simFn,
            simReset: reg.simReset,
            cycleButtons: reg.cycleButtons,
            actionButtons: reg.actionButtons,
            numberInputs: reg.numberInputs,
            slider: reg.slider,
        };
    }
    return { ...registry, ...s, kBuilder: registry.kBuilder, kParser: registry.kParser, segments: segs } as FormatDef<Format>;
}

const SEGMENT_UI_KEYS = new Set(['simFn', 'simReset', 'cycleButtons', 'actionButtons', 'numberInputs', 'slider']);
const FORMAT_FN_KEYS = new Set(['kBuilder', 'kParser']);

export function stripFormatDefForSave(formatDef: FormatDef<Format>): object {
    const segments: Record<string, object> = {};
    for (const [k, seg] of Object.entries(formatDef.segments)) {
        segments[k] = Object.fromEntries(
            Object.entries(seg as object).filter(([key]) => !SEGMENT_UI_KEYS.has(key))
        );
    }
    return Object.fromEntries(
        Object.entries(formatDef as object)
            .filter(([key]) => !FORMAT_FN_KEYS.has(key))
            .map(([key, val]) => [key, key === 'segments' ? segments : val])
    );
}

export function getDefaultConstants<F extends Format>(formatDef: FormatDef<Format> | undefined, format: F, kind: SegmentKind): SegmentConstants<F> {
    const currentDefaults = formatDef?.segments[kind]?.defaults;
    if (currentDefaults === undefined) return FORMAT_REGISTRY[format].segments[kind]?.defaults as SegmentConstants<F>;
    return currentDefaults as SegmentConstants<F>;
}

export function updateDefaultConstants<F extends Format>(
    formatDef: FormatDef<Format>,
    kind: SegmentKind,
    idx: number,
    patch: Partial<FormatConstants[F]>
): FormatDef<Format> {
    const segDef = formatDef.segments[kind];
    if (!segDef) return formatDef;
    const newDefaults = segDef.defaults?.map((c, i) =>
        i === idx
            ? { ...(c as object), ...(patch as object) } as unknown as FormatConstants[Format]
            : c
    ) as SegmentConstants<Format>;
    return {
        ...formatDef,
        segments: {
            ...formatDef.segments,
            [kind]: { ...segDef, defaults: newDefaults },
        },
    };
}

export function changeFormat(newFormat: Format) {
    const newFormatDef = FORMAT_REGISTRY[newFormat] as FormatDef<Format>;
    fileFormatStore.setState(prev => ({
        ...prev,
        format: newFormat,
        formatDef: newFormatDef,
        path: {
            ...prev.path,
            name: newFormatDef.formatPathName,
            segments: prev.path.segments.map(s => {
                const newSegDef = newFormatDef.segments[s.kind];
                const castKind = newSegDef?.castTo ?? s.kind;
                return {
                    ...s,
                    format: newFormat,
                    kind: castKind,
                    constants: getDefaultConstants(undefined, newFormat, castKind),
                };
            }),
        },
    }));
}

export function updatePathConstants<F extends Format>(
    setPath: Dispatch<SetStateAction<Path>>,
    segmentId: string,
    idx: number,
    patch: Partial<FormatConstants[F]>
) {
    setPath((prev) => ({
        ...prev,
        segments: prev.segments.map((s) => {
            if (s.id !== segmentId) return s;
            const newConstants = s.constants.map((c, i) =>
                i === idx
                    ? { ...(c as object), ...(patch as object) } as unknown as FormatConstants[Format]
                    : c
            ) as SegmentConstants<Format>;
            return { ...s, constants: newConstants };
        }),
    }));
}

export function updatePathConstantsByKind<F extends Format>(
    setPath: Dispatch<SetStateAction<Path>>,
    segmentKind: SegmentKind,
    idx: number,
    patch: Partial<FormatConstants[F]>
) {
    setPath((prev) => ({
        ...prev,
        segments: prev.segments.map((s) => {
            if (s.kind !== segmentKind) return s;
            const newConstants = s.constants.map((c, i) =>
                i === idx
                    ? { ...(c as object), ...(patch as object) } as unknown as FormatConstants[Format]
                    : c
            ) as SegmentConstants<Format>;
            return { ...s, constants: newConstants };
        }),
    }));
}
