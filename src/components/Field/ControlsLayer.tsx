import React from "react";
import type { Path } from "../../core/Types/Path";
import { getBackwardsSnapIdx, getBackwardsSnapPose, getForwardSnapPose } from "../../core/Types/Path";
import { calculateHeading, toPX, toRad, FIELD_REAL_DIMENSIONS, type Rectangle, FIELD_IMG_DIMENSIONS } from "../../core/Util";
import type { Coordinate } from "../../core/Types/Coordinate";

type ControlsLayerProps = {
  path: Path;
  img: Rectangle;
  radius: number;
  format: string;
  onPointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
};

export default function ControlsLayer({ path, img, radius, format, onPointerDown }: ControlsLayerProps) {
  const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2; 
  const imgRealSize = (img.w + img.h) / 2
  const scale = imgRealSize / imgDefaultSize;
  radius = radius * scale;

  const snap = getBackwardsSnapIdx(path, path.segments.length - 1);

  return (
    <>
      {path.segments.map((control, idx) => (
        <g key={control.id} onPointerDown={(e) => onPointerDown(e, control.id)}>
          {control.visible && (
            <>
              {/* Drive Segment (Circle) */}
              {control.pose.x !== null && control.pose.y !== null && (
                <circle
                  className="stroke-[#1560BD]"
                  style={control.locked ? { cursor: "not-allowed" } : { cursor: "grab" }}
                  id={control.id}
                  cx={toPX({ x: control.pose.x, y: control.pose.y }, FIELD_REAL_DIMENSIONS, img).x}
                  cy={toPX({ x: control.pose.x, y: control.pose.y }, FIELD_REAL_DIMENSIONS, img).y}
                  r={control.hovered ? radius * 1.2 : radius}
                  fill={control.selected ? "rgba(180, 50, 11, .75)" : "rgba(160, 32, 7, .5)"}
                  strokeWidth={idx === snap ? 2 * scale : 0}
                />
              )}

              {/* Turn Indicator (Line) */}
              {["angleTurn", "pointTurn", "poseDrive", "start"].includes(control.kind) && (() => {
                const snapPose = getBackwardsSnapPose(path, idx);
                if (snapPose?.x === null || snapPose?.y === null || snapPose === null) return null;

                const active = control.selected;
                const hovered = control.hovered;
                const r = active ? radius * 1.3 : hovered ? radius * 1.2 : radius;
                const thickness = active ? 5 : hovered ? 4 : 2;
                const baseStroke = control.pose.x !== null ? "#1560BDB8" : active ? "rgba(160, 50, 11, .9)" : "#451717";

                const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);
                let angle = control.pose.angle ?? 0;

                if (control.kind === "pointTurn") {
                  const previousPos = getBackwardsSnapPose(path, idx - 1);
                  const turnToPos = getForwardSnapPose(path, idx);

                  const pos: Coordinate =
                  turnToPos
                      ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                      : previousPos
                      ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                      : { x: 0, y: 5 };
                  
                  angle = calculateHeading({ x: snapPose.x, y: snapPose.y }, { x: pos.x, y: pos.y }) + (angle);
                }

                const tipPx = toPX(
                  {
                    x: snapPose.x + (r * FIELD_REAL_DIMENSIONS.w / img.w) * Math.sin(toRad(angle)),
                    y: snapPose.y + (r * FIELD_REAL_DIMENSIONS.h / img.h) * Math.cos(toRad(angle)),
                  },
                  FIELD_REAL_DIMENSIONS, img
                );

                return (
                  <line
                    pointerEvents="none"
                    x1={basePx.x} y1={basePx.y} x2={tipPx.x} y2={tipPx.y}
                    stroke={baseStroke}
                    strokeWidth={thickness * scale}
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* Swing Indicator (Curve) */}
              {["angleSwing", "pointSwing"].includes(control.kind) && (() => {
                const snapPose = getBackwardsSnapPose(path, idx);
                if (!snapPose?.x || !snapPose?.y) return null;

                const active = control.selected;
                const hovered = control.hovered;
                const r = active ? radius * 1.3 : hovered ? radius * 1.2 : radius;
                const thickness = active ? 5 : hovered ? 4 : 2;
                const baseStroke = active ? "rgba(160, 50, 11, .9)" : "#451717";
                
                let angle = control.pose.angle ?? 0;
                 if (control.kind === "pointSwing") {
                    const desiredPos = getForwardSnapPose(path, idx);
                    angle = desiredPos !== null ?  
                      calculateHeading({ x: snapPose.x, y: snapPose.y }, {x: desiredPos.x ?? 0, y: desiredPos.y ?? 0}) + (control.pose.angle ?? 0) :
                      angle;
                  }

                const curveLeft = (format === "mikLib" && control.constants.swing.swingDirection == "left");  
                const rInner = Math.max(0, r - (thickness * 0.6));
                const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);
                
                const tipPx = toPX({
                  x: snapPose.x + ((rInner) * FIELD_REAL_DIMENSIONS.w / img.w) * Math.sin(toRad(angle)),
                  y: snapPose.y + ((rInner) * FIELD_REAL_DIMENSIONS.h / img.h) * Math.cos(toRad(angle)),
                }, FIELD_REAL_DIMENSIONS, img);

                const dx = tipPx.x - basePx.x;
                const dy = tipPx.y - basePx.y;
                const len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len;
                const ny =  dx / len;
                const curveAmount = (active ? 0.45 : hovered ? 0.35 : 0.25) * len;
                const mx = (basePx.x + tipPx.x) / 2;
                const my = (basePx.y + tipPx.y) / 2;
                const dir = curveLeft ? 1 : -1;
                const cx = mx + nx * curveAmount * dir;
                const cy = my + ny * curveAmount * dir;

                return (
                  <path
                    pointerEvents="none"
                    d={`M ${basePx.x} ${basePx.y} Q ${cx} ${cy} ${tipPx.x} ${tipPx.y}`}
                    fill="none"
                    stroke={baseStroke}
                    strokeWidth={thickness * scale}
                    strokeLinecap="round"
                  />
                );
              })()}
            </>
          )}
        </g>
      ))}
    </>
);
}