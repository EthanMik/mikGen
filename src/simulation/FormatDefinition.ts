import { LemLibDef, type LemConstants } from "./LemLibSim/LemConstants";
import type { mikConstants } from "./mikLibSim/MikConstants";
import type { ReveilLibConstants } from "./ReveiLibSim/RevConstants";
import type { RevMecanumConstants } from "./RevMecanumSim/RevMecanumConstant";
import type { Robot } from "../core/Robot";
import type { Dispatch, SetStateAction } from "react";
import type { Path } from "../core/Types/Path";

export type Format =
    "mikLib"
    | "ReveilLib"
    | "JAR-Template"
    | "LemLib"
    | "RW-Template"
    | "RevMecanum"

export type SegmentKind =
    | "pointDrive"
    | "poseDrive"
    | "pointTurn"
    | "angleTurn"
    | "angleSwing"
    | "pointSwing"
    | "distanceDrive"
    | "start"

export type FormatConstants = {
    mikLib: mikConstants;
    ReveilLib: ReveilLibConstants;
    "JAR-Template": mikConstants;
    LemLib: LemConstants;
    RevMecanum: RevMecanumConstants;
    "RW-Template": mikConstants;
};

export type FormatDef<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>> = Partial<Record<SegmentKind, SegmentDef<F>>>> = {
    constants: SegmentConstants<F>;
    kMaxSpeed: number;
    formatPathName: string;
    slider: SliderField<F>;
    segments: Segs;
    kBuilder?: (kDefault: SegmentConstants<F>, k: SegmentConstants<F>) => string;
};

export type SegmentDef<F extends Format = Format> = {
    defaults: SegmentConstants<F>;
    toStringTemplate: string;
    name: string;
    exists: boolean,
    simFn: SegmentFactory<F>;
    cycleButtons: CycleButtonField<F>[];
    numberInputs: NumberInputGroup<F>[];
};

export type SimFn = (robot: Robot, dt: number) => [boolean, SegmentKind, number];

export function forSegments<F extends Format, K extends SegmentKind>(
    keys: K[],
    def: SegmentDef<F>
): Record<K, SegmentDef<F>> {
    return Object.fromEntries(keys.map(k => [k, def])) as Record<K, SegmentDef<F>>;
}

export type SegmentConstants<F extends Format> = [FormatConstants[F], ...FormatConstants[F][]];

type SliderField<F extends Format = Format> = {
    key: keyof FormatConstants[F];
    bounds: [number, number];
    roundTo: number;
}

export type CycleButtonField<F extends Format = Format,
    K extends keyof FormatConstants[F] = keyof FormatConstants[F],
> = {
    constantsIdx: number;
    key: K;
    keyValues: {
        srcImg: string;
        value: FormatConstants[F][K];
    }[];
}

export type NumberInputGroup<F extends Format = Format> = {
    constantsIdx: number;
    headerName: string;
    fields: {
        key: keyof FormatConstants[F];
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
    angle: number,
    constants: SegmentConstants<F>
) => boolean;

export type ConstantValue = number | boolean | string;
export type ConstantsRecord = Record<string, ConstantValue>;

export const FORMAT_REGISTRY = {
    LemLib: LemLibDef,
    mikLib: LemLibDef,
    ReveilLib: LemLibDef,
    "JAR-Template": LemLibDef,
    "RW-Template": LemLibDef,
    RevMecanum: LemLibDef,
} as unknown as { [F in Format]: FormatDef<F> };

export function mergeFormatDef(registry: FormatDef<Format>, saved: unknown): FormatDef<Format> {
    if (!saved || typeof saved !== 'object') return registry;
    const s = saved as Record<string, unknown>;
    const segs = { ...registry.segments } as Record<SegmentKind, SegmentDef<Format>>;
    for (const [k, v] of Object.entries((s.segments ?? {}) as object)) {
        const reg = segs[k as SegmentKind];
        if (reg) segs[k as SegmentKind] = { ...reg, ...(v as object), simFn: reg.simFn };
    }
    return { ...registry, ...s, kBuilder: registry.kBuilder, segments: segs } as FormatDef<Format>;
}

export function getDefaultConstants<F extends Format>(format: F, kind: SegmentKind): SegmentConstants<F> {
    const def = FORMAT_REGISTRY[format];
    return (def.segments[kind]?.defaults ?? def.constants) as SegmentConstants<F>;
}

export function updateDefaultConstants<F extends Format>(
    formatDef: FormatDef<Format>,
    kind: SegmentKind,
    idx: number,
    patch: Partial<FormatConstants[F]>
): FormatDef<Format> {
    const segDef = formatDef.segments[kind];
    if (!segDef) return formatDef;
    const newDefaults = segDef.defaults.map((c, i) =>
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
