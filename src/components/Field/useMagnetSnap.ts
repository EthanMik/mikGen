import { useState } from "react";
import type { Coordinate } from "../../core/Types/Coordinate";
import type { Path } from "../../core/Types/Path";
import { FIELD_REAL_DIMENSIONS, toPX, type Rectangle } from "../../core/Util";

const SNAP_THRESHOLD_INCH = 3;

type SnapInfo = {
  snapXpx: number | null;
  snapYpx: number | null;
};

export function useMagnetSnap() {
  const [snapInfo, setSnapInfo] = useState<SnapInfo | null>(null);

  const findSnap = (posInch: Coordinate, path: Path, img: Rectangle): Coordinate => {
    let bestXDist = SNAP_THRESHOLD_INCH;
    let bestYDist = SNAP_THRESHOLD_INCH;
    let snapX: number | null = null;
    let snapY: number | null = null;

    for (const seg of path.segments) {
      if (seg.selected || seg.locked || !seg.visible) continue;
      if (seg.pose.x === null || seg.pose.y === null) continue;

      const dx = Math.abs(posInch.x - seg.pose.x);
      const dy = Math.abs(posInch.y - seg.pose.y);

      if (dx < bestXDist) {
        bestXDist = dx;
        snapX = seg.pose.x;
      }
      if (dy < bestYDist) {
        bestYDist = dy;
        snapY = seg.pose.y;
      }
    }

    if (snapX !== null || snapY !== null) {
      const snapXpx = snapX !== null ? toPX({ x: snapX, y: 0 }, FIELD_REAL_DIMENSIONS, img).x : null;
      const snapYpx = snapY !== null ? toPX({ x: 0, y: snapY }, FIELD_REAL_DIMENSIONS, img).y : null;
      setSnapInfo({ snapXpx, snapYpx });
    } else {
      setSnapInfo(null);
    }

    return { x: snapX ?? posInch.x, y: snapY ?? posInch.y };
  };

  const clearSnap = () => setSnapInfo(null);

  return { snapInfo, findSnap, clearSnap };
}
