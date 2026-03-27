import type { SetStateAction } from "react";
import type { Path } from "../Types/Path";
import type { ConstantListField } from "../../components/PathMenu/MotionList";
import type { ConstantField } from "../../components/PathMenu/ConstantRow";
import type { SegmentKind } from "../Types/Segment";
import type { Format } from "../../hooks/useFormat";
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import cwccw from "../../assets/cwwcw.svg";
import fwd from "../../assets/fwd.svg"
import rev from "../../assets/reverse.svg"
import fwdrev from "../../assets/fwdrev.svg"
import leftswing from "../../assets/leftswing.svg"
import rightswing from "../../assets/rightswing.svg"
import { getDefaultConstants, updateDefaultConstants, updatePathConstants, updatePathConstantsByKind } from "../DefaultConstants";
import type { CycleImageButtonProps } from "../../components/Util/CycleButton";
import type { PIDConstants, mikDriveConstants, mikTurnConstants, mikSwingConstants } from "./MikConstants";

const createDrivePIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  driveConstants: PIDConstants,
  headingConstants: PIDConstants
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<PIDConstants>) =>
    updatePathConstants(setPath, segmentId, { drive: partial });

  const onHeadingChange = (partial: Partial<PIDConstants>) =>
    updatePathConstants(setPath, segmentId, { heading: partial });

  const onApplyDrive = (partial: Partial<PIDConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { drive: partial });

  const onApplyHeading = (partial: Partial<PIDConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { heading: partial });

  const setDefaultDrive = (partial: Partial<PIDConstants>) => {
    updateDefaultConstants(format, segmentKind, { drive: partial } as Partial<mikDriveConstants>);
  }

  const setDefaultHeading = (partial: Partial<PIDConstants>) => {
    updateDefaultConstants(format, segmentKind, { heading: partial } as Partial<mikDriveConstants>);
  }

  const currentDefaults = getDefaultConstants(format, segmentKind) as { drive?: PIDConstants; heading?: PIDConstants } | undefined;

  return [
    {
      header: "Exit Conditions",
      values: driveConstants,
      fields: [
        { key: "settleError", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "exit_error", units: "in", label: "Exit Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      onApply: onApplyDrive,
      defaults: currentDefaults?.drive ?? {}
    },
    {
      header: "Drive Constants",
      values: driveConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", units: "in",  label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
        { key: "slew", units: "volt/10ms",  label: "Slew", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },

        ...(segmentKind === "poseDrive" ? [
          { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
          { key: "setback", label: "Setback", units: "in", input: { bounds: [0, 100], stepSize: .5, roundTo: 2 } },
          { key: "drift", label: "Drift", units: "", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
        ] as ConstantField[] : [])
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      onApply: onApplyDrive,
      defaults: currentDefaults?.drive ?? {}
    },
    {
      header: "Heading Constants",
      values: headingConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", units: "deg", label: "Starti", input: { bounds: [0, 360], stepSize: 1, roundTo: 2 } },

        ...(segmentKind === "pointDrive" ? [
          { key: "slew", units: "volt/10ms",  label: "Slew", input: { bounds: [0, 100], stepSize: .1, roundTo: 1 } },
        ] as ConstantField[] : []),
      ],
      onChange: onHeadingChange,
      setDefault: setDefaultHeading,
      onApply: onApplyHeading,
      defaults: currentDefaults?.heading ?? {}
    },
  ];
};

const createTurnPIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  turnConstants: PIDConstants,
  isSwing: boolean = false
): ConstantListField[] => {

  const slot = isSwing ? "swing" : "turn";

  const onChange = (partial: Partial<PIDConstants>) =>
    updatePathConstants(setPath, segmentId, { [slot]: partial });

  const onApply = (partial: Partial<PIDConstants>) =>
    updatePathConstantsByKind(setPath, segmentKind, { [slot]: partial });

  const setDefault = (partial: Partial<PIDConstants>) => {
    updateDefaultConstants(format, segmentKind, { [slot]: partial } as Partial<mikTurnConstants> | Partial<mikSwingConstants>);
  }

  const currentDefaults = getDefaultConstants(format, segmentKind) as { turn?: PIDConstants; swing?: PIDConstants } | undefined;
  const specificDefaults = isSwing ? currentDefaults?.swing : currentDefaults?.turn;

  return [
    {
      header: "Exit Conditions",
      values: turnConstants,
      fields: [
        { key: "settleError", label: "Settle Error", units: "deg", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", units: "volt", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "exit_error", units: "deg", label: "Exit Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
      ],
      onChange: onChange,
      setDefault: setDefault,
      onApply: onApply,
      defaults: specificDefaults ?? {}
    },
    {
      header: isSwing ? "Swing Constants" : "Turn Constants",
      values: turnConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },

        ...(segmentKind === "angleSwing" || segmentKind === "pointSwing"  ? [
          { key: "oppositeSpeed", units: "volt",  label: "Oppos Speed", input: { bounds: [0, 12], stepSize: .1, roundTo: 1 } },
        ] as ConstantField[] : []),

        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "deg", input: { bounds: [0, 360], stepSize: 1, roundTo: 2 } },
        { key: "slew", units: "volt/10ms",  label: "Slew", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
      ],
      onChange: onChange,
      setDefault: setDefault,
      onApply: onApply,
      defaults: specificDefaults ?? {}
    },
  ];
};

type Slot = "drive" | "turn" | "swing";

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

const createTurnDirectionGroup = (
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
      updatePathConstants(setPath, segmentId, { [slot] : { turnDirection: key } })
    },
    value: getDirectionState(path, segmentId, "turnDirection", slot)
  }
}

const createDriveDirectionGroup = (
  path: Path,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  slot: Slot,
): CycleImageButtonProps => {

  return {
    imageKeys: [
      { src: fwd, key: "forward" },
      { src: rev, key: "reverse" },
      { src: fwdrev, key: null },
    ],
    onKeyChange: (key: string | null) => {
      updatePathConstants(setPath, segmentId, { [slot]: { driveDirection: key } })
    },
    value: getDirectionState(path, segmentId, "driveDirection", slot)
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
      updatePathConstants(setPath, segmentId, { [slot]: { swingDirection: key } })
    },
    value: getDirectionState(path, segmentId, "swingDirection", slot)
  }
}

export function getMikLibDirectionConfig(
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
            createDriveDirectionGroup(path, setPath, segmentId, "drive"),
            ]
        case "pointTurn":
        case "angleTurn":
        return [
            createTurnDirectionGroup(path, setPath, segmentId, "turn")
        ]
        case "angleSwing":
        case "pointSwing":
        return [
            createSwingDirectionGroup(path, setPath, segmentId, "swing"),
            createTurnDirectionGroup(path, setPath, segmentId, "swing")
        ]
    }
}

export function getmikLibConstantsConfig(
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
            const constants = s.constants as mikDriveConstants;
            return createDrivePIDGroup(format, setPath, segmentId, s.kind, constants.drive, constants.heading);
        }
        case "pointTurn":
        case "angleTurn": {
            const constants = s.constants as mikTurnConstants;
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, constants.turn, false);
        }
        case "angleSwing":
        case "pointSwing": {
            const constants = s.constants as mikSwingConstants;
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, constants.swing, true);
        }
    }
    return undefined;
}
