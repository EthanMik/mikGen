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

export function PointDriveSegment(position: Coordinate): Segment {
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

export function PoseDriveSegment(pose: Pose): Segment {
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

export function PointTurnSegment(pose: Pose): Segment {
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

export function AngleTurnSegment(heading: number): Segment {
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