import { useRef, useState } from "react";
import type { Coordinate } from "../../core/Types/Coordinate";
import type { Path } from "../../core/Types/Path";
import type { Rectangle } from "../../core/Util";
import { pointerToSvg, selectSegmentsInBox } from "./FieldUtils";
import React from "react";

const DRAG_THRESHOLD = 5;

type BoxRect = { x: number; y: number; w: number; h: number };

type BoxSelectData = {
  startSvg: Coordinate;
  startInch: Coordinate;
  currentSvg: Coordinate;
  isDragging: boolean;
};

export function useBoxSelect() {
  const [boxSelectRect, setBoxSelectRect] = useState<BoxRect | null>(null);
  const data = useRef<BoxSelectData | null>(null);

  const startBoxSelect = (startSvg: Coordinate, startInch: Coordinate) => {
    data.current = { startSvg, startInch, currentSvg: startSvg, isDragging: false };
    setBoxSelectRect({ x: startSvg.x, y: startSvg.y, w: 0, h: 0 });
  };

  const updateBoxSelect = (evt: React.PointerEvent<SVGSVGElement>, svgEl: SVGSVGElement, img: Rectangle, path: Path, setPath: React.Dispatch<React.SetStateAction<Path>>) => {
    if (!data.current) return;
    const cur = pointerToSvg(evt, svgEl);
    data.current.currentSvg = cur;
    const dx = cur.x - data.current.startSvg.x;
    const dy = cur.y - data.current.startSvg.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
      data.current.isDragging = true;
    }
    const sx = data.current.startSvg.x, sy = data.current.startSvg.y;
    setBoxSelectRect({
      x: Math.min(sx, cur.x),
      y: Math.min(sy, cur.y),
      w: Math.abs(cur.x - sx),
      h: Math.abs(cur.y - sy),
    });

    setPath(selectSegmentsInBox(path, data.current.startSvg, cur, img));
  };

  const finalizeBoxSelect = (
    img: Rectangle,
    path: Path,
    setPath: React.Dispatch<React.SetStateAction<Path>>,
    onClickFallback: (startInch: Coordinate) => void,
  ) => {
    const d = data.current;
    if (!d) return;
    if (d.isDragging) {
      setPath(selectSegmentsInBox(path, d.startSvg, d.currentSvg, img));
    } else {
      onClickFallback(d.startInch);
    }
    data.current = null;
    setBoxSelectRect(null);
  };

  const cancelBoxSelect = () => {
    data.current = null;
    setBoxSelectRect(null);
  };

  return {
    boxSelectRect,
    isBoxSelecting: boxSelectRect !== null && (boxSelectRect.w > 400 || boxSelectRect.h > 400),
    startBoxSelect,
    updateBoxSelect,
    finalizeBoxSelect,
    cancelBoxSelect,
  };
}
