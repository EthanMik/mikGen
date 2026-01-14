import type { Format } from "../../hooks/useFormat";
import { getDefaultConstants } from "../DefaultConstants";
import { deepEqual, makeId } from "../Util";
import type { mikDriveConstants, mikSwingConstants, mikTurnConstants } from "../mikLibSim/MikConstants";
import type { revDriveConstants, ReveilLibConstants, revTurnConstants } from "../ReveiLibSim/RevConstants";
import { commandsEqual, createCommand, type Command } from "./Command";
import type { Coordinate } from "./Coordinate";
import { posesEqual, type Pose } from "./Pose";

export type SegmentKind =
  | "pointDrive"
  | "poseDrive"
  | "pointTurn" 
  | "angleTurn"
  | "angleSwing"
  | "pointSwing";

export type ConstantsByFormat = {
  mikLib: {
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
  };
  ReveilLib: {
    pointDrive: revDriveConstants;
    poseDrive: revDriveConstants;
    pointTurn: revTurnConstants;
    angleTurn: revTurnConstants;
    angleSwing: revTurnConstants;
    pointSwing: revTurnConstants;
  };
  "JAR-Template": {
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
  };
  LemLib: {
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
  };
};

export type Segment<F extends Format = Format, K extends SegmentKind = SegmentKind> = {
  id: string;
  selected: boolean;
  hovered: boolean;
  locked: boolean;
  visible: boolean;
  pose: Pose;
  command: Command;
  format: F; 
  kind: K;
  constants: ConstantsByFormat[F][K];
};

export function createPointDriveSegment<F extends Format>(format: F, position: Coordinate): Segment<F, "pointDrive"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    pose: { x: position.x, y: position.y, angle: null },
    command: createCommand(""),
    format,
    kind: "pointDrive",
    constants: getDefaultConstants(format, "pointDrive"),
  };
}

export function createPoseDriveSegment<F extends Format>(format: F, pose: Pose): Segment<F, "poseDrive"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(''),
    format,
    kind: "poseDrive",
    constants: getDefaultConstants(format, "poseDrive"),
  };
}

export function createPointTurnSegment<F extends Format>(format: F, pose: Pose): Segment<F, "pointTurn"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(''),
    format,
    kind: "pointTurn",
    constants: getDefaultConstants(format, "pointTurn"),
  };
}

export function createAngleTurnSegment<F extends Format>(format: F, heading: number): Segment<F, "angleTurn"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    command: createCommand(''),
    pose: { x: null, y: null, angle: heading },
    format,
    kind: "angleTurn",
    constants: getDefaultConstants(format, "angleTurn"),
  };
}

export function createAngleSwingSegment<F extends Format>(format: F, heading: number): Segment<F, "angleSwing"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    command: createCommand(''),
    pose: { x: null, y: null, angle: heading },
    format,
    kind: "angleSwing",
    constants: getDefaultConstants(format, "angleSwing"),
  };
}

export function createPointSwingSegment<F extends Format>(format: F, pose: Pose): Segment<F, "pointSwing"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    command: createCommand(''),
    pose,
    format,
    kind: "pointSwing",
    constants: getDefaultConstants(format, "pointSwing"),
  };
}

export function segmentsEqual(a: Segment, b: Segment): boolean {
  return (
    a.locked === b.locked &&
    a.visible === b.visible &&
    a.kind === b.kind &&
    posesEqual(a.pose, b.pose) &&
    commandsEqual(a.command, b.command) &&
    deepEqual(a.constants, b.constants)
  );
}