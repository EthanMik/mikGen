import type { Path } from "../../core/Types/Path";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGroupInsertMeta(segments: any[], groupHeaderId: string) {
  const headerIdx = segments.findIndex((s) => s.id === groupHeaderId);
  if (headerIdx === -1) return null;

  const groupSeg = segments[headerIdx];
  if (!groupSeg || groupSeg.kind !== "group") return null;

  const gid = groupSeg.groupId ?? groupSeg.id;

  // TOP is always right after header
  const topInsertIndex = headerIdx + 1;

  // BOTTOM = after last child (or right after header if none)
  let bottomInsertIndex = headerIdx + 1;
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    if (s.groupId === gid && s.kind !== "group" && s.id !== groupHeaderId) {
      bottomInsertIndex = i + 1;
      break;
    }
  }

  return { gid, headerIdx, topInsertIndex, bottomInsertIndex };
}

export const moveSegment = (
  setPath: React.Dispatch<React.SetStateAction<Path>>,
  fromId: string | null,
  toIndex: number,
  opts?: { headerDrop?: "top" | "bottom" }
) => {
  if (!fromId) return;

  setPath((prev) => {
    const original = prev.segments;

    const fromIdx = original.findIndex((s) => s.id === fromId);
    if (fromIdx === -1) return prev;

    const dropTarget =
      toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;

    const droppedOnGroupHeader = dropTarget?.kind === "group";
    const groupHeaderId = droppedOnGroupHeader ? dropTarget!.id : null;

    const segments = [...original];
    const [rawSeg] = segments.splice(fromIdx, 1);
    if (!rawSeg) return prev;

    const seg = {
      ...rawSeg,
      pose: rawSeg.pose ? { ...rawSeg.pose } : rawSeg.pose,
    };

    let insertIdx = toIndex;
    if (insertIdx < 0) insertIdx = 0;
    if (insertIdx > segments.length) insertIdx = segments.length;

    let recomputedInsert = false;

    const droppedOnGroupChild =
      !droppedOnGroupHeader && dropTarget?.groupId != null && dropTarget?.kind !== "group";

    if (seg.kind !== "group") {
      if (groupHeaderId) {
        const meta = getGroupInsertMeta(segments, groupHeaderId);
        if (meta) {
          seg.groupId = meta.gid;

          // ✅ default header drop = BOTTOM (unless explicitly forced TOP)
          const mode = opts?.headerDrop ?? "bottom";
          insertIdx = mode === "top" ? meta.topInsertIndex : meta.bottomInsertIndex;

          recomputedInsert = true;
        }
      } else if (droppedOnGroupChild) {
        seg.groupId = dropTarget!.groupId;
      } else {
        seg.groupId = undefined;
      }
    }

    if (!recomputedInsert && fromIdx < insertIdx) insertIdx -= 1;

    if (insertIdx < 0) insertIdx = 0;
    if (insertIdx > segments.length) insertIdx = segments.length;

    if (insertIdx === 0 && seg.kind !== "start" && seg.kind !== "group") {
      seg.kind = "start";
      if (seg.pose?.x === null) seg.pose.x = 0;
      if (seg.pose?.y === null) seg.pose.y = 0;
      if (seg.pose?.angle === null) seg.pose.angle = 0;
    }
    if (insertIdx === 0 && seg.kind === "start") {
      seg.kind = "poseDrive";
    }

    segments.splice(insertIdx, 0, seg);

    const next = { ...prev, segments };
    AddToUndoHistory({ path: next });
    return next;
  });
};
