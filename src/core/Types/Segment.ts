import { getDefaultConstants, type SegmentKind } from "../../simulation/InitialDefaults";
import { deepEqual, makeId } from "../Util";
import type { Coordinate } from "./Coordinate";
import { posesEqual, type Pose } from "./Pose";
import type { Format, SegmentConstants } from "../../simulation/FormatDefinition";

export type Segment<F extends Format = Format> = {
  id: string;
  groupId?: string;
  disabled: boolean;
  selected: boolean;
  hovered: boolean;
  locked: boolean;
  visible: boolean;
  pose: Pose;
  format: F;
  kind: SegmentKind;
  constants: SegmentConstants<F>
};

export function createPointDriveSegment<F extends Format>(format: F, position: Coordinate): Segment<F> {
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

export function createPoseDriveSegment<F extends Format>(format: F, pose: Pose): Segment<F> {
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

export function createPointTurnSegment<F extends Format>(format: F, pose: Pose): Segment<F> {
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

export function createAngleTurnSegment<F extends Format>(format: F, heading: number): Segment<F> {
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

export function createAngleSwingSegment<F extends Format>(format: F, heading: number): Segment<F> {
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

export function createPointSwingSegment<F extends Format>(format: F, pose: Pose): Segment<F> {
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

export function createDistanceSegment<F extends Format>(format: F, pose: Pose): Segment<F> {
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