import React, { useRef, useState } from "react";
import { Control, type Coordinate, type Segment } from "../core/Path";
import { clamp, FIELD_REAL_DIMENSIONS, normalizeDeg, toInch, toPX, toRad, vector2Add, vector2Subtract, type Rectangle } from "../core/Util";
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  type dragProps = { dragging: boolean, lastPos: Coordinate }
  const [drag, setDrag] = useState<dragProps>({dragging: false, lastPos: {x: 0, y: 0}});
  
  const BASE_POS_STEP = 0.25;
  const FAST_POS_STEP = 1;

  const BASE_HEADING_STEP = 5;
  const FAST_HEADING_STEP = 10;

  const LARGE_HEADING_STEP = 90;
  const LARGE_HEADING_STEP_FAST = 180;

  const moveControl = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    const posStep = evt.shiftKey ? FAST_POS_STEP : BASE_POS_STEP;
    const headingStep = evt.shiftKey ? FAST_HEADING_STEP : BASE_HEADING_STEP;
    const largeHeadingStep = evt.shiftKey
      ? LARGE_HEADING_STEP_FAST
      : LARGE_HEADING_STEP;

    let xScale = 0;
    let yScale = 0;
    let thetaScale = 0;

    if (evt.key === "ArrowUp") yScale = posStep;
    if (evt.key === "ArrowDown") yScale = -posStep;
    if (evt.key === "ArrowLeft") xScale = -posStep;
    if (evt.key === "ArrowRight") xScale = posStep;

    if (evt.key.toLowerCase() === "a") {
      thetaScale = -headingStep;
    }
    if (evt.key.toLowerCase() === "d") {
      thetaScale = headingStep;
    }

    if (evt.key.toLowerCase() === "w") {
      thetaScale = largeHeadingStep;
    }
    if (evt.key.toLowerCase() === "s") {
      thetaScale = -largeHeadingStep;
    }

    if (xScale === 0 && yScale === 0 && thetaScale === 0) return;

    evt.preventDefault();

    setSegment(prev => ({
      ...prev,
      controls: prev.controls.map(control =>
        control.selected
          ? {
              ...control,
              heading: normalizeDeg(control.heading + thetaScale),
              position: {
                ...control.position,
                x: clamp(control.position.x + xScale, -100, 100),
                y: clamp(control.position.y + yScale, -100, 100),
              },
            }
          : control
      ),
    }));
  };

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === "Backspace" || evt.key === "Delete") {
        const next: Segment = {
          controls:
            segment.controls.filter((c) => !selectedIds.includes(c.id))
        }

      setSegment(next);
    }
    moveControl(evt);
  }

  const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (!drag?.dragging) return

    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }
    const deltaPosition = vector2Subtract(posPx, drag.lastPos);

    const next: Segment = {
      controls: 
        segment.controls.map((c) =>
          selectedIds.includes(c.id) ? { ...c, 
            position: 
            toInch(vector2Add(
              toPX(c.position, FIELD_REAL_DIMENSIONS, img), deltaPosition), FIELD_REAL_DIMENSIONS, img) } : c
        ) 
    } 

    setDrag((prev) =>
      prev ? {...prev, lastPos: posPx } : prev
    );

    setSegment(next);
  }

  const endDrag = () => setDrag({dragging: false, lastPos: {x: 0, y: 0}});
  const endSelecton = () => {
    setSelectedIds([]);
    setSegment((prevSegment) => ({
    ...prevSegment,
    controls: prevSegment.controls.map((c) => ({
      ...c,
      selected: false,
    })),
  }));  
  }

  const selectSegment = (controlId: string, shifting: boolean) => {
    setSelectedIds((prev) => {
      let nextSelectedIds: string[];
  
      if (!shifting && prev.length <= 1) {
        nextSelectedIds = [controlId];
      } else {
        nextSelectedIds = [...prev, controlId];
      }
  
      setSegment((prevSegment) => ({
        ...prevSegment,
        controls: prevSegment.controls.map((c) => ({
          ...c,
          selected: nextSelectedIds.includes(c.id),
        })),
      }));
  
      return nextSelectedIds
    })
  };

  const handleControlPointerDown = (evt: React.PointerEvent<SVGGElement>, controlId: string) => {
    if (evt.button !== 0) return;

    evt.stopPropagation();

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };

    if (!drag.dragging) {
      selectSegment(controlId, evt.shiftKey);
    }

    setDrag({ dragging: true, lastPos: posPx });  
  }

  const handleBackgroundPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (evt.button !== 0) return;
        
    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }

    const posIn = toInch(posPx, FIELD_REAL_DIMENSIONS, img);

    if (selectedIds.length > 1) {
      endSelecton();
      return
    }

    const control = new Control(posIn, 0);

    setSegment(prev => {
      const controls = [
        ...prev.controls.map(c => ({ ...c, selected: false })),
        { ...control, selected: true },
      ];

      return { ...prev, controls };
    });

    setSelectedIds([control.id])
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
        onPointerDown={handleBackgroundPointerDown}
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
            stroke="rgba(21, 96, 189, 1)"
            strokeWidth={2}
          />
        )}

        {segment.controls.map((control, idx) => (
          <g 
            key={control.id}
            onPointerDown={(e) => handleControlPointerDown(e, control.id)}
          >
            <circle
            id={control.id}
            cx={toPX(control.position, FIELD_REAL_DIMENSIONS, img).x}
            cy={toPX(control.position, FIELD_REAL_DIMENSIONS, img).y}
            r={radius}

            fill={
              selectedIds.includes(control.id)
                ? "rgba(180, 50, 11, .75)"
                : "rgba(160, 32, 7, .5)"
            }
            
            stroke="#1560BD"
            strokeWidth={idx === segment.controls.length - 1 ? 2: 0}
            />
            <line
            x1={toPX(control.position, FIELD_REAL_DIMENSIONS, img).x}
            y1={toPX(control.position, FIELD_REAL_DIMENSIONS, img).y}
            
            x2={
              toPX(
              { 
                x: control.position.x + (radius * FIELD_REAL_DIMENSIONS.w / img.w) * Math.sin(toRad(control.heading)), 
                y: control.position.y + (radius * FIELD_REAL_DIMENSIONS.h / img.h) * Math.cos(toRad(control.heading)) 
              }
              , FIELD_REAL_DIMENSIONS, 
              img).x
            }
            y2={
              toPX(
              { 
                x: control.position.x + (radius * FIELD_REAL_DIMENSIONS.w / img.w) * Math.sin(toRad(control.heading)), 
                y: control.position.y + (radius * FIELD_REAL_DIMENSIONS.h / img.h) * Math.cos(toRad(control.heading)) 
              }
              , FIELD_REAL_DIMENSIONS, 
              img).y       
            }
            stroke="black"
            strokeWidth={2}
            />
        </g>
        

        ))}


      </svg>
    </div>
  );
}