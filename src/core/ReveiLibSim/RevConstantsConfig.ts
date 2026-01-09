/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SetStateAction } from "react";
import type { Format } from "../../hooks/useFormat";
import type { Path } from "../Types/Path";
import type { SegmentKind } from "../Types/Segment";
import type { ConstantListField } from "../../components/PathMenu/MotionList";
import { getDefaultConstants, updateDefaultConstants, updatePathConstants } from "../DefaultConstants";

const createDrivePIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  driveConstants: any,
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<any>) =>
    updatePathConstants(setPath, segmentId, partial);
  
  const setDefaultDrive = (partial: Partial<any>) => {
    updateDefaultConstants(format, segmentKind, partial as any);
  }

  const currentDefaults: any = getDefaultConstants(format, segmentKind);

  return [
    {
      header: segmentKind === "poseDrive" ? "Boomerang Constants" : "Pilons Constants",
      values: driveConstants,
      fields: [
        { key: "maxSpeed", units: "percent", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 1 } },
        { key: "kCorrection", label: "kCorrection", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
        { key: "maxError", units: "in", label: "Max Error", input: { bounds: [0, 100], stepSize: .25, roundTo: 2 } },

        ...(segmentKind === "poseDrive" ? [
            { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
        ] as any: [])
    ],
    onChange: onDriveChange,
    setDefault: setDefaultDrive,
    defaults: currentDefaults
    },
    {
        header: "Stop Constants",
        values: driveConstants,
        fields: [
        { key: "stopCoastPower", units: "percent", label: "Coast Power", input: { bounds: [0, 1], stepSize: .1, roundTo: 1 } },
        { key: "stopCoastThreshold", units: "ms", label: "Coast Thresh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "stopHarshThreshold", units: "ms", label: "Harsh Thresh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "brakeTime", units: "ms", label: "Brake Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "dropEarly", units: "in", label: "Drop Early", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      defaults: currentDefaults
    },
  ];
};

const createTurnPIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  turnConstants: any,
): ConstantListField[] => {
  
  const onChange = (partial: Partial<any>) =>
    updatePathConstants(setPath, segmentId, partial);

  const setDefault = (partial: Partial<any>) => {
    updateDefaultConstants(format, segmentKind, partial as any);
  }

  const currentDefaults: any = getDefaultConstants(format, segmentKind);

  return [
    {
      header: segmentKind === "angleTurn" ? "Turn Constants" : "Look At Constants" ,
      values: turnConstants,
      fields: [
        { key: "maxSpeed", units: "percent", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 1 } },
        { key: "stopCoastPower", units: "percent", label: "Coast Power", input: { bounds: [0, 1], stepSize: .1, roundTo: 1 } },
        { key: "stopCoastThreshold", label: "kCoast", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "stopHarshThreshold", label: "kHarsh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "brakeTime", units: "ms", label: "Brake Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },

        ...(segmentKind === "pointTurn" ? [
            { key: "dropEarly", units: "deg", label: "Drop Early", input: { bounds: [0, 9999], stepSize: 5, roundTo: 1 } },
        ] as any: [])

      ],
      onChange: onChange,
      setDefault: setDefault,
      defaults: currentDefaults
    },
  ];
};

export function getRevConstantsConfig(
    format: Format, 
    path: Path, 
    setPath: React.Dispatch<SetStateAction<Path>>, 
    segmentId: string,
): ConstantListField[] {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];

    switch (s.kind) {
        case "pointDrive":
        case "poseDrive":
            return createDrivePIDGroup(format, setPath, segmentId, s.kind, s.constants);
        case "pointTurn":
        case "angleTurn":
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, s.constants);
        case "angleSwing":
        case "pointSwing":
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, s.constants);
    }

}