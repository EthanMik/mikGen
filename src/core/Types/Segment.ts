import { kBoomerangPID, kOdomDrivePID, kOdomHeadingPID, kOdomTurnPID, kturnPID, SegmentConstantsEqual, type PIDConstants } from "../mikLibSim/Constants";
import { makeId } from "../Util";
import { commandsEqual, createCommand, type Command } from "./Command";
import type { Coordinate } from "./Coordinate";
import { posesEqual, type Pose } from "./Pose";

export type SegmentKind =
  | "pointDrive"
  | "poseDrive"
  | "pointTurn" 
  | "angleTurn";

export type DriveConstants = {
  drive: PIDConstants;
  heading: PIDConstants;
};

export type TurnConstants = {
  turn: PIDConstants;
};

export function isTurnConstants(x: TurnConstants | DriveConstants): x is TurnConstants {
  return "turn" in x;
}

export function isDriveConstants(x: TurnConstants | DriveConstants): x is DriveConstants {
  return "drive" in x;
}

export type SegmentConstantsByKind = {
  pointDrive: DriveConstants;
  poseDrive: DriveConstants;
  pointTurn: TurnConstants;
  angleTurn: TurnConstants;
};

export interface Segment<K extends SegmentKind = SegmentKind> {
  id: string;
  selected: boolean;
  hovered: boolean;
  locked: boolean;
  visible: boolean;
  pose: Pose;
  command: Command;
  kind: K;
  constants: SegmentConstantsByKind[K];
}

const clonePID = (c: PIDConstants): PIDConstants => ({ ...c });

export function getDefaultConstantsForKind<K extends SegmentKind>(kind: K): SegmentConstantsByKind[K] {
  switch (kind) {
    case "pointDrive":
    case "poseDrive":
      return {
        drive: clonePID(kOdomDrivePID),
        heading: clonePID(kOdomHeadingPID),
      } as SegmentConstantsByKind[K];

    case "pointTurn":
      return { turn: clonePID(kturnPID) } as SegmentConstantsByKind[K];
    case "angleTurn":
      return { turn: clonePID(kOdomTurnPID) } as SegmentConstantsByKind[K];
  }
}

export function createPointDriveSegment(position: Coordinate): Segment<"pointDrive"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    pose: { x: position.x, y: position.y, angle: null },
    command: createCommand(''),
    kind: "pointDrive",
    constants: getDefaultConstantsForKind("pointDrive"),
  };
}

export function createPoseDriveSegment(pose: Pose): Segment<"poseDrive"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(''),
    kind: "poseDrive",
    constants: getDefaultConstantsForKind("poseDrive"),
  };
}

export function createPointTurnSegment(pose: Pose): Segment<"pointTurn"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(''),
    kind: "pointTurn",
    constants: getDefaultConstantsForKind("pointTurn"),
  };
}

export function createAngleTurnSegment(heading: number): Segment<"angleTurn"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    command: createCommand(''),
    pose: { x: null, y: null, angle: heading },
    kind: "angleTurn",
    constants: getDefaultConstantsForKind("angleTurn"),
  };
}

export function segmentsEqual(a: Segment, b: Segment): boolean {
  return (
    a.locked === b.locked &&
    a.visible === b.visible &&
    a.kind === b.kind &&
    posesEqual(a.pose, b.pose) &&
    commandsEqual(a.command, b.command) &&
    SegmentConstantsEqual(a.constants, b.constants)
  );
}