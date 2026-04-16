import type { Format } from "../hooks/useFormat";
import { type SegmentKind } from "./InitialDefaults";
import type { LemConstants } from "./LemLibSim/LemConstants";
import { kLemLinear, kLemAngular } from "./LemLibSim/LemConstants";
import type { mikConstants } from "./mikLibSim/MikConstants";
import type { ReveilLibConstants } from "./ReveiLibSim/RevConstants";
import type { RevMecanumConstants } from "./RevMecanumSim/RevMecanumConstant";
import type { Robot } from "../core/Robot";

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
    constants: FormatConstants[F][]
}

type FormatConstants = {
    mikLib: mikConstants;
    ReveilLib: ReveilLibConstants;
    "JAR-Template": mikConstants;
    LemLib: LemConstants;
    RevMecanum: RevMecanumConstants;
    "RW-Template": mikConstants;
};

export type SimFn = (robot: Robot, dt: number) => [boolean, SegmentKind, number];

type SegmentFactory<F extends Format = Format> = (
    x: number,
    y: number,
    angle: number,
    constants: FormatConstants[F][],
    name: string,
    initialDefaults: FormatConstants[F][],
    toStringDef: string,
) => SimFn;

type SegmentDef<F extends Format = Format> = {
    initialDefaults: FormatConstants[F][];
    toStringTemplate: string;
    toSim: SegmentFactory<F>;
};

type FormatDef<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>>> = {
    constants: FormatConstants[F];
    kMaxSpeed: number;
    formatPathName: string;
    segments: Segs;
    motionListFields: MotionListFields<F>;
};

const LemLibDef: FormatDef<"LemLib", {
    poseDrive: SegmentDef<"LemLib">;
    pointDrive: SegmentDef<"LemLib">;
    pointTurn: SegmentDef<"LemLib">;
    angleTurn: SegmentDef<"LemLib">;
}> = {
    constants: kLemLinear,
    kMaxSpeed: 127,
    formatPathName: "LemLib",

    segments: {
        poseDrive: {
            initialDefaults: [kLemLinear],
            toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout})",
            toSim: (x, y, angle, constants, name, initialDefaults, toStringDef) => {
                return (robot, dt) => [false, "poseDrive", 0];
            },
        },
        pointDrive: {
            initialDefaults: [kLemLinear],
            toStringTemplate: "chassis.moveToPoint(${x}, ${y}, ${timeout})",
            toSim: (x, y, angle, constants, name, initialDefaults, toStringDef) => {
                return (robot, dt) => [false, "pointDrive", 0];
            },
        },
        pointTurn: {
            initialDefaults: [kLemAngular],
            toStringTemplate: "chassis.turnToPoint(${x}, ${y}, ${timeout})",
            toSim: (x, y, angle, constants, name, initialDefaults, toStringDef) => {
                return (robot, dt) => [false, "pointTurn", 0];
            },
        },
        angleTurn: {
            initialDefaults: [kLemAngular],
            toStringTemplate: "chassis.turnToHeading(${angle}, ${timeout})",
            toSim: (x, y, angle, constants, name, initialDefaults, toStringDef) => {
                return (robot, dt) => [false, "angleTurn", 0];
            },
        },
    },
    motionListFields: {
        slider: {
            key: "maxSpeed",
            bounds: [0, 127],
            roundTo: 1
        },
        cycleButtons: [],
        numberInputs: [],
        constants: []
    }
};
