import { kBoomerang, kLootAt, kPilon, kTurn } from "./ReveiLibSim/RevConstants";
import { kMikDrive, kMikHeading, kMikSwing, kMikTurn, type mikDriveConstants, type mikSwingConstants, type mikTurnConstants } from "./mikLibSim/MikConstants";
import type { revDriveConstants, revTurnConstants } from "./ReveiLibSim/RevConstants";
import { createObjectStore } from "../core/Store";
import { kLemAngular, kLemLinear, type LemAngularConstants, type LemMoveConstants } from "./LemLibSim/LemConstants";
import { kMecanumDrive, kMecanumSwing, kMecanumTurn, type RevMecanumDriveConstants, type RevMecanumSwingConstants, type RevMecanumTurnConstants } from "./RevMecanumSim/RevMecanumConstant";
import { cloneConstants } from "../core/Util";

// type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib" | "RW-Template" | "RevMecanum";

// type SegmentKind = "pointDrive" | "poseDrive" | "pointTurn" | "angleTurn" | "angleSwing" | "pointSwing" | "distanceDrive" | "start" | "group";

// export type { SegmentKind };

// export type ConstantsByFormat = {
//   mikLib: {
//     distanceDrive: mikDriveConstants;
//     pointDrive: mikDriveConstants;
//     poseDrive: mikDriveConstants;
//     pointTurn: mikTurnConstants;
//     angleTurn: mikTurnConstants;
//     angleSwing: mikSwingConstants;
//     pointSwing: mikSwingConstants;
//     start: undefined;
//     group: string;
//   };
//   ReveilLib: {
//     distanceDrive: revDriveConstants;
//     pointDrive: revDriveConstants;
//     poseDrive: revDriveConstants;
//     pointTurn: revTurnConstants;
//     angleTurn: revTurnConstants;
//     angleSwing: revTurnConstants;
//     pointSwing: revTurnConstants;
//     start: undefined;
//     group: string;
//   };
//   RevMecanum: {
//     distanceDrive: RevMecanumDriveConstants;
//     pointDrive: RevMecanumDriveConstants;
//     poseDrive: RevMecanumDriveConstants;
//     pointTurn: RevMecanumTurnConstants;
//     angleTurn: RevMecanumTurnConstants;
//     angleSwing: RevMecanumSwingConstants;
//     pointSwing: RevMecanumSwingConstants;
//     start: undefined;
//     group: string;
//   };
//   "JAR-Template": {
//     distanceDrive: mikDriveConstants;
//     pointDrive: mikDriveConstants;
//     poseDrive: mikDriveConstants;
//     pointTurn: mikTurnConstants;
//     angleTurn: mikTurnConstants;
//     angleSwing: mikSwingConstants;
//     pointSwing: mikSwingConstants;
//     start: undefined;
//     group: string;
//   };
//   LemLib: {
//     distanceDrive: LemMoveConstants;
//     pointDrive: LemMoveConstants;
//     poseDrive: LemMoveConstants;
//     pointTurn: LemAngularConstants;
//     angleTurn: LemAngularConstants;
//     angleSwing: LemAngularConstants;
//     pointSwing: LemAngularConstants;
//     start: undefined;
//     group: string;
//   };
//   "RW-Template": {
//     distanceDrive: mikDriveConstants;
//     pointDrive: mikDriveConstants;
//     poseDrive: mikDriveConstants;
//     pointTurn: mikTurnConstants;
//     angleTurn: mikTurnConstants;
//     angleSwing: mikSwingConstants;
//     pointSwing: mikSwingConstants;
//     start: undefined;
//     group: string;
//   };
// };

// export type DefaultConstant = {
//     [F in Format]: {
//         [K in keyof ConstantsByFormat[F] & SegmentKind]: ConstantsByFormat[F][K];
//     }
// };

