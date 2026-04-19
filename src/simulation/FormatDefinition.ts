import type { LemConstants } from "./LemLibSim/LemConstants";
import type { mikConstants } from "./mikLibSim/MikConstants";
import type { ReveilLibConstants } from "./ReveiLibSim/RevConstants";
import type { RevMecanumConstants } from "./RevMecanumSim/RevMecanumConstant";
import type { Robot } from "../core/Robot";
import type { Segment } from "../core/Types/Segment";

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
    segments: Segs;
    motionListFields: MotionListFields<F>;
    kBuilder?: (kDefault: SegmentConstants<F>, k: SegmentConstants<F>) => string;
};

export type SegmentDef<F extends Format = Format> = {
    defaults: SegmentConstants<F>;
    toStringTemplate: string;
    name: string;
    simFn: SegmentFactory<F>;
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

type CycleButtonField<F extends Format = Format,
    K extends keyof FormatConstants[F] = keyof FormatConstants[F],
> = {
    key: K;
    keyValues: {
        srcImg: string;
        value: FormatConstants[F][K];
    }[];
}

type NumberInputField<F extends Format = Format> = {
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

type MotionListFields<F extends Format = Format> = {
    slider: SliderField<F>;
    cycleButtons: CycleButtonField<F>[];
    numberInputs: NumberInputField<F>[];
    constants: SegmentConstants<F>
}

type SegmentFactory<F extends Format = Format> = (
    robot: Robot,
    dt: number,
    x: number,
    y: number,
    angle: number,
    constants: SegmentConstants<F>
) => boolean;