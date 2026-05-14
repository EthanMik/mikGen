import type { Path } from "../../core/Types/Path";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import type { Segment } from "../../core/Types/Segment";

export const setupDragTransfer = (e: { dataTransfer: DataTransfer }, segmentId: string) => {
  e.dataTransfer.setData('text/plain', segmentId);
  e.dataTransfer.effectAllowed = 'move';
  const emptyImg = new Image();
  emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  e.dataTransfer.setDragImage(emptyImg, 0, 0);
};

export const buildDraggingIds = (segments: Segment[], segmentId: string): string[] => {
  const segment = segments.find(s => s.id === segmentId);
  if (segment?.selected) {
    const selectedIds = segments.filter((s, idx) => s.selected && idx > 0).map(s => s.id);
    return selectedIds.length > 0 ? selectedIds : [segmentId];
  }
  return [segmentId];
};

export const moveSegment = (
  setPath: React.Dispatch<React.SetStateAction<Path>>,
  fromId: string | null,
  toIndex: number,
) => {
  if (!fromId) return;

  let didChange = false;
  setPath((prev) => {
    const original = prev.segments;
    const fromIdx = original.findIndex((s) => s.id === fromId);
    if (fromIdx === -1) return prev;

    const draggedSeg = original[fromIdx];

    if (fromIdx === 0) return prev;
    if (draggedSeg.locked) return prev;
    if (fromIdx === toIndex) return prev;

    const segments = [...original];
    const [rawSeg] = segments.splice(fromIdx, 1);
    if (!rawSeg) return prev;

    const seg = { ...rawSeg, pose: rawSeg.pose ? { ...rawSeg.pose } : rawSeg.pose };

    let insertIdx = fromIdx < toIndex ? toIndex - 1 : toIndex;
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;

    segments.splice(insertIdx, 0, seg);

    didChange = true;
    return { ...prev, segments };
  });
  if (didChange) saveSnapshot();
};

export const moveMultipleSegments = (
  setPath: React.Dispatch<React.SetStateAction<Path>>,
  fromIds: string[],
  toIndex: number,
) => {
  if (!fromIds || fromIds.length === 0) return;

  if (fromIds.length === 1) {
    moveSegment(setPath, fromIds[0], toIndex);
    return;
  }

  let didChange = false;
  setPath((prev) => {
    const original = prev.segments;

    const fromIndices = fromIds.map(id => original.findIndex(s => s.id === id));
    if (fromIndices.some(idx => idx === -1)) return prev;
    if (fromIndices.some(idx => idx === 0)) return prev;
    if (fromIndices.some(idx => original[idx].locked)) return prev;

    const sortedIndices = [...fromIndices].sort((a, b) => a - b);

    const fromIdSet = new Set(fromIds);
    const dropTarget = toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;
    if (dropTarget && fromIdSet.has(dropTarget.id)) return prev;

    const segmentsToMove = sortedIndices.map(idx => {
      const rawSeg = original[idx];
      return { ...rawSeg, pose: rawSeg.pose ? { ...rawSeg.pose } : rawSeg.pose };
    });

    const segments = original.filter(s => !fromIdSet.has(s.id));

    let insertIdx = toIndex - sortedIndices.filter(idx => idx < toIndex).length;
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;

    segments.splice(insertIdx, 0, ...segmentsToMove);

    didChange = true;
    return { ...prev, segments };
  });
  if (didChange) saveSnapshot();
};
