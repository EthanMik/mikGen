/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SetStateAction } from "react";
import { getDefaultConstants } from "../Constants";
import type { Path } from "../Types/Path";
import type { ConstantListField } from "../../components/PathMenu/MotionList";

export type Slot = "drive" | "heading" | "turn" | "swing";

const updateConstants = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  slot: Slot,
  partial: Partial<any>
) => {
  setPath((prev) => ({
    ...prev,
    segments: prev.segments.map((s) => {
      if (s.id !== segmentId) return s;

      const constants: any = s.constants;
      const bucket = constants?.[slot];
      if (!bucket) return s;

      return {
        ...s,
        constants: {
          ...constants,
          [slot]: {
            ...bucket,
            ...(partial as any),
          },
        },
      };
    }),
  }));
};

const createDrivePIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  driveConstants: any,
  headingConstants: any
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "drive", partial);

  const onHeadingChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "heading", partial);

  return [
    {
      header: "Exit Conditions",
      slot: "drive",
      values: driveConstants,
      fields: [
        { key: "settleError", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
      ],
      onChange: onDriveChange,
      defaults: getDefaultConstants("mikLib", "pointDrive").drive
    },
    {
      header: "Drive Constants",
      slot: "drive",
      values: driveConstants,
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", units: "in",  label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onDriveChange,
      defaults: getDefaultConstants("mikLib", "pointDrive").drive
    },
    {
      header: "Heading Constants",
      slot: "heading",
      values: headingConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", units: "deg", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onHeadingChange,
      defaults: getDefaultConstants("mikLib", "pointDrive").heading
    },
  ];
};

const createDrivePosePIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  driveConstants: any,
  headingConstants: any
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "drive", partial);

  const onHeadingChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "heading", partial);

  return [
    {
      header: "Exit Conditions",
      values: driveConstants,
      slot: "drive",
      fields: [
        { key: "settleError", label: "Settle Error", units: "in", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", units: "volt", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
      ],
      onChange: onDriveChange,
      defaults: getDefaultConstants("mikLib", "poseDrive").drive
    },
    {
      header: "Drive Constants",
      values: driveConstants,
      slot: "drive",
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
        { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
        { key: "setback", label: "Setback", units: "in", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
      ],
      onChange: onDriveChange,
      defaults: getDefaultConstants("mikLib", "poseDrive").drive
    },
    {
      header: "Heading Constants",
      values: headingConstants,
      slot: "heading",
      fields: [
        { key: "maxSpeed", label: "Max Speed", units: "volt", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "deg", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onHeadingChange,
      defaults: getDefaultConstants("mikLib", "poseDrive").heading
    },
  ];
};

const createTurnPIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  turnConstants: any
): ConstantListField[] => {

  const onTurnChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "turn", partial);

  return [
    {
      header: "Exit Conditions",
      values: turnConstants,
      slot: "turn",
      fields: [
        { key: "settleError", label: "Settle Error", units: "deg", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", units: "volt", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
      ],
      onChange: onTurnChange,
      defaults: getDefaultConstants("mikLib", "angleTurn").turn
    },
    {
      header: "Turn Constants",
      values: turnConstants,
      slot: "turn",
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "deg", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onTurnChange,
      defaults: getDefaultConstants("mikLib", "angleTurn").turn
    },
  ];
};

const createSwingPIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  turnConstants: any
): ConstantListField[] => {

  const onTurnChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "swing", partial);

  return [
    {
      header: "Exit Conditions",
      values: turnConstants,
      slot: "turn",
      fields: [
        { key: "settleError", label: "Settle Error", units: "deg", input: { bounds: [0, 99], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", units: "volt", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
      ],
      onChange: onTurnChange,
      defaults: getDefaultConstants("mikLib", "angleSwing").swing
    },
    {
      header: "Swing Constants",
      values: turnConstants,
      slot: "turn",
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 99], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 99], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 99], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "deg", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onTurnChange,
      defaults: getDefaultConstants("mikLib", "angleSwing").swing
    },
  ];
};

export function getmikLibConstantsConfig(path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): ConstantListField[] {
    const s = path.segments.find((c) => c.id === segmentId);
    if (s === undefined) return [];

    switch (s.kind) {
        case "pointDrive":
            return createDrivePIDGroup(setPath, segmentId, s.constants.drive, s.constants.heading);
        case "poseDrive":
            return createDrivePosePIDGroup(setPath, segmentId, s.constants.drive, s.constants.heading);
        case "pointTurn":
            return createTurnPIDGroup(setPath, segmentId, s.constants.turn);
        case "angleTurn":
            return createTurnPIDGroup(setPath, segmentId, s.constants.turn);
        case "angleSwing":
            return createSwingPIDGroup(setPath, segmentId, s.constants.swing);
        case "pointSwing":
            return createSwingPIDGroup(setPath, segmentId, s.constants.swing);
    }

    return [];
}