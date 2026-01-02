import type { SetStateAction } from "react";
import type { ConstantListField } from "../components/PathMenu/MotionList";
import type { Format } from "../hooks/useFormat";
import { clonePID, kBoomerangPID, kOdomDrivePID, kOdomHeadingPID, kOdomSwingPID, kOdomTurnPID, kSwingPID, kturnPID } from "./mikLibSim/MikConstants";
import { getmikLibConstantsConfig } from "./mikLibSim/MikConstantsConfig";
import { cloneKRev, kBoomerang, kPilon, kTurn } from "./ReveiLibSim/RevConstants";
import type { ConstantsByFormat, SegmentKind } from "./Types/Segment";
import type { Path } from "./Types/Path";

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

export function getFormatConstantsConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): ConstantListField[] {
  switch (format) {
    case "mikLib": return getmikLibConstantsConfig(path, setPath, segmentId)
  }
  return [];
}