import type { Format } from "../../hooks/appStateDefaults";
import { getDefaultConstants } from "../InitialDefaults";
import { deepEqual, makeId } from "../Util";
import type { mikDriveConstants, mikSwingConstants, mikTurnConstants } from "../mikLibSim/MikConstants";
import type { revDriveConstants, revTurnConstants } from "../ReveiLibSim/RevConstants";
import type { LemAngularConstants, LemMoveConstants } from "../LemLibSim/LemConstants";
import type { Coordinate } from "./Coordinate";
import { posesEqual, type Pose } from "./Pose";

export type SegmentKind =
  | "pointDrive"
  | "poseDrive"
  | "pointTurn" 
  | "angleTurn"
  | "angleSwing"
  | "pointSwing"
  | "distanceDrive"
  | "start"
  | "group";

export type ConstantsByFormat = {
  mikLib: {
    distanceDrive: mikDriveConstants;
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
    start: undefined;
    group: string;
  };
  ReveilLib: {
    distanceDrive: revDriveConstants;
    pointDrive: revDriveConstants;
    poseDrive: revDriveConstants;
    pointTurn: revTurnConstants;
    angleTurn: revTurnConstants;
    angleSwing: revTurnConstants;
    pointSwing: revTurnConstants;
    start: undefined;
    group: string;
  };
  RevMecanum: {
    distanceDrive: revDriveConstants;
    pointDrive: revDriveConstants;
    poseDrive: revDriveConstants;
    pointTurn: revTurnConstants;
    angleTurn: revTurnConstants;
    angleSwing: revTurnConstants;
    pointSwing: revTurnConstants;
    start: undefined;
    group: string;
  };
  "JAR-Template": {
    distanceDrive: mikDriveConstants;
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
    start: undefined;
    group: string;
  };
  LemLib: {
    distanceDrive: LemMoveConstants;
    pointDrive: LemMoveConstants;
    poseDrive: LemMoveConstants;
    pointTurn: LemAngularConstants;
    angleTurn: LemAngularConstants;
    angleSwing: LemAngularConstants;
    pointSwing: LemAngularConstants;
    start: undefined;
    group: string;
  };
  "RW-Template": {
    distanceDrive: mikDriveConstants;
    pointDrive: mikDriveConstants;
    poseDrive: mikDriveConstants;
    pointTurn: mikTurnConstants;
    angleTurn: mikTurnConstants;
    angleSwing: mikSwingConstants;
    pointSwing: mikSwingConstants;
    start: undefined;
    group: string;
  };
};

export type Segment<F extends Format = Format, K extends SegmentKind = SegmentKind> = {
  id: string;
  groupId?: string;
  disabled: boolean;
  selected: boolean;
  hovered: boolean;
  locked: boolean;
  visible: boolean;
  pose: Pose;
  format: F;
  kind: K;
  constants: ConstantsByFormat[F][K];
};

export function createSegmentGroup(): Partial<Segment> {
  return {
    id: makeId(10),
    groupId: makeId(10),
    disabled: false,
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    constants: "Group",
    pose: { x: null, y: null, angle: null },
    kind: "group",
  }
}

export function createPointDriveSegment<F extends Format>(format: F, position: Coordinate): Segment<F, "pointDrive"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    pose: { x: position.x, y: position.y, angle: null },
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
    disabled: false,
    locked: false,
    visible: true,
    pose,
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
    disabled: false,
    visible: true,
    pose,
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
    disabled: false,
    visible: true,
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
    disabled: false,
    visible: true,
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
    disabled: false,
    visible: true,
    pose,
    format,
    kind: "pointSwing",
    constants: getDefaultConstants(format, "pointSwing"),
  };
}

export function createDistanceSegment<F extends Format>(format: F, pose: Pose): Segment<F, "distanceDrive"> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    pose,
    format,
    kind: "distanceDrive",
    constants: getDefaultConstants(format, "distanceDrive"),
  };
}


export function segmentsEqual(a: Segment, b: Segment): boolean {
  return (
    a.locked === b.locked &&
    a.visible === b.visible &&
    a.kind === b.kind &&
    posesEqual(a.pose, b.pose) &&
    deepEqual(a.constants, b.constants)
  );
}