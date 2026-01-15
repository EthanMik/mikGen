/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SetStateAction } from "react";
import type { ConstantListField } from "../components/PathMenu/MotionList";
import type { Format } from "../hooks/useFormat";
import { getmikLibConstantsConfig, getMikLibDirectionConfig } from "./mikLibSim/MikConstantsConfig";
import { cloneKRev, kBoomerang, kLootAt, kPilon, kTurn } from "./ReveiLibSim/RevConstants";
import type { ConstantsByFormat, SegmentKind } from "./Types/Segment";
import type { Path } from "./Types/Path";
import { clonePID, kMikAngleSwing, kMikAngleTurn, kMikBoomerang, kMikBoomerangHeading, kMikPointDrive, kMikPointDriveHeading, kMikPointSwing, kMikPointTurn } from "./mikLibSim/MikConstants";
import { createObjectStore } from "./Store";
import type { CycleImageButtonProps } from "../components/Util/CycleButton";
import { getRevConstantsConfig } from "./ReveiLibSim/RevConstantsConfig";
import { DEFAULT_FORMAT } from "../hooks/useFileFormat";

export type DefaultConstant = {
    [F in Format]: {
        [K in keyof ConstantsByFormat[F] & SegmentKind]: ConstantsByFormat[F][K];
    }
};

export const INITIAL_DEFAULTS: DefaultConstant = {
  mikLib: {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive:  { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn:  { turn: clonePID(kMikPointTurn) },
    angleTurn:  { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) },
  },

  ReveilLib: {
    pointDrive: { drive: cloneKRev(kPilon) },
    poseDrive:  { drive: cloneKRev(kBoomerang) },
    pointTurn:  { turn: cloneKRev(kLootAt) },
    angleTurn:  { turn: cloneKRev(kTurn) },
    angleSwing: { turn: cloneKRev(kTurn) },
    pointSwing: { turn: cloneKRev(kTurn) },
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

export const globalDefaultsStore = createObjectStore<DefaultConstant>(INITIAL_DEFAULTS);

export function updateDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K, patch: Partial<ConstantsByFormat[F][K]>) {
    globalDefaultsStore.setState((prev) => {
        const currentFormatDefaults = prev[format];
        const currentSegmentDefaults = currentFormatDefaults[kind];

        const mergedSegment: any = { ...currentSegmentDefaults };
        
        const keys = Object.keys(patch) as Array<keyof typeof patch>;
        
        for (const key of keys) {
            const patchValue = patch[key];
            const existingValue = mergedSegment[key];

            if (
                typeof patchValue === 'object' && patchValue !== null &&
                typeof existingValue === 'object' && existingValue !== null
            ) {
                mergedSegment[key] = { ...existingValue, ...patchValue };
            } else {
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


export function updatePathConstants(
  setPath: React.Dispatch<React.SetStateAction<Path>>,
  segmentId: string,
  partial: any
) {
  setPath((prev) => ({
    ...prev,
    segments: prev.segments.map((s) => {
      if (s.id !== segmentId) return s;

      const key = Object.keys(partial)[0]; 
      
      if (key && typeof partial[key] === 'object' && !Array.isArray(partial[key])) {
        return {
          ...s,
          constants: {
            ...s.constants,
            [key]: {
              ...(s.constants as any)[key],
              ...partial[key],
            },
          } as any,
        };
      }

      return {
        ...s,
        constants: {
          ...s.constants,
          ...partial,
        } as any,
      };
    }),
  }));
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
        case "mikLib": return getmikLibConstantsConfig(format, path, setPath, segmentId);
        case "ReveilLib" : return getRevConstantsConfig(format, path, setPath, segmentId);
    }
    return [];
}

export function getFormatDirectionConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): CycleImageButtonProps[] {
    switch (format) {
        case "mikLib": return getMikLibDirectionConfig(path, setPath, segmentId)
    }
    return [];
}