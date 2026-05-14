import { getDefaultConstants, type SegmentKind } from "../../simulation/FormatDefinition";
import { deepEqual, makeId } from "../Util";
import type { Coordinate } from "./Coordinate";
import { posesEqual, type Pose } from "./Pose";
import type { Format, FormatDef, SegmentConstants } from "../../simulation/FormatDefinition";

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
  constants: SegmentConstants<F>;
  distance?: number | null;
};

export function createStartSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, pose: Pose): Segment<F> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    disabled: false,
    locked: false,
    visible: true,
    pose,
    format,
    kind: "start",
    constants: getDefaultConstants(formatDef, format, "start"),
  };
}

export function createPointDriveSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, position: Coordinate): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "pointDrive"),
  };
}

export function createPoseDriveSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, pose: Pose): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "poseDrive"),
  };
}

export function createPointTurnSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, pose: Pose): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "pointTurn"),
  };
}

export function createAngleTurnSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, heading: number): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "angleTurn"),
  };
}

export function createAngleSwingSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, heading: number): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "angleSwing"),
  };
}

export function createPointSwingSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, pose: Pose): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "pointSwing"),
  };
}

export function createDistanceSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, pose: Pose): Segment<F> {
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
    constants: getDefaultConstants(formatDef, format, "distanceDrive"),
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