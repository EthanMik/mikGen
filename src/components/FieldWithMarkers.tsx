import React, { useCallback, useRef, useState } from "react";
import { addControlToSegment, Control, type Coordinate, type Segment } from "../core/Path";
import { FIELD_REAL_DIMENSIONS, makeId, toInch, toPX, type Rectangle } from "../core/Util";

type FieldProps = {
  segment: Segment;
  src: string;
  img: Rectangle;
  addControl?: (segment: Segment) => void;
  deleteControl?:(id: string) => void;
};

export default function Field({
  src,
  segment,
  img,
  addControl,
  deleteControl
}: FieldProps) {

  const svgRef = useRef<SVGSVGElement | null>(null); 

const handleBackgroundPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
  if (evt.button !== 0) return;
  const tag = evt.target instanceof Element ? evt.target.tagName.toLowerCase() : "";
  if (tag === "circle") return;

  const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
  const posPx: Coordinate = { x: evt.clientX - rect.left, y: -(evt.clientY - rect.top) }

  // Convert image px -> inches (use your util)
  const posIn = toInch(posPx, FIELD_REAL_DIMENSIONS, img);

  // Make control and updated segment
  const control = new Control(posIn, 0);
  const next: Segment = { ...segment, controls: [...segment.controls, control] };

  addControl?.(next);
};

const handlePointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
  if (evt.button !== 0) return;
  const tag = evt.target instanceof Element ? evt.target.tagName.toLowerCase() : "";
  if (tag !== "circle") return;

  const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
  const posPx: Coordinate = { x: evt.clientX - rect.left, y: -(evt.clientY - rect.top) }

  
}

  return (
    <div
      className="inline-block select-none"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${img.w} ${img.h}`}
        width={img.w}
        height={img.h}
        className="block"
        onPointerDown={handleBackgroundPointerDown}
      >
        <image
          href={src}
          x={0}
          y={0}
          width={img.w}
          height={img.h}
          pointerEvents="none"
          preserveAspectRatio="none"
        />

      </svg>
    </div>
  );
}