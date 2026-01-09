/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SetStateAction } from "react";
import type { Path } from "../Types/Path";
import type { ConstantListField } from "../../components/PathMenu/MotionList";
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
import { getDefaultConstants, updateDefaultConstants, updatePathConstants } from "../DefaultConstants";
import type { CycleImageButtonProps } from "../../components/Util/CycleButton";

const createDrivePIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  driveConstants: any,
  headingConstants: any
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<any>) =>
    updatePathConstants(setPath, segmentId, { drive: partial });
  
  const onHeadingChange = (partial: Partial<any>) =>
    updatePathConstants(setPath, segmentId, { heading: partial });
  
  const setDefaultDrive = (partial: Partial<any>) => {
    updateDefaultConstants(format, segmentKind, { drive: partial } as any);
  }
  
  const setDefaultHeading = (partial: Partial<any>) => {
    updateDefaultConstants(format, segmentKind, { heading: partial } as any);
  }

  const currentDefaults: any = getDefaultConstants(format, segmentKind);

  return [
    {
      header: "Exit Conditions",
      values: driveConstants,
      fields: [
        { key: "settleError", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
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

        ...(segmentKind === "poseDrive" ? [
            { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
            { key: "setback", label: "Setback", units: "in", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
        ] as any : [])
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
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
      ],
      onChange: onHeadingChange,
      setDefault: setDefaultHeading,
      defaults: currentDefaults?.heading ?? {}
    },
  ];
};

const createTurnPIDGroup = (
  format: Format,
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  segmentKind: SegmentKind,
  turnConstants: any,
  isSwing: boolean = false
): ConstantListField[] => {
  
  const slot = isSwing ? "swing" : "turn";

  const onChange = (partial: Partial<any>) =>
    updatePathConstants(setPath, segmentId, { [slot]: partial });

  const setDefault = (partial: Partial<any>) => {
    updateDefaultConstants(format, segmentKind, { [slot]: partial } as any);
  }

  const currentDefaults: any = getDefaultConstants(format, segmentKind);
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
      ],
      onChange: onChange,
      setDefault: setDefault,
      defaults: specificDefaults ?? {}
    },
    {
      header: isSwing ? "Swing Constants" : "Turn Constants",
      values: turnConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "deg", input: { bounds: [0, 360], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onChange,
      setDefault: setDefault,
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
    const segment = path.segments.find((s) => s.id === segmentId) as any;
    return segment?.constants?.[slot]?.[field] ?? null; 
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
    initialKey: getDirectionState(path, segmentId, "turnDirection", slot)
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
    initialKey: getDirectionState(path, segmentId, "driveDirection", slot)
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
    initialKey: getDirectionState(path, segmentId, "swingDirection", slot)
  }
}

export function getMikLibDirectionConfig(
    path: Path, 
    setPath: React.Dispatch<SetStateAction<Path>>, 
    segmentId: string,
): CycleImageButtonProps[] {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];
    
    switch (s.kind) {
        case "pointDrive":
        case "poseDrive":
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
): ConstantListField[] {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];

    switch (s.kind) {
        case "pointDrive":
        case "poseDrive":
            return createDrivePIDGroup(format, setPath, segmentId, s.kind, s.constants.drive, s.constants.heading);
        case "pointTurn":
        case "angleTurn":
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, s.constants.turn, false);
        case "angleSwing":
        case "pointSwing":
            return createTurnPIDGroup(format, setPath, segmentId, s.kind, s.constants.swing, true);
    }

}