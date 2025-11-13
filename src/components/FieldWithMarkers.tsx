import React, { useRef, useState } from "react";
import { Control, type Coordinate, type Segment } from "../core/Path";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, type Rectangle } from "../core/Util";

type FieldProps = {
  segment: Segment;
  src: string;
  img: Rectangle;
  radius: number;
  addControl?: (segment: Segment) => void;
  deleteControl?:(id: string) => void;
};

export default function Field({
  src,
  segment,
  img,
  radius,
  addControl,
  deleteControl
}: FieldProps) {

  const svgRef = useRef<SVGSVGElement | null>(null); 
  const [selectedId, setSelectedId] = useState<string>("");

  type DragState = {id:string; dx: number, dy: number } | null;
  const [drag, setDrag] = useState<DragState>(null);

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === "Backspace" || evt.key === "Delete") {
      deleteControl?.(selectedId);
    }
  }

  const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    
  }

  const handlePointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (evt.button !== 0) return;
    const target = evt.target as Element 
    const tag = target.tagName.toLowerCase();

    if (tag === "circle") {
      const id = target.getAttribute("id")
      const controlId: string = id === null ? "" : id;
      setSelectedId(controlId)
      return;
    }

    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }

    const posIn = toInch(posPx, FIELD_REAL_DIMENSIONS, img);

    const control = new Control(posIn, 0);
    const next: Segment = { ...segment, controls: [...segment.controls, control] };

    addControl?.(next);
  };


  return (
    <div
      className="inline-block select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${img.w} ${img.h}`}
        width={img.w}
        height={img.h}
        className="block"
        onPointerDown={handlePointerDown}
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

        {segment.controls.map((control) => (
          <g key={control.id}>
            <circle
            id={control.id}
            cx={toPX(control.position, FIELD_REAL_DIMENSIONS, img).x}
            cy={toPX(control.position, FIELD_REAL_DIMENSIONS, img).y}
            r={radius}
            fill={
              control.id === selectedId
                ? "rgba(239,68,68,0.6)"
                : "rgba(59,130,246,0.25)"
            }

            stroke="rgb(59,130,246)"
            strokeWidth={2}
            />
          </g>
        

        ))}


      </svg>
    </div>
  );
}