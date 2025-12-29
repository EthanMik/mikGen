import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { robotConstantsStore } from "../core/Robot";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";
import { isDriveConstants, segmentsEqual } from "../core/Types/Segment";
import { calculateHeading, FIELD_REAL_DIMENSIONS, interpolatePoses, toInch, toPX, toRad, vector2Add, vector2Subtract, type Rectangle } from "../core/Util";
import { usePath } from "../hooks/usePath";
import { usePathVisibility } from "../hooks/usePathVisibility";
import { usePose } from "../hooks/usePose";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import RobotView from "./Util/RobotView";
import type { Pose } from "../core/Types/Pose";
import { PathSimMacros } from "../macros/PathSimMacros";
import FieldMacros from "../macros/FieldMacros";

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

  const svgRef = useRef<SVGSVGElement | null>(null); 

  const [ path, setPath ] = usePath();

  const pathStorageRef = useRef<Path[]>([]);
  const pathStoragePtr = useRef<number>(0);
  const undo = useRef(false);

  const prevPathStorageLen = useRef<number>(0);
  const prevPath = useRef<Path>(path);

  const [ pose, setPose] = usePose();
  const robot = useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.get);
  const [ robotVisible, setRobotVisibility ] = useRobotVisibility();
  const [ pathVisible, setPathVisibility] = usePathVisibility();

  type dragProps = { dragging: boolean, lastPos: Coordinate }
  const [drag, setDrag] = useState<dragProps>({dragging: false, lastPos: {x: 0, y: 0}});
  const startDrag = useRef(false);
  
  // Detect for a redo event
  const pathChanged = (): boolean => {    
    if (prevPath.current.segments.length !== path.segments.length) return true;

    for (let i = 0; i < path.segments.length; i++) {
      const seg1 = path.segments[i];
      const seg2 = prevPath.current.segments[i];
      
      if (!segmentsEqual(seg1, seg2)) {
        return true;
      }
      
    }
    return false
  }
  
  // Execute undo/redo events
  useEffect(() => {
    const changed = pathChanged();

    if (undo.current) {
      undo.current = false;
      prevPath.current = path;
      return;
    }

    if (changed && pathStoragePtr.current < pathStorageRef.current.length - 1) {
      pathStorageRef.current = pathStorageRef.current.slice(0, pathStoragePtr.current + 1);
    }
    
    if (changed && (!drag.dragging || startDrag.current)) {
      startDrag.current = false;

      pathStorageRef.current = [...pathStorageRef.current.slice(0, pathStorageRef.current.length - 1), 
        prevPath.current, path];

      pathStoragePtr.current = pathStorageRef.current.length - 1;
    }

    prevPath.current = path;
    prevPathStorageLen.current = pathStorageRef.current.length;

  }, [path, drag.dragging]);

  const { moveControl, 
          moveHeading,
          deleteControl,
          unselectPath,
          selectPath,
          selectInversePath,
          undoPath,
          redoPath,
          addPointDriveSegment,
          addPointTurnSegment,
          addPoseDriveSegment,
          addAngleTurnSegment
  } = FieldMacros();

  const { 
    toggleRobotVisibility
  } = PathSimMacros();

  useEffect(() => {
      const handleKeyDown = (evt: KeyboardEvent) => {
          const target = evt.target as HTMLElement | null;
          if (target?.isContentEditable || target?.tagName === "INPUT") return;
          unselectPath(evt, setPath);
          moveControl(evt, setPath);
          moveHeading(evt, setPath);
          deleteControl(evt, setPath);
          selectPath(evt, setPath);
          selectInversePath(evt, setPath);
          undoPath(evt, undo, pathStorageRef, pathStoragePtr, setPath);
          redoPath(evt, undo, pathStorageRef, pathStoragePtr, setPath);
          toggleRobotVisibility(evt, setRobotVisibility);
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
          document.removeEventListener('keydown', handleKeyDown)
      }
  }, []);
  
  const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (!drag?.dragging) return

    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }
    const deltaPosition = vector2Subtract(posPx, drag.lastPos);

    const next: Path = {
      segments: path.segments.map((c) => {
        if (!c.selected || c.locked) return c;

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
    setPath((prevSegment) => ({
      ...prevSegment,
      segments: prevSegment.segments.map((c) => ({
        ...c,
        selected: false,
      })),
    }));  
  }

  const selectSegment = (controlId: string, shifting: boolean) => {
    setPath((prevSegment) => {
      const prevSelectedIds = prevSegment.segments
        .filter((c) => c.selected)
        .map((c) => c.id);

      let nextSelectedIds: string[];

      if (!shifting && prevSelectedIds.length <= 1) {
        nextSelectedIds = [controlId];
      } else if (shifting && prevSegment.segments.find((c) => c.id === controlId && c.selected)) {
        nextSelectedIds = prevSelectedIds.filter((c) => c !== controlId);
      } else {
        nextSelectedIds = [...prevSelectedIds, controlId];
      }

      return {
        ...prevSegment,
        segments: prevSegment.segments.map((c) => ({
          ...c,
          selected: !c.locked && nextSelectedIds.includes(c.id),
        })),
      };
    });
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

    startDrag.current = true;
    setDrag({ dragging: true, lastPos: posPx });  
  }

  const getPressedPositionInch = (evt: React.PointerEvent<SVGSVGElement>): Coordinate => {
    const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
    const posPx: Coordinate = { x: evt.clientX - rect.left, y: (evt.clientY - rect.top) }

    return toInch(posPx, FIELD_REAL_DIMENSIONS, img);
  }

  const handleBackgroundPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (evt.button !== 0 && evt.button !== 2 ||  pathVisible) return;
    
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount > 1) {
      endSelecton();
      return
    }

    if (path.segments.length <= 0) {
      const pos = getPressedPositionInch(evt);
      addPoseDriveSegment({ x: pos.x, y: pos.y, angle: 0 }, setPath);      
      return;
    }

    if (!evt.ctrlKey && evt.button === 0) {
      const pos = getPressedPositionInch(evt);
      addPointDriveSegment(pos, setPath);
    }
    
    if (!evt.ctrlKey && evt.button === 2) {
      addPointTurnSegment(setPath);
    }
    
    if (evt.ctrlKey && evt.button == 2) {
      addAngleTurnSegment(setPath);
    }
    
    if (evt.ctrlKey && evt.button === 0) {
      const pos = getPressedPositionInch(evt);
      addPoseDriveSegment({ x: pos.x, y: pos.y, angle: 0 }, setPath)
    }

  };

  const controls = path.segments;

  const getSegmentLines = (idx: number): string | null => {
    if (idx <= 0) return null;

    const m = controls[idx];
    if (m.pose.x === null || m.pose.y === null) return null;

    const startPose = getBackwardsSnapPose(path, idx - 1);
    if (startPose === null || startPose.x === null || startPose.y === null) return null;

    const pStart = toPX({ x: startPose.x, y: startPose.y }, FIELD_REAL_DIMENSIONS, img);
    const pEnd = toPX({ x: m.pose.x, y: m.pose.y }, FIELD_REAL_DIMENSIONS, img);

    if (m.kind === "pointDrive") {
      return `${pStart.x},${pStart.y} ${pEnd.x},${pEnd.y}`;
    }

    const lead = isDriveConstants(m.constants) && m.constants.drive.lead !== null ? m.constants.drive.lead : 0;
    const ΘEnd = m.pose.angle;

    const h = Math.sqrt(
      (pStart.x - pEnd.x) * (pStart.x - pEnd.x) + (pStart.y - pEnd.y) * (pStart.y - pEnd.y)
    );

    const x1 = pEnd.x - h * Math.sin(toRad(ΘEnd)) * lead;
    const y1 = pEnd.y + h * Math.cos(toRad(ΘEnd)) * lead;

    const boomerangPts: string[] = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      const x = (1 - t) * ((1 - t) * pStart.x + t * x1) + t * ((1 - t) * x1 + t * pEnd.x);
      const y = (1 - t) * ((1 - t) * pStart.y + t * y1) + t * ((1 - t) * y1 + t * pEnd.y);

      boomerangPts.push(`${x},${y}`);
    }

    return boomerangPts.join(" ");
  };
  
  return (
    <div
      tabIndex={0}
      onMouseLeave={endDrag}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${img.w} ${img.h}`}
        width={img.w}
        height={img.h}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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

        {/* Path (base) */}
        {!pathVisible && path.segments.length >= 2 && (
          <>
            {controls.map((control, idx) => {
              const hovered = control.hovered;
              const segPts = getSegmentLines(idx);
              if (!segPts) return null;

              return (
                <polyline
                  key={`hover-seg-${control.id}`}
                  points={segPts}
                  fill="none"
                  stroke={hovered ? "rgba(180, 50, 11, 1)" : "rgba(21, 96, 189, 1)"}
                  strokeDasharray={"10, 5"}
                  strokeWidth={hovered ? 3 : 2}
                />
              );
            })}
          </>
        )}
        
        {/* Robot */}
        {pose === null || !robotVisible ? <></> :
          <RobotView
              x={pose.x ?? 0}
              y={pose.y ?? 0}
              angle={pose.angle ?? 0}
              width={robot.width}
              height={robot.height}
          />
        }
        
        {/* Command Points */}
        <g>
          {!pathVisible && path.segments.map((control, idx) => (
            <g
              key={control.id}
            >
              {control.visible && control.pose.x !== null && control.pose.y !== null && control.command.name !== "" && (() => {
                const snapPose = getBackwardsSnapPose(path, idx - 1);
                if (snapPose === null || snapPose.y === null || snapPose.x === null) return null;

                const posIn = interpolatePoses(control.pose, snapPose, control.command.percent / 100);
                if (posIn === null || posIn.y === null || posIn.x === null) return null;
                let posPx = toPX({x: posIn.x, y: posIn.y}, FIELD_REAL_DIMENSIONS, img);

                const pts = getSegmentLines(idx)?.split(" ");
                if (control.kind === "poseDrive" && pts !== undefined) {
                  const ptsIdx = Math.floor((control.command.percent / 100) * (pts?.length - 1));
                  const coord = pts[ptsIdx].split(","); 
                  posPx = { x: Number(coord[0]), y: Number(coord[1]) };
                }
  
                return (
                  <circle
                    fill="rgba(21, 102, 189, .75)"
                    r={8}
                    cx={posPx.x}
                    cy={posPx.y}
                  />
                )
  
              })()
              }
            </g>
          ))}
        </g>


        {!pathVisible && path.segments.map((control, idx) => (
          <g 
            key={control.id}
            onPointerDown={(e) => handleControlPointerDown(e, control.id)}
          >

            {control.visible &&
            <>
              {/* Render Drive Segments */}
              {control.pose.x !== null && control.pose.y !== null &&
                <circle
                  className="stroke-[#1560BD]"
                  style={control.locked ? {cursor : "not-allowed"} : {cursor : "grab"}}
                
                  id={control.id}
                  cx={toPX({x: control.pose.x, y: control.pose.y}, FIELD_REAL_DIMENSIONS, img).x}
                  cy={toPX({x: control.pose.x, y: control.pose.y}, FIELD_REAL_DIMENSIONS, img).y}
                  r={control.hovered ? radius * 1.2 : radius}

                  fill={
                    control.selected
                      ? "rgba(180, 50, 11, .75)"
                      : "rgba(160, 32, 7, .5)"
                  }
                  
                  strokeWidth={idx === path.segments.length - 1 ? 2: 0}
                />
              }

              {/* Render Turn Segments */}
              {(control.kind === "angleTurn" || control.kind === "pointTurn" || control.kind === "poseDrive") && (() => {
                const snapPose = getBackwardsSnapPose(path, idx);
                if (snapPose === null || snapPose.y === null || snapPose.x === null) return null;
                const active = control.selected; 
                const hovered = control.hovered;
                const r = active || hovered ? radius * 1.15 : radius;
                const thickness = active || hovered ? 3 : 1.5;
                const baseStroke = control.pose.x !== null && control.pose.y !== null ? "#1560BDB8" : 
                active ? (hovered ? "#451717CC" : "#451717")  : "#451717";

                const glowWidth = active || hovered ? thickness * 1 : 0;
                const glowOpacity = active || hovered ? 0.35 : 0;

                const basePx = toPX(
                  { x: snapPose.x, y: snapPose.y },
                  FIELD_REAL_DIMENSIONS,
                  img
                );

                let angle = control.pose.angle ?? 0;

                if (control.kind === "pointTurn") {
                  const desiredPos = getForwardSnapPose(path, idx);
                  
                  angle = desiredPos !== null ?  
                    calculateHeading(snapPose, {x: desiredPos.x ?? 0, y: desiredPos.y ?? 0}) + (control.pose.angle ?? 0) :
                    angle;
                }

                const headingInFieldUnits = {
                  x:
                    snapPose.x +
                    ((r) * FIELD_REAL_DIMENSIONS.w / img.w) *
                      Math.sin(toRad(angle)),
                  y:
                    snapPose.y +
                    ((r) * FIELD_REAL_DIMENSIONS.h / img.h) *
                      Math.cos(toRad(angle)),
                };

                const tipPx = toPX(
                  headingInFieldUnits,
                  FIELD_REAL_DIMENSIONS,
                  img
                );

                return (
                  <>
                    <line
                      pointerEvents="none"
                      x1={basePx.x} y1={basePx.y} x2={tipPx.x} y2={tipPx.y}
                      stroke={baseStroke}
                      strokeWidth={glowWidth}
                      strokeLinecap="round"
                      style={{
                        opacity: glowOpacity,
                        filter: active ? "blur(2px)" : "none",
                        transition: "stroke-width 90ms ease-out, opacity 90ms ease-out, filter 90ms ease-out"
                      }}
                    />

                    <line
                      pointerEvents="none"
                      x1={basePx.x} y1={basePx.y} x2={tipPx.x} y2={tipPx.y}
                      stroke={baseStroke}
                      strokeWidth={thickness}
                      strokeLinecap="round"
                      style={{
                        transition: "stroke 90ms ease-out, stroke-width 90ms ease-out"
                      }}
                    />
                  </>
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