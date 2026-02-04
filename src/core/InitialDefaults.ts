import { cloneKRev, kBoomerang, kLootAt, kPilon, kTurn } from "./ReveiLibSim/RevConstants";
import { clonePID, kMikAngleSwing, kMikAngleTurn, kMikBoomerang, kMikBoomerangHeading, kMikDistanceDrive, kMikDistanceDriveHeading, kMikPointDrive, kMikPointDriveHeading, kMikPointSwing, kMikPointTurn } from "./mikLibSim/MikConstants";
import type { mikDriveConstants, mikSwingConstants, mikTurnConstants } from "./mikLibSim/MikConstants";
import type { revDriveConstants, revTurnConstants } from "./ReveiLibSim/RevConstants";
import { createObjectStore } from "./Store";

type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib" | "RW-Template"

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
        distanceDrive: { drive: clonePID(kMikDistanceDrive), heading: clonePID(kMikDistanceDriveHeading) },
        pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
        pointTurn: { turn: clonePID(kMikPointTurn) },
        angleTurn: { turn: clonePID(kMikAngleTurn) },
        angleSwing: { swing: clonePID(kMikAngleSwing) },
        pointSwing: { swing: clonePID(kMikPointSwing) },
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

    "JAR-Template": {
        distanceDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
        pointTurn: { turn: clonePID(kMikPointTurn) },
        angleTurn: { turn: clonePID(kMikAngleTurn) },
        angleSwing: { swing: clonePID(kMikAngleSwing) },
        pointSwing: { swing: clonePID(kMikPointSwing) },
        group: "",
        start: undefined,
    },

    LemLib: {
        distanceDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
        pointTurn: { turn: clonePID(kMikPointTurn) },
        angleTurn: { turn: clonePID(kMikAngleTurn) },
        angleSwing: { swing: clonePID(kMikAngleSwing) },
        pointSwing: { swing: clonePID(kMikPointSwing) },
        group: "",
        start: undefined,
    },

    "RW-Template": {
        distanceDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
        poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
        pointTurn: { turn: clonePID(kMikPointTurn) },
        angleTurn: { turn: clonePID(kMikAngleTurn) },
        angleSwing: { swing: clonePID(kMikAngleSwing) },
        pointSwing: { swing: clonePID(kMikPointSwing) },
        group: "",
        start: undefined,
    },
};

export const globalDefaultsStore = createObjectStore<DefaultConstant>(INITIAL_DEFAULTS);

export function getDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K): ConstantsByFormat[F][K] {
    const state = globalDefaultsStore.getState();
    const constant = state[format][kind];

    if (!constant) return constant;

    const deepClone = (obj: unknown): ConstantsByFormat[F][K] => {
        const o = obj as Record<string, unknown>;
        if ('drive' in o && 'heading' in o) {
            return { drive: clonePID(o.drive as Parameters<typeof clonePID>[0]), heading: clonePID(o.heading as Parameters<typeof clonePID>[0]) } as ConstantsByFormat[F][K];
        }
        if ('turn' in o) {
            return { turn: clonePID(o.turn as Parameters<typeof clonePID>[0]) } as ConstantsByFormat[F][K];
        }
        if ('swing' in o) {
            return { swing: clonePID(o.swing as Parameters<typeof clonePID>[0]) } as ConstantsByFormat[F][K];
        }
        return { ...o } as ConstantsByFormat[F][K];
    };

    return deepClone(constant);
}
