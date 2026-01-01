import type { Format } from "../hooks/useFormat";
import { clonePID, kBoomerangPID, kOdomDrivePID, kOdomHeadingPID, kOdomSwingPID, kOdomTurnPID, kSwingPID, kturnPID, type mikDriveConstants, type mikTurnConstants, type PIDConstants } from "./mikLibSim/Constants";
import { cloneKRev, kBoomerang, kPilon, kTurn } from "./ReveiLibSim/Constants";
import type { ConstantsByFormat, SegmentKind } from "./Types/Segment";

export const DEFAULTS = {
  mikLib: {
    pointDrive: () => ({ drive: clonePID(kOdomDrivePID), heading: clonePID(kOdomHeadingPID) }),
    poseDrive:  () => ({ drive: clonePID(kBoomerangPID), heading: clonePID(kOdomHeadingPID) }),
    pointTurn:  () => ({ turn: clonePID(kOdomTurnPID) }),
    angleTurn:  () => ({ turn: clonePID(kturnPID) }),
    angleSwing: () => ({ swing: clonePID(kSwingPID) }),
    pointSwing: () => ({ swing: clonePID(kOdomSwingPID) }),
  },

  ReveilLib: {
    pointDrive: () => cloneKRev(kPilon),
    poseDrive:  () => cloneKRev(kBoomerang),
    pointTurn:  () => cloneKRev(kTurn),
    angleTurn:  () => cloneKRev(kTurn),
    angleSwing: () => cloneKRev(kTurn),
    pointSwing: () => cloneKRev(kTurn),
  },

  "JAR-Template": {
    pointDrive: () => ({ drive: clonePID(kOdomDrivePID), heading: clonePID(kOdomHeadingPID) }),
    poseDrive:  () => ({ drive: clonePID(kBoomerangPID), heading: clonePID(kOdomHeadingPID) }),
    pointTurn:  () => ({ turn: clonePID(kOdomTurnPID) }),
    angleTurn:  () => ({ turn: clonePID(kturnPID) }),
    angleSwing: () => ({ swing: clonePID(kSwingPID) }),
    pointSwing: () => ({ swing: clonePID(kOdomSwingPID) }),
  },

  LemLib: {
    pointDrive: () => ({ drive: clonePID(kOdomDrivePID), heading: clonePID(kOdomHeadingPID) }),
    poseDrive:  () => ({ drive: clonePID(kBoomerangPID), heading: clonePID(kOdomHeadingPID) }),
    pointTurn:  () => ({ turn: clonePID(kOdomTurnPID) }),
    angleTurn:  () => ({ turn: clonePID(kturnPID) }),
    angleSwing: () => ({ swing: clonePID(kSwingPID) }),
    pointSwing: () => ({ swing: clonePID(kOdomSwingPID) }),
  },
};

export function getDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K): ConstantsByFormat[F][K] {
  const fn = DEFAULTS[format][kind] as () => ConstantsByFormat[F][K];
  return fn();
}


export function SegmentConstantsEqual(a: mikTurnConstants | mikDriveConstants, b: mikTurnConstants | mikDriveConstants): boolean {
    return true;
//   if (isTurnConstants(a) && isTurnConstants(b)) {
//     return PIDConstantsEqual(a.turn, b.turn);
//   }

//   if (!isTurnConstants(a) && !isTurnConstants(b)) {
//     return PIDConstantsEqual(a.drive, b.drive) && PIDConstantsEqual(a.heading, b.heading);
//   }

//   return false;
}
