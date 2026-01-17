import type { Path } from "../../core/Types/Path";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildIndexById(segments: any[]) {
  const m = new Map<string, number>();
  segments.forEach((s, i) => m.set(s.id, i));
  return m;
}

export const moveSegment = (setPath: React.Dispatch<React.SetStateAction<Path>>, fromId: string | null, toIndex: number) => {
    if (!fromId) return;

    setPath((prev) => {
      const original = prev.segments;
      const fromIdx = original.findIndex((s) => s.id === fromId);
      if (fromIdx === -1) return prev;

      const dropTarget =
        toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;

      const droppedOnGroup = dropTarget?.kind === "group";
      const targetGroupId = droppedOnGroup ? dropTarget!.groupId : null;
      let desiredIndex = droppedOnGroup ? toIndex + 1 : toIndex;

      if (desiredIndex < 0) desiredIndex = 0;
      if (desiredIndex > original.length) desiredIndex = original.length;

      const segments = [...original];
      const [seg] = segments.splice(fromIdx, 1);

      if (targetGroupId != null && seg.kind !== "group") {
        seg.groupId = targetGroupId;
      }

      if (desiredIndex === 0 && seg.kind !== "start" && seg.kind !== "group") {
        seg.kind = "start";
        if (seg.pose.x === null) seg.pose.x = 0;
        if (seg.pose.y === null) seg.pose.y = 0;
        if (seg.pose.angle === null) seg.pose.angle = 0;
      }

      if (desiredIndex === 0 && seg.kind === "start") {
        seg.kind = "poseDrive";
      }

      let insertIdx = desiredIndex;
      if (fromIdx < desiredIndex) insertIdx = desiredIndex - 1;

      if (insertIdx < 0) insertIdx = 0;
      if (insertIdx > segments.length) insertIdx = segments.length;

      segments.splice(insertIdx, 0, seg);

      const next = { ...prev, segments };
      AddToUndoHistory({ path: next });
      return next;
    });
  };

export function appendToGroup(setPath: React.Dispatch<React.SetStateAction<Path>>,fromId: string | null, groupSegmentId: string) {
    if (!fromId) return;

    setPath((prev) => {
      const segments = prev.segments;
      const indexById = buildIndexById(segments);

      const groupSeg = segments.find((s) => s.id === groupSegmentId);
      if (!groupSeg || groupSeg.kind !== "group") return prev;

      const gid = groupSeg.groupId ?? groupSeg.id;
      const groupIdx = indexById.get(groupSegmentId);
      if (groupIdx == null) return prev;

      // Append = after the last child; if none, right after the header
      let insertIndex = groupIdx + 1;
      for (let i = segments.length - 1; i >= 0; i--) {
        const s = segments[i];
        if (s.groupId === gid && s.kind !== "group" && s.id !== groupSegmentId) {
          insertIndex = i + 1;
          break;
        }
      }

      const nextSegments = applyMoveSegments(segments, fromId, insertIndex, gid);
      if (!nextSegments) return prev;

      const next = { ...prev, segments: nextSegments };
      AddToUndoHistory({ path: next });
      return next;
    });
  };
