import { getDefaultConstants, type SegmentKind } from "../../simulation/FormatDefinition";
import { makeId } from "../Util";
import { type Pose } from "./Pose";
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
  distance: number;
  time: number;
};

export function createSegment<F extends Format>(formatDef: FormatDef<Format>, format: F, kind: SegmentKind, pose: Pose): Segment<F> {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    disabled: false,
    locked: false,
    visible: true,
    pose,
    format,
    kind,
    time: 0,
    distance: 0,
    constants: getDefaultConstants(formatDef, format, kind)
  }
}