/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SetStateAction } from "react";
import type { ConstantListField } from "../components/PathMenu/MotionList";
import type { Format } from "../hooks/useFormat";
import { getmikLibConstantsConfig } from "./mikLibSim/MikConstantsConfig";
import { cloneKRev, kBoomerang, kPilon, kTurn } from "./ReveiLibSim/RevConstants";
import type { ConstantsByFormat, SegmentKind } from "./Types/Segment";
import type { Path } from "./Types/Path";
import { clonePID, kMikAngleSwing, kMikAngleTurn, kMikBoomerang, kMikBoomerangHeading, kMikPointDrive, kMikPointDriveHeading, kMikPointSwing, kMikPointTurn } from "./mikLibSim/MikConstants";
import { createObjectStore } from "./Store";

type DefaultsState = {
    [F in Format]: {
        [K in keyof ConstantsByFormat[F] & SegmentKind]: ConstantsByFormat[F][K];
    }
};

const INITIAL_DEFAULTS: DefaultsState = {
  mikLib: {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive:  { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn:  { turn: clonePID(kMikPointTurn) },
    angleTurn:  { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) },
  },

  ReveilLib: {
    pointDrive: cloneKRev(kPilon),
    poseDrive:  cloneKRev(kBoomerang),
    pointTurn:  cloneKRev(kTurn),
    angleTurn:  cloneKRev(kTurn),
    angleSwing: cloneKRev(kTurn),
    pointSwing: cloneKRev(kTurn),
  },

  "JAR-Template": {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive:  { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn:  { turn: clonePID(kMikPointTurn) },
    angleTurn:  { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) },
  },

  LemLib: {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive:  { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn:  { turn: clonePID(kMikPointTurn) },
    angleTurn:  { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) },
  },
};

export const globalDefaultsStore = createObjectStore<DefaultsState>(INITIAL_DEFAULTS);

export function updateDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K, patch: Partial<ConstantsByFormat[F][K]>) {
    globalDefaultsStore.setState((prev) => {
        const currentFormatDefaults = prev[format];
        const currentSegmentDefaults = currentFormatDefaults[kind];

        // Perform a safe merge.
        // If the patch contains nested objects (like { drive: {...} }), we need to merge them 
        // instead of overwriting the whole 'drive' object if it exists.
        
        // Note: This spread handles top-level properties. 
        // If 'patch' has { drive: { kp: 10 } }, it might overwrite the existing 'drive' if not carefully merged.
        // We will do a manual check for common nested keys (drive, heading, turn, swing) for safety.
        
        const mergedSegment: any = { ...currentSegmentDefaults };
        
        const keys = Object.keys(patch) as Array<keyof typeof patch>;
        
        for (const key of keys) {
            const patchValue = patch[key];
            const existingValue = mergedSegment[key];

            // If both are objects (and not null), merge them
            if (
                typeof patchValue === 'object' && patchValue !== null &&
                typeof existingValue === 'object' && existingValue !== null
            ) {
                mergedSegment[key] = { ...existingValue, ...patchValue };
            } else {
                // Otherwise just overwrite
                mergedSegment[key] = patchValue;
            }
        }

        return {
            ...prev,
            [format]: {
                ...prev[format],
                [kind]: mergedSegment
            }
        };
    });
}

export function getDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K): ConstantsByFormat[F][K] {
  const state = globalDefaultsStore.getState();
  const constant = state[format][kind];

  if (!constant) return constant;

  const deepClone = (obj: any): any => {
      if ('drive' in obj && 'heading' in obj) {
          return { drive: clonePID(obj.drive), heading: clonePID(obj.heading) };
      }
      if ('turn' in obj) {
          return { turn: clonePID(obj.turn) };
      }
      if ('swing' in obj) {
          return { swing: clonePID(obj.swing) };
      }
      return { ...obj };
  };

  return deepClone(constant);
}

export function getFormatConstantsConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): ConstantListField[] {
  switch (format) {
    case "mikLib": return getmikLibConstantsConfig(path, setPath, segmentId)
  }
  return [];
}