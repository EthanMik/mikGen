import { kBoomerangPID, kOdomDrivePID, kOdomTurnPID, kturnPID, PIDConstantsEqual, type PIDConstants } from "../mikLibSim/Constants";
import { makeId } from "../Util";
import { commandsEqual, createCommand, type Command } from "./Command";
import type { Coordinate } from "./Coordinate";
import { posesEqual, type Pose } from "./Pose";

export type SegmentKind =
  | "pointDrive"
  | "poseDrive"
  | "pointTurn"
  | "angleTurn";

export interface Segment {
  id: string;
  selected: boolean;
  hovered: boolean;
  locked: boolean;
  visible: boolean;
  pose: Pose;
  command: Command;
  constants: PIDConstants;
  kind: SegmentKind;
}

export function createPointDriveSegment(position: Coordinate): Segment {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
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
    hovered: false,
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
    hovered: false,
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
    hovered: false,
    locked: false,
    visible: true,
    command: createCommand(''),
    pose: { x: null, y: null, angle: heading },
    constants: kturnPID,
    kind: "angleTurn",
  };
}

export function segmentsEqual(a: Segment, b: Segment): boolean {
  return (
    a.locked === b.locked &&
    a.visible === b.visible &&
    a.kind === b.kind &&
    posesEqual(a.pose, b.pose) &&
    commandsEqual(a.command, b.command) &&
    PIDConstantsEqual(a.constants, b.constants)
  );
}