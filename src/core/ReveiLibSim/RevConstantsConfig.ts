
import type { SetStateAction } from "react";
import type { Format } from "../../hooks/useFormat";
import type { Path } from "../Types/Path";
import type { SegmentKind } from "../Types/Segment";
import type { ConstantListField } from "../../components/PathMenu/MotionList";
import type { ConstantField } from "../../components/PathMenu/ConstantRow";
import type { ReveilLibConstants, revDriveConstants, revTurnConstants } from "./RevConstants";
import { getDefaultConstants, updateDefaultConstants, updatePathConstants, updatePathConstantsByKind } from "../DefaultConstants";

const createDrivePIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  driveConstants: ReveilLibConstants,
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<ReveilLibConstants>) =>
    updatePathConstants(setPath, segmentId, { drive: partial });

  const onApplyDrive = (partial: Partial<ReveilLibConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { drive: partial });

  const setDefaultDrive = (partial: Partial<ReveilLibConstants>) => {
    updateDefaultConstants(format, segmentKind, { drive: partial } as Partial<revDriveConstants>);
  }

  const currentDefaults = getDefaultConstants(format, segmentKind) as { drive?: ReveilLibConstants } | undefined;

  return [
    {
      header: segmentKind === "poseDrive" ? "Boomerang Constants" : "Pilons Constants",
      values: driveConstants,
      fields: [
        { key: "maxSpeed", units: "percent", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "kCorrection", label: "kCorrection", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
        { key: "maxError", units: "in", label: "Max Error", input: { bounds: [0, 100], stepSize: .25, roundTo: 2 } },

        ...(segmentKind === "poseDrive" ? [
            { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
        ] as ConstantField[]: [])
    ],
    onChange: onDriveChange,
    setDefault: setDefaultDrive,
    onApply: onApplyDrive,
    defaults: currentDefaults?.drive ?? {}
    },
    {
        header: "Stop Constants",
        values: driveConstants,
        fields: [
        { key: "stopCoastPower", units: "percent", label: "Coast Power", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
        { key: "stopCoastThreshold", units: "ms", label: "kThresh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "stopHarshThreshold", units: "ms", label: "kHarsh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "brakeTime", units: "ms", label: "Brake Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "dropEarly", units: "in", label: "Drop Early", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      onApply: onApplyDrive,
      defaults: currentDefaults?.drive ?? {}
    },
  ];
};

const createTurnPIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  turnConstants: ReveilLibConstants,
): ConstantListField[] => {

  const onChange = (partial: Partial<ReveilLibConstants>) =>
    updatePathConstants(setPath, segmentId, { turn: partial });

  const onApply = (partial: Partial<ReveilLibConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { turn: partial });

  const setDefault = (partial: Partial<ReveilLibConstants>) => {
    updateDefaultConstants(format, segmentKind, { turn: partial } as Partial<revTurnConstants>);
  }

  const currentDefaults = getDefaultConstants(format, segmentKind) as { turn?: ReveilLibConstants } | undefined;

  return [
    {
      header: segmentKind === "angleTurn" ? "Turn Constants" : "Look At Constants" ,
      values: turnConstants,
      fields: [
        { key: "maxSpeed", units: "percent", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "stopCoastPower", units: "percent", label: "Coast Power", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
        { key: "stopCoastThreshold", label: "kCoast", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "stopHarshThreshold", label: "kHarsh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "brakeTime", units: "ms", label: "Brake Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },

        ...(segmentKind === "pointTurn" ? [
            { key: "dropEarly", units: "deg", label: "Drop Early", input: { bounds: [0, 9999], stepSize: 5, roundTo: 1 } },
        ] as ConstantField[]: [])

      ],
      onChange: onChange,
      setDefault: setDefault,
      onApply: onApply,
      defaults: currentDefaults?.turn ?? {}
    },
  ];
};

export function getRevConstantsConfig(
    format: Format,
    path: Path,
    setPath: React.Dispatch<SetStateAction<Path>>,
    segmentId: string,
): ConstantListField[] | undefined {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];

    switch (s.kind) {
        case "pointDrive":
        case "poseDrive":
        case "distanceDrive":
            return createDrivePIDGroup(format, setPath, segmentId, s.kind, (s.constants as revDriveConstants).drive);
        case "pointTurn":
        case "angleTurn":
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, (s.constants as revTurnConstants).turn);
        case "angleSwing":
        case "pointSwing":
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, (s.constants as revTurnConstants).turn);
    }
    return undefined;

}
