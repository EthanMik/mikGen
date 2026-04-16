import type { SetStateAction } from "react";
import type { Path } from "../../core/Types/Path";
import type { ConstantListField } from "../../components/PathMenu/MotionList";
import type { ConstantField } from "../../components/PathMenu/ConstantRow";
import type { Format } from "../../hooks/useFormat";
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import cwccw from "../../assets/cwwcw.svg";
import fwd from "../../assets/fwd.svg"
import rev from "../../assets/reverse.svg"
import leftswing from "../../assets/leftswing.svg"
import rightswing from "../../assets/rightswing.svg"
import { getDefaultConstants, updateDefaultConstants, updatePathConstants, updatePathConstantsByKind } from "../DefaultConstants";
import type { CycleImageButtonProps } from "../../components/Util/CycleButton";
import type { LemConstants, LemMoveConstants, LemAngularConstants } from "./LemConstants";
import type { SegmentKind } from "../InitialDefaults";

const createMoveGroup = (
  format: Format,
  path: Path,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  driveConstants: LemConstants,
  headingConstants: LemConstants
): ConstantListField[] => {

  const onLateralChange = (partial: Partial<LemConstants>) =>
    updatePathConstants(setPath, segmentId, { lateral: partial });

  const onAngularChange = (partial: Partial<LemConstants>) =>
    updatePathConstants(setPath, segmentId, { angular: partial });

  const onApplyLateral = (partial: Partial<LemConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { lateral: partial });

  const onApplyAngular = (partial: Partial<LemConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { angular: partial });

  const setDefaultLateral = (partial: Partial<LemConstants>) => {
    updateDefaultConstants(format, segmentKind, { lateral: partial } as Partial<LemMoveConstants>);
  }

  const setDefaultAngular = (partial: Partial<LemConstants>) => {
    updateDefaultConstants(format, segmentKind, { angular: partial } as Partial<LemAngularConstants>);
  }

  const currentDefaults = getDefaultConstants(format, segmentKind) as { lateral?: LemConstants; angular?: LemConstants } | undefined;

  return [
    {
      header: "Motion Settings",
      values: driveConstants,
      fields: [
        { key: "maxSpeed", label: "Max Speed", input: { bounds: [0, 127], stepSize: 10, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", input: { bounds: [0, 127], stepSize: 10, roundTo: 0 } },
        { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "earlyExitRange", units: "in", label: "Early Exit", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },

        ...(segmentKind === "poseDrive" ? [
          { key: "horizontalDrift", label: "Drift", input: { bounds: [0, 30], stepSize: 1, roundTo: 1 } },
          { key: "lead", label: "Lead", units: "in", input: { bounds: [0, 1], stepSize: .1, roundTo: 1 } },
        ] as ConstantField[] : [])
      ],
      onChange: onLateralChange,
      setDefault: setDefaultLateral,
      onApply: onApplyLateral,
      defaults: currentDefaults?.lateral ?? {}
    },
    {
      header: "Lateral Settings",
      values: driveConstants,
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "antiWindup", units: "in", label: "Anti Windup", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
        { key: "smallError", units: "in", label: "Small Error", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
        { key: "smallErrorTimeout", units: "ms",  label: "Sml Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "largeError", units: "in",  label: "Large Error", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
        { key: "largeErrorTimeout", units: "ms",  label: "Lge Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "slew",  label: "Slew", input: { bounds: [0, 127], stepSize: 1, roundTo: 1 } },

      ],
      onChange: onLateralChange,
      setDefault: setDefaultLateral,
      onApply: onApplyLateral,
      defaults: currentDefaults?.lateral ?? {}
    },
    {
      header: "Angular Settings",
      values: headingConstants,
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "antiWindup", units: "deg", label: "Anti Windup", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
        { key: "smallError", units: "in", label: "Small Error", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
        { key: "smallErrorTimeout", units: "ms",  label: "Sml Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "largeError", units: "in",  label: "Large Error", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
        { key: "largeErrorTimeout", units: "ms",  label: "Lge Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "slew",  label: "Slew", input: { bounds: [0, 127], stepSize: 1, roundTo: 1 } },

      ],
      onChange: onAngularChange,
      setDefault: setDefaultAngular,
      onApply: onApplyAngular,
      defaults: currentDefaults?.angular ?? {}
    },
  ];
};

const createAngularGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  turnConstants: LemConstants,
): ConstantListField[] => {

  const onChange = (partial: Partial<LemConstants>) =>
    updatePathConstants(setPath, segmentId, { angular: partial });

  const onApply = (partial: Partial<LemConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { angular: partial });

  const setDefault = (partial: Partial<LemConstants>) => {
    updateDefaultConstants(format, segmentKind, { angular: partial } as Partial<LemAngularConstants>);
  }

  const currentDefaults = getDefaultConstants(format, segmentKind) as { angular?: LemConstants } | undefined;
  const specificDefaults = currentDefaults?.angular;

  return [
    {
      header: "Motion Settings",
      values: turnConstants,
      fields: [
        { key: "maxSpeed", label: "Max Speed", input: { bounds: [0, 127], stepSize: 10, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", input: { bounds: [0, 127], stepSize: 10, roundTo: 0 } },
        { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "earlyExitRange", units: "in", label: "Early Exit Range", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
      ],
      onChange: onChange,
      setDefault: setDefault,
      onApply: onApply,
      defaults: specificDefaults ?? {}
    },
    {
      header: "Angular Settings",
      values: turnConstants,
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "antiWindup",  label: "Anti Windup", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
        { key: "smallError", units: "in", label: "Small Error", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
        { key: "smallErrorTimeout", units: "ms",  label: "Sml Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "largeError", units: "in",  label: "Large Error", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
        { key: "largeErrorTimeout", units: "ms",  label: "Lge Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "slew",  label: "Slew", input: { bounds: [0, 127], stepSize: 1, roundTo: 1 } },

      ],
      onChange: onChange,
      setDefault: setDefault,
      onApply: onApply,
      defaults: specificDefaults ?? {}
    },
  ];
};

type Slot = "lateral" | "angular";

const getDirectionState = (
  path: Path,
  segmentId: string,
  field: string,
  slot: Slot
): string | null  => {
    const segment = path.segments.find((s) => s.id === segmentId);
    const constants = segment?.constants as Record<string, Record<string, string | null> | undefined> | undefined;
    return constants?.[slot]?.[field] ?? null;
};

const createAngularDirectionGroup = (
  path: Path,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  slot: Slot,
): CycleImageButtonProps => {
  return {
    imageKeys: [
      { src: cw, key: "clockwise" },
      { src: ccw, key: "counterclockwise" },
      { src: cwccw, key: null },
    ],
    onKeyChange: (key: string | null) => {
      updatePathConstants(setPath, segmentId, { [slot] : { direction: key } })
    },
    value: getDirectionState(path, segmentId, "direction", slot)
  }
}

const createMoveDirectionGroup = (
  path: Path,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  slot: Slot,
): CycleImageButtonProps => {

  return {
    imageKeys: [
      { src: fwd, key: "forward" },
      { src: rev, key: "reverse" },
    ],
    onKeyChange: (key: string | null) => {
      updatePathConstants(setPath, segmentId, { [slot]: { forwards: key } })
    },
    value: getDirectionState(path, segmentId, "forwards", slot)
  }
}

const createSwingDirectionGroup = (
  path: Path,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  slot: Slot,
): CycleImageButtonProps => {
  return {
    imageKeys: [
      { src: rightswing, key: "right" },
      { src: leftswing, key: "left" },
    ],
    onKeyChange: (key: string | null) => {
      updatePathConstants(setPath, segmentId, { [slot]: { lockedSide: key } })
    },
    value: getDirectionState(path, segmentId, "lockedSide", slot)
  }
}

export function getLemLibDirectionConfig(
    path: Path,
    setPath: React.Dispatch<SetStateAction<Path>>,
    segmentId: string,
): CycleImageButtonProps[] | undefined {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];

    switch (s.kind) {
        case "pointDrive":
        case "poseDrive":
        case "distanceDrive":
            return [
            createMoveDirectionGroup(path, setPath, segmentId, "lateral"),
            ]
        case "pointTurn":
            return [
                createMoveDirectionGroup(path, setPath, segmentId, "lateral"),
                createAngularDirectionGroup(path, setPath, segmentId, "angular")
            ]
        case "angleTurn":
        return [
            createAngularDirectionGroup(path, setPath, segmentId, "angular")
        ]
        case "angleSwing":
        case "pointSwing":
        return [
            createSwingDirectionGroup(path, setPath, segmentId, "angular"),
            createAngularDirectionGroup(path, setPath, segmentId, "angular")
        ]
    }
}

export function getLemLibConstantsConfig(
    format: Format,
    path: Path,
    setPath: React.Dispatch<SetStateAction<Path>>,
    segmentId: string,
): ConstantListField[] | undefined {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];

    switch (s.kind) {
        case "pointDrive":
        case "poseDrive": {
            const constants = s.constants as LemMoveConstants;
            return createMoveGroup(format, path, setPath, segmentId, s.kind, constants.lateral, constants.angular);
        }
        case "pointTurn":
        case "angleTurn": {
            const constants = s.constants as LemAngularConstants;
            return createAngularGroup(format, setPath, segmentId, s.kind, constants.angular);
        }
        case "angleSwing":
        case "pointSwing": {
            const constants = s.constants as LemAngularConstants;
            return createAngularGroup(format, setPath, segmentId, s.kind, constants.angular);
        }
    }
    return undefined;
}
