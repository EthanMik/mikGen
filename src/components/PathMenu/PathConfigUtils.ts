import type { Path } from "../../core/Types/Path";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";

function getGroupInsertMeta(
  segments: any[],
  groupHeaderId: string,
  draggedId: string | null
) {
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
    // Skip the dragged segment when calculating bottom index
    if (s.id === draggedId) continue;
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
  opts?: { headerDrop?: "top" | "bottom"; targetGroupId?: string; skipGroupHandling?: boolean }
) => {
  if (!fromId) return;

  setPath((prev) => {
    const original = prev.segments;
    const fromIdx = original.findIndex((s) => s.id === fromId);
    if (fromIdx === -1) return prev;

    const draggedSeg = original[fromIdx];

    // Prevent moving the start segment (index 0)
    if (fromIdx === 0) return prev;

    // Prevent groups from being moved to position 0
    if (draggedSeg.kind === "group" && toIndex === 0) return prev;

    // Don't move if dropping on itself
    if (fromIdx === toIndex) return prev;

    const dropTarget =
      toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;

    // Only treat as group header drop if we're NOT skipping group handling
    const droppedOnGroupHeader = !opts?.skipGroupHandling && dropTarget?.kind === "group";
    const groupHeaderId = droppedOnGroupHeader ? dropTarget!.id : null;

    // Create new array and remove the dragged segment
    const segments = [...original];
    const [rawSeg] = segments.splice(fromIdx, 1);
    if (!rawSeg) return prev;

    // Clone the segment deeply
    const seg = {
      ...rawSeg,
      pose: rawSeg.pose ? { ...rawSeg.pose } : rawSeg.pose,
    };

    let insertIdx = toIndex;

    // Adjust index since we removed an item
    if (fromIdx < toIndex) {
      insertIdx = toIndex - 1;
    }

    // Clamp to valid range - minimum 1 to prevent inserting before start
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;

    // Handle group membership
    if (seg.kind !== "group") {
      if (opts?.skipGroupHandling) {
        // Explicitly dropping outside any group (e.g., "above" a group header)
        seg.groupId = undefined;
      } else if (groupHeaderId) {
        // Dropping on a group header - use headerDrop option
        const meta = getGroupInsertMeta(segments, groupHeaderId, fromId);
        if (meta) {
          seg.groupId = meta.gid;
          const mode = opts?.headerDrop ?? "bottom";
          
          // These indices are already correct for the array without the dragged item
          if (mode === "top") {
            insertIdx = meta.topInsertIndex;
          } else {
            insertIdx = meta.bottomInsertIndex;
          }
        }
      } else if (opts?.targetGroupId) {
        // Explicit group ID passed (for drops within group children)
        seg.groupId = opts.targetGroupId;
      } else if (dropTarget?.groupId != null && dropTarget?.kind !== "group") {
        // Dropping on a group child - inherit its group
        seg.groupId = dropTarget.groupId;
      } else {
        // Dropping outside any group
        seg.groupId = undefined;
      }
    }

    // Final clamp - minimum 1 to prevent inserting before start
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;

    segments.splice(insertIdx, 0, seg);

    const next = { ...prev, segments };
    AddToUndoHistory({ path: next });
    return next;
  });
};