// export const INITIAL_DEFAULTS: DefaultConstant = {
//     mikLib: {
//         distanceDrive: cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         pointDrive:    cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         poseDrive:     cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         pointTurn:     cloneConstants({ turn: kMikTurn }),
//         angleTurn:     cloneConstants({ turn: kMikTurn }),
//         angleSwing:    cloneConstants({ swing: kMikSwing }),
//         pointSwing:    cloneConstants({ swing: kMikSwing }),
//         group: "",
//         start: undefined,
//     },

//     ReveilLib: {
//         distanceDrive: cloneConstants({ drive: kPilon }),
//         pointDrive:    cloneConstants({ drive: kPilon }),
//         poseDrive:     cloneConstants({ drive: kBoomerang }),
//         pointTurn:     cloneConstants({ turn: kLootAt }),
//         angleTurn:     cloneConstants({ turn: kTurn }),
//         angleSwing:    cloneConstants({ turn: kTurn }),
//         pointSwing:    cloneConstants({ turn: kTurn }),
//         group: "",
//         start: undefined,
//     },

//     RevMecanum: {
//         distanceDrive: cloneConstants({ drive: kMecanumDrive, turn: kMecanumTurn }),
//         pointDrive:    cloneConstants({ drive: kMecanumDrive, turn: kMecanumTurn }),
//         poseDrive:     cloneConstants({ drive: kMecanumDrive, turn: kMecanumTurn }),
//         pointTurn:     cloneConstants({ turn: kMecanumTurn }),
//         angleTurn:     cloneConstants({ turn: kMecanumTurn }),
//         angleSwing:    cloneConstants({ swing: kMecanumSwing }),
//         pointSwing:    cloneConstants({ swing: kMecanumSwing }),
//         group: "",
//         start: undefined,
//     },

//     "JAR-Template": {
//         distanceDrive: cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         pointDrive:    cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         poseDrive:     cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         pointTurn:     cloneConstants({ turn: kMikTurn }),
//         angleTurn:     cloneConstants({ turn: kMikTurn }),
//         angleSwing:    cloneConstants({ swing: kMikSwing }),
//         pointSwing:    cloneConstants({ swing: kMikSwing }),
//         group: "",
//         start: undefined,
//     },

//     LemLib: {
//         distanceDrive: cloneConstants({ lateral: kLemLinear, angular: kLemAngular }),
//         pointDrive:    cloneConstants({ lateral: kLemLinear, angular: kLemAngular }),
//         poseDrive:     cloneConstants({ lateral: kLemLinear, angular: kLemAngular }),
//         pointTurn:     cloneConstants({ angular: kLemAngular }),
//         angleTurn:     cloneConstants({ angular: kLemAngular }),
//         angleSwing:    cloneConstants({ angular: kLemAngular }),
//         pointSwing:    cloneConstants({ angular: kLemAngular }),
//         group: "",
//         start: undefined,
//     },

//     "RW-Template": {
//         distanceDrive: cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         pointDrive:    cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         poseDrive:     cloneConstants({ drive: kMikDrive, heading: kMikHeading }),
//         pointTurn:     cloneConstants({ turn: kMikTurn }),
//         angleTurn:     cloneConstants({ turn: kMikTurn }),
//         angleSwing:    cloneConstants({ swing: kMikSwing }),
//         pointSwing:    cloneConstants({ swing: kMikSwing }),
//         group: "",
//         start: undefined,
//     },
// };

// export const globalDefaultsStore = createObjectStore<DefaultConstant>(INITIAL_DEFAULTS);

// export function getDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K): ConstantsByFormat[F][K] {
//     const state = globalDefaultsStore.getState() ?? INITIAL_DEFAULTS;
//     const constant = state?.[format]?.[kind] ?? INITIAL_DEFAULTS[format][kind];

//     if (!constant || typeof constant !== 'object') return constant;

//     return cloneConstants(constant) as ConstantsByFormat[F][K];
// }
