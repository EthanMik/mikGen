import React, { useRef, useState } from "react";
import { Control, type Coordinate, type Segment } from "../core/Path";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, type Rectangle } from "../core/Util";
import { useSegment } from "../hooks/useSegment";

type FieldProps = {
src: string;
  img: Rectangle;
  radius: number;
};

export default function Field({
  src,
  img,
  radius,
}: FieldProps) {

  const { segment, setSegment } = useSegment();
  const svgRef = useRef<SVGSVGElement | null>(null); 
  const [selectedId, setSelectedId] = useState<string>("");
  const [drag, setDrag] = useState<string | null>(null);
  

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === "Backspace" || evt.key === "Delete") {
        const next: Segment = {
          controls:
            segment.controls.filter((c) => c.id !== selectedId)
        }

      setSegment(next);
    }
  }

  const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return

    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }
    
    const next: Segment = {
      controls: 
        segment.controls.map((c) =>
          c.id === drag ? { ...c, position: toInch(posPx, FIELD_REAL_DIMENSIONS, img) } : c
        ) 
    } 

    setSegment?.(next);
  }

  const endDrag = () => setDrag(null);

  const handlePointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (evt.button !== 0) return;
    const target = evt.target as Element 
    const tag = target.tagName.toLowerCase();
    
    const id = target.getAttribute("id")
    const controlId: string = id === null ? "" : id;

    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }

    const posIn = toInch(posPx, FIELD_REAL_DIMENSIONS, img);

    if (tag === "circle") {
      if (!drag) {
        setSelectedId(controlId)

        setSegment({
          ...segment, controls: segment.controls.map(c => ({
            ...c, selected: c.id === controlId
          })),

        });

      }
        
      setDrag(controlId)
      return;
    }

    const control = new Control(posIn, 0);
    const next: Segment = { ...segment, controls: [...segment.controls, control] };

    setSegment?.(next);
  };

  const controls = segment.controls;

  const pointsStr =
    controls.length > 1
      ? controls
          .map((m) => {
            const p = toPX(m.position, FIELD_REAL_DIMENSIONS, img);
            return `${p.x},${p.y}`;
          })
          .join(" ")
      : "";


  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${img.w} ${img.h}`}
        width={img.w}
        height={img.h}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
      >

        <image
          href={src}
          x={0}
          y={0}
          width={img.w}
          height={img.h}
        />

        {segment.controls.length >= 2 && (
          <polyline
            points={pointsStr}
            fill="none"
            stroke="rgb(59,130,246)"
            strokeWidth={2}
          />
        )}

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