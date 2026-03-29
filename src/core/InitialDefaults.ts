import { cloneKRev, kBoomerang, kLootAt, kPilon, kTurn } from "./ReveiLibSim/RevConstants";
import { cloneKMik, kMikDrive, kMikHeading, kMikSwing, kMikTurn, type mikDriveConstants, type mikSwingConstants, type mikTurnConstants } from "./mikLibSim/MikConstants";
import type { revDriveConstants, revTurnConstants } from "./ReveiLibSim/RevConstants";
import { createObjectStore } from "./Store";
import { cloneLemConstants, kLemAngular, kLemLinear, type LemAngularConstants, type LemMoveConstants } from "./LemLibSim/LemConstants";

type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib" | "RW-Template" | "RevMecanum";

type SegmentKind = "pointDrive" | "poseDrive" | "pointTurn" | "angleTurn" | "angleSwing" | "pointSwing" | "distanceDrive" | "start" | "group";

export type { SegmentKind };

export type ConstantsByFormat = {
  mikLib: {
    distanceDrive: mikDriveConstants;
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
    start: undefined;
    group: string;
  };
  ReveilLib: {
    distanceDrive: revDriveConstants;
    pointDrive: revDriveConstants;
    poseDrive: revDriveConstants;
    pointTurn: revTurnConstants;
    angleTurn: revTurnConstants;
    angleSwing: revTurnConstants;
    pointSwing: revTurnConstants;
    start: undefined;
    group: string;
  };
  RevMecanum: {
    distanceDrive: revDriveConstants;
    pointDrive: revDriveConstants;
    poseDrive: revDriveConstants;
    pointTurn: revTurnConstants;
    angleTurn: revTurnConstants;
    angleSwing: revTurnConstants;
    pointSwing: revTurnConstants;
    start: undefined;
    group: string;
  };
  "JAR-Template": {
    distanceDrive: mikDriveConstants;
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
    start: undefined;
    group: string;
  };
  LemLib: {
    distanceDrive: LemMoveConstants;
    pointDrive: LemMoveConstants;
    poseDrive: LemMoveConstants;
    pointTurn: LemAngularConstants;
    angleTurn: LemAngularConstants;
    angleSwing: LemAngularConstants;
    pointSwing: LemAngularConstants;
    start: undefined;
    group: string;
  };
  "RW-Template": {
    distanceDrive: mikDriveConstants;
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
    start: undefined;
    group: string;
  };
};

export type DefaultConstant = {
    [F in Format]: {
        [K in keyof ConstantsByFormat[F] & SegmentKind]: ConstantsByFormat[F][K];
    }
};

export const INITIAL_DEFAULTS: DefaultConstant = {
    mikLib: {
        distanceDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        pointDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        poseDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        pointTurn: { turn: cloneKMik(kMikTurn) },
        angleTurn: { turn: cloneKMik(kMikTurn) },
        angleSwing: { swing: cloneKMik(kMikSwing) },
        pointSwing: { swing: cloneKMik(kMikSwing) },
        group: "",
        start: undefined,
    },

    ReveilLib: {
        distanceDrive: { drive: cloneKRev(kPilon) },
        pointDrive: { drive: cloneKRev(kPilon) },
        poseDrive: { drive: cloneKRev(kBoomerang) },
        pointTurn: { turn: cloneKRev(kLootAt) },
        angleTurn: { turn: cloneKRev(kTurn) },
        angleSwing: { turn: cloneKRev(kTurn) },
        pointSwing: { turn: cloneKRev(kTurn) },
        group: "",
        start: undefined,
    },
    RevMecanum: {
        distanceDrive: { drive: cloneKRev(kPilon) },
        pointDrive: { drive: cloneKRev(kPilon) },
        poseDrive: { drive: cloneKRev(kBoomerang) },
        pointTurn: { turn: cloneKRev(kLootAt) },
        angleTurn: { turn: cloneKRev(kTurn) },
        angleSwing: { turn: cloneKRev(kTurn) },
        pointSwing: { turn: cloneKRev(kTurn) },
        group: "",
        start: undefined,     
    },
    "JAR-Template": {
        distanceDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        pointDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        poseDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        pointTurn: { turn: cloneKMik(kMikTurn) },
        angleTurn: { turn: cloneKMik(kMikTurn) },
        angleSwing: { swing: cloneKMik(kMikSwing) },
        pointSwing: { swing: cloneKMik(kMikSwing) },
        group: "",
        start: undefined,
    },

    LemLib: {
        distanceDrive: { lateral: cloneLemConstants(kLemLinear), angular: cloneLemConstants(kLemAngular) },
        pointDrive: { lateral: cloneLemConstants(kLemLinear), angular: cloneLemConstants(kLemAngular) },
        poseDrive: { lateral: cloneLemConstants(kLemLinear), angular: cloneLemConstants(kLemAngular) },
        pointTurn: { angular: cloneLemConstants(kLemAngular) },
        angleTurn: { angular: cloneLemConstants(kLemAngular) },
        angleSwing: { angular: cloneLemConstants(kLemAngular) },
        pointSwing: { angular: cloneLemConstants(kLemAngular) },
        group: "",
        start: undefined,
    },

    "RW-Template": {
        distanceDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        pointDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        poseDrive: { drive: cloneKMik(kMikDrive), heading: cloneKMik(kMikHeading) },
        pointTurn: { turn: cloneKMik(kMikTurn) },
        angleTurn: { turn: cloneKMik(kMikTurn) },
        angleSwing: { swing: cloneKMik(kMikSwing) },
        pointSwing: { swing: cloneKMik(kMikSwing) },
        group: "",
        start: undefined,
    },
};

export const globalDefaultsStore = createObjectStore<DefaultConstant>(INITIAL_DEFAULTS);

export function getDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K): ConstantsByFormat[F][K] {
    const state = globalDefaultsStore.getState() ?? INITIAL_DEFAULTS;
    const constant = state?.[format]?.[kind] ?? INITIAL_DEFAULTS[format][kind];

    if (!constant) return constant;

    const deepClone = (obj: unknown): ConstantsByFormat[F][K] => {
        const o = obj as Record<string, unknown>;
        if ('drive' in o && 'heading' in o) {
            return { drive: cloneKMik(o.drive as Parameters<typeof cloneKMik>[0]), heading: cloneKMik(o.heading as Parameters<typeof cloneKMik>[0]) } as ConstantsByFormat[F][K];
        }
        if ('turn' in o) {
            return { turn: cloneKMik(o.turn as Parameters<typeof cloneKMik>[0]) } as ConstantsByFormat[F][K];
        }
        if ('swing' in o) {
            return { swing: cloneKMik(o.swing as Parameters<typeof cloneKMik>[0]) } as ConstantsByFormat[F][K];
        }
        if ('lateral' in o && 'angular' in o) {
            return { lateral: cloneLemConstants(o.lateral as Parameters<typeof cloneLemConstants>[0]), angular: cloneLemConstants(o.angular as Parameters<typeof cloneLemConstants>[0]) } as ConstantsByFormat[F][K];
        }
        if ('angular' in o) {
            return { angular: cloneLemConstants(o.angular as Parameters<typeof cloneLemConstants>[0]) } as ConstantsByFormat[F][K];
        }
        return { ...o } as ConstantsByFormat[F][K];
    };

    return deepClone(constant);
}
