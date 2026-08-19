import { getDefaultConstants, type SegmentKind } from "../../simulation/FormatDefinition";
import { makeId } from "../Util";
import { type ControlPoint, type Pose } from "./Pose";
import type { Format, FormatDef, SegmentConstants } from "../../simulation/FormatDefinition";

export type Segment<F extends Format = Format> = {
  id: string;
  groupId?: string;
  disabled: boolean;
  selected: boolean;
  visible: boolean;
  pose: Pose;
  /**
   * Where a point turn aims: x/y the coordinate faced, angle the offset added to that bearing.
   * Only pointTurn/pointSwing read it, and their own pose carries nothing.
   */
  turnPose: Pose;
  /** Whether turnPose.x/y are authoritative. False: they track the drive segment in front. */
  turnLocked: boolean;
  format: F;
  kind: SegmentKind;
  constants: SegmentConstants<F>;
  distance: number;
  time: number;
  controls: ControlPoint[];
};

export function createSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, kind: SegmentKind, pose: Pose): Segment<F> {
  return {
    id: makeId(10),
    selected: false,
    disabled: false,
    visible: true,
    pose,
    // Field centre, so a point turn placed with nothing ahead of it has something to aim at
    turnPose: { x: 0, y: 0, angle: 0 },
    turnLocked: false,
    format,
    kind,
    time: 0,
    distance: 0,
    controls: [],
    constants: getDefaultConstants(formatDef, format, kind)
  }
}