import { createCommand, type Command } from "./Command";
import { kBoomerangPID, kOdomDrivePID, kOdomTurnPID, kturnPID, type PIDConstants } from "./mikLibSim/Constants";
import { makeId } from "./Util";

export interface Coordinate {
    x: number
    y: number
}

export interface Pose {
    x: number | null,
    y: number | null,
    angle: number | null
}

export type SegmentKind =
  | "pointDrive"
  | "poseDrive"
  | "pointTurn"
  | "angleTurn";

export interface Segment {
  id: string;
  selected: boolean;
  locked: boolean;
  visible: boolean;
  pose: Pose;
  command: Command;
  constants: PIDConstants;
  kind: SegmentKind;
}

export interface Path {
  segments: Segment[];
}

export function createPointDriveSegment(position: Coordinate): Segment {
  return {
    id: makeId(10),
    selected: false,
    locked: false,
    visible: true,
    pose: { x: position.x, y: position.y, angle: null },
    command: createCommand(''),
    constants: kOdomDrivePID,
    kind: "pointDrive",
  };
}

export function createPoseDriveSegment(pose: Pose): Segment {
  return {
    id: makeId(10),
    selected: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(''),
    constants: kBoomerangPID,
    kind: "poseDrive",
  };
}

export function createPointTurnSegment(pose: Pose): Segment {
  return {
    id: makeId(10),
    selected: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(''),
    constants: kOdomTurnPID,
    kind: "pointTurn",
  };
}

export function createAngleTurnSegment(heading: number): Segment {
  return {
    id: makeId(10),
    selected: false,
    locked: false,
    visible: true,
    command: createCommand(''),
    pose: { x: null, y: null, angle: heading },
    constants: kturnPID,
    kind: "angleTurn",
  };
}

function posesEqual(a: Pose, b: Pose): boolean {
  return a.x === b.x && a.y === b.y && a.angle === b.angle;
}

function commandsEqual(a: Command, b: Command): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.percent === b.percent
  );
}

function pidConstantsEqual(a: PIDConstants, b: PIDConstants): boolean {
  return (
    a.maxSpeed === b.maxSpeed &&
    a.minSpeed === b.minSpeed &&
    a.kp === b.kp &&
    a.ki === b.ki &&
    a.kd === b.kd &&
    a.starti === b.starti &&
    a.settleTime === b.settleTime &&
    a.settleError === b.settleError &&
    a.timeout === b.timeout &&
    a.lead === b.lead &&
    a.setback === b.setback
  );
}

export function segmentsEqual(a: Segment, b: Segment): boolean {
  return (
    a.locked === b.locked &&
    a.visible === b.visible &&
    a.kind === b.kind &&
    posesEqual(a.pose, b.pose) &&
    commandsEqual(a.command, b.command) &&
    pidConstantsEqual(a.constants, b.constants)
  );
}
