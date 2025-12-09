import React, { useEffect, useRef, useState } from "react";
import { PointDriveSegment, type Coordinate, type Path } from "../core/Path";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, toRad, vector2Add, vector2Subtract, type Rectangle } from "../core/Util";
import { usePath } from "../hooks/usePath";
import useFieldMacros from "../hooks/useFieldMacros";
import RobotView from "./Util/RobotView";
import { usePose } from "../hooks/usePose";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import { usePathVisibility } from "./usePathVisibility";

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

  const [ path, setPath ] = usePath();
  const svgRef = useRef<SVGSVGElement | null>(null); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pose, setPose] = usePose();
  const [ robotVisible, setRobotVisibility ] = useRobotVisibility();
  const [ pathVisible, setPathVisibility] = usePathVisibility();

  type dragProps = { dragging: boolean, lastPos: Coordinate }
  const [drag, setDrag] = useState<dragProps>({dragging: false, lastPos: {x: 0, y: 0}});
  
  const { moveControl, 
          moveHeading,
          deleteControl,
  } = useFieldMacros();

  useEffect(() => {
    localStorage.setItem("path", JSON.stringify(path));
  }, [path])

  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key.toLowerCase() === "r") {
        setRobotVisibility(v => !v)
        evt.stopPropagation();
      }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
      
  }, []);

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    deleteControl(evt);
    moveControl(evt);
    moveHeading(evt);
  }
  
  const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (!drag?.dragging) return

    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }
    const deltaPosition = vector2Subtract(posPx, drag.lastPos);

    const next: Path = {
      segments: path.segments.map((c) => {
        if (!selectedIds.includes(c.id) || c.locked) return c;

        const currentPx = toPX(
          { x: c.pose.x, y: c.pose.y },
          FIELD_REAL_DIMENSIONS,
          img
        );

        const newPx = vector2Add(currentPx, deltaPosition);
        const newInch = toInch(newPx, FIELD_REAL_DIMENSIONS, img);

        return {
          ...c,
          pose: {
            ...c.pose,
            x: newInch.x,
            y: newInch.y,
          },
        };
      }),
    };

    setDrag((prev) =>
      prev ? {...prev, lastPos: posPx } : prev
    );

    setPath(next);
  }

  const endDrag = () => setDrag({dragging: false, lastPos: {x: 0, y: 0}});
  const endSelecton = () => {
    setSelectedIds([]);
    setPath((prevSegment) => ({
    ...prevSegment,
    segments: prevSegment.segments.map((c) => ({
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
      } else if (shifting && path.segments.find((c) => c.id === controlId && c.selected)) {
        nextSelectedIds = prev.filter((c) => c !== controlId)
      } else {
        nextSelectedIds = [...prev, controlId];
      }
  
      setPath((prevSegment) => ({
        ...prevSegment,
        segments: prevSegment.segments.map((c) => ({
          ...c,
          selected: !c.locked && nextSelectedIds.includes(c.id),
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
    if (evt.button !== 0 || pathVisible) return;
        
    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }

    const posIn = toInch(posPx, FIELD_REAL_DIMENSIONS, img);

    if (selectedIds.length > 1) {
      endSelecton();
      return
    }

    // const control = new Control(posIn, 0);
    const control = PointDriveSegment(posIn);

    setPath(prev => {
      let selectedIndex = prev.segments.findIndex(c => c.selected);
      selectedIndex = selectedIndex === -1 ? selectedIndex = prev.segments.length : selectedIndex + 1;

      const oldControls = prev.segments;

      const newControl = { ...control, selected: !control.locked };

      const inserted =
        selectedIndex >= 0
          ? [
              ...oldControls.slice(0, selectedIndex),
              newControl,
              ...oldControls.slice(selectedIndex)
            ]
          : [...oldControls, newControl];

      const controls = inserted.map(c =>
        c === newControl ? c : { ...c, selected: false }
      );

      return {
        ...prev,
        segments: controls,
      };
    });

    setSelectedIds([control.id])
  };

  const getSnapPose = (controls: typeof path.segments, idx: number) => {
    for (let i = idx; i >= 0; i--) {
      const c = controls[i];
      if (c.pose.x != null && c.pose.y != null) {
        return c.pose;
      }
    }
    return null;
  };

  const controls = path.segments;

  const moveToPoints =
    controls.length > 1
      ? controls
          .map((m) => {
            if (m.pose.x === null || m.pose.y === null) return;
            const p = toPX({x: m.pose.x, y: m.pose.y}, FIELD_REAL_DIMENSIONS, img);
            return `${p.x},${p.y}`;
          })
          .join(" ")
      : "";
  
  const boomerangToPoints = 
    controls.length > 1
      ? controls
          .map((m, idx) => {
            if (idx < 1) return

            const lead = .4;
            const pStart = toPX({x: controls[idx - 1].pose.x, y: controls[idx - 1].pose.y}, FIELD_REAL_DIMENSIONS, img);
            const pEnd = toPX({x: m.pose.x, y: m.pose.y}, FIELD_REAL_DIMENSIONS, img);
            const ΘEnd = m.pose.angle;
            const h = Math.sqrt(((pStart.x - pEnd.x) * (pStart.x - pEnd.x)) 
                              + ((pStart.y - pEnd.y) * (pStart.y - pEnd.y)));

            const x1 = pEnd.x - h * Math.sin(toRad(ΘEnd)) * lead
            const y1 = pEnd.y + h * Math.cos(toRad(ΘEnd)) * lead

            let boomerangPts: string[] = [];
            for (let t = 0; t <= 1; t += .05) {
              const x = ((1 - t) * ((1 - t) * pStart.x + t * x1) + t * ((1 - t) * x1 + t * pEnd.x))
              const y = ((1 - t) * ((1 - t) * pStart.y + t * y1) + t * ((1 - t) * y1 + t * pEnd.y))
              boomerangPts = [...boomerangPts, `${x},${y}`]
            }

            return boomerangPts.join(" ")
          })
          .join(" ")
      : "";

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseLeave={endDrag}
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
        {/* Field image */}
        <image
          href={src}
          x={0}
          y={0}
          width={img.w}
          height={img.h}
        />

        {/* Path */}
        {!pathVisible && path.segments.length >= 2 && (
          <polyline
            points={moveToPoints}
            fill="none"
            stroke="rgba(21, 96, 189, 1)"
            strokeDasharray={"10, 5"}
            strokeWidth={2}
          />
        )}

        {/* Robot */}
        {pose === null || !robotVisible ? <></> :
          <RobotView
              x={pose.x}
              y={pose.y}
              angle={pose.angle}
              width={14}
              height={14}
          />
        }
        
        {!pathVisible && path.segments.map((control, idx) => (
          <g 
            key={control.id}
            onPointerDown={(e) => handleControlPointerDown(e, control.id)}
          >
            {control.visible &&
            <>
              {control.pose.x !== null && control.pose.y !== null &&
                <circle
                  className="stroke-[#1560BD]"
                  style={control.locked ? {cursor : "not-allowed"} : {cursor : "grab"}}
                
                  id={control.id}
                  cx={toPX({x: control.pose.x, y: control.pose.y}, FIELD_REAL_DIMENSIONS, img).x}
                  cy={toPX({x: control.pose.x, y: control.pose.y}, FIELD_REAL_DIMENSIONS, img).y}
                  r={radius}

                  fill={
                    control.selected
                      ? "rgba(180, 50, 11, .75)"
                      : "rgba(160, 32, 7, .5)"
                  }
                  
                  strokeWidth={idx === path.segments.length - 1 ? 2: 0}
                />
              }

              {control.pose.angle !== null && (() => {
                const snapPose = getSnapPose(controls, idx);
                if (snapPose === null || snapPose.y === null || snapPose.x === null) return null;

                const basePx = toPX(
                  { x: snapPose.x, y: snapPose.y },
                  FIELD_REAL_DIMENSIONS,
                  img
                );

                const headingInFieldUnits = {
                  x:
                    snapPose.x +
                    (radius * FIELD_REAL_DIMENSIONS.w / img.w) *
                      Math.sin(toRad(control.pose.angle)),
                  y:
                    snapPose.y +
                    (radius * FIELD_REAL_DIMENSIONS.h / img.h) *
                      Math.cos(toRad(control.pose.angle)),
                };

                const tipPx = toPX(
                  headingInFieldUnits,
                  FIELD_REAL_DIMENSIONS,
                  img
                );

                return (
                  <line
                    pointerEvents="none"
                    x1={basePx.x}
                    y1={basePx.y}
                    x2={tipPx.x}
                    y2={tipPx.y}
                    stroke={control.pose.x !== null && control.pose.y !== null ? "#1560BDB8" : "Black"}
                    strokeWidth={2}
                  />
                );
              })()}
            </>
            }
        </g>
        

        ))}


      </svg>
    </div>
  );
}