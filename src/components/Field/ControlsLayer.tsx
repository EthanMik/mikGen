import React from "react";
import { hoveredSegmentStore } from "../../core/HoverStore";
import type { Path } from "../../core/Types/Path";
import { getBackwardsSnapIdx, getBackwardsSnapPose } from "../../core/Types/Path";
import { calculateHeading, toPX, toRad, FIELD_REAL_DIMENSIONS, type Rectangle, FIELD_IMG_DIMENSIONS, findPointToFace, toRGBA } from "../../core/Util";
import { useSettings } from "../../hooks/useSettings";
import type { Format } from "../../simulation/FormatDefinition";
import type { LemConstants } from "../../simulation/LemLibSim/LemConstants";
import type { mikConstants } from "../../simulation/mikLibSim/MikConstants";
import type { FieldColors } from "./FieldUtils";
import type { JarConstants } from "../../simulation/JarSim/JarConstants";

const VISUAL = {
	node: {
		hoverRadiusMultiplier: 1.4,
		snapStrokeWidth: 1.4,
	},
	turnIndicator: {
		poseDriveStartReducedFactor: 0.8,
		activeHoveredRadiusMultiplier: 1.8,
		activeRadiusMultiplier: 1.4,
		hoverRadiusMultiplier: 1.2,
		activeThickness: 5,
		hoverThickness: 4,
		defaultThickness: 2,
		pointTurnFallbackOffset: 5,
	},
	swingIndicator: {
		activeHoveredRadiusMultiplier: 1.5,
		activeRadiusMultiplier: 1.3,
		hoverRadiusMultiplier: 1.2,
		innerRadiusOffsetFactor: 0.6,
		activeCurveAmount: 0.45,
		hoverCurveAmount: 0.35,
		defaultCurveAmount: 0.25,
		activeThickness: 5,
		hoverThickness: 4,
		defaultThickness: 2,
	},
	waitIndicator: {
		scale: 0.3,
		activeHoveredRadiusMultiplier: 1.8,
		activeRadiusMultiplier: 1.4,
		hoverRadiusMultiplier: 1.2,
		activeThickness: 5,
		hoverThickness: 4,
		defaultThickness: 2,
	},
	numberLabel: {
		fontSizeMultiplier: 0.9,
	},
} as const;

type ControlsLayerProps = {
	path: Path;
	img: Rectangle;
	radius: number;
	format: Format;
	colors: FieldColors;
	onPointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
};

export default function ControlsLayer({ path, img, radius, format, colors, onPointerDown }: ControlsLayerProps) {
	const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2;
	const imgRealSize = (img.w + img.h) / 2
	const scale = imgRealSize / imgDefaultSize;
	const [settings] = useSettings();
	const hoveredId = hoveredSegmentStore.useStore();
	radius = radius * scale;

	const snap = getBackwardsSnapIdx(path, path.segments.length - 1);

	const segmentNumbers = new Map<number, number>();
	let displayNum = 1;
	for (let i = 0; i < path.segments.length; i++) {
		const seg = path.segments[i];
		if (seg.pose.x !== null && seg.pose.y !== null) {
			segmentNumbers.set(i, displayNum++);
		}
	}

	return (
		<>
			{path.segments.map((control, idx) => (
				<g key={control.id} onPointerDown={(e) => onPointerDown(e, control.id)}>
					{control.visible && (
						<>
							{/* Drive Segment (Circle) */}
							{control.pose.x !== null && control.pose.y !== null && (() => {
								const nodePx = toPX({ x: control.pose.x, y: control.pose.y }, FIELD_REAL_DIMENSIONS, img);
								return (
									<>
										<circle
											style={{ stroke: colors.control.stroke, ...(control.locked ? { cursor: "not-allowed" } : { cursor: "grab" }) }}
											id={control.id}
											cx={nodePx.x}
											cy={nodePx.y}
											r={hoveredId === control.id ? radius * VISUAL.node.hoverRadiusMultiplier : radius}
											fill={control.selected ? colors.control.selected : colors.control.fill}
											strokeWidth={idx === snap ? VISUAL.node.snapStrokeWidth * scale : 0}
										/>
									</>
								);
							})()}

							{/* Turn Indicator (Line) */}
							{["angleTurn", "pointTurn", "poseDrive", "start"].includes(control.kind) && (() => {
								const snapPose = getBackwardsSnapPose(path, idx);
								if (snapPose?.x === null || snapPose?.y === null || snapPose === null) return null;

								const active = control.selected;
								const hovered = hoveredId === control.id;
								const reduced = control.kind === "poseDrive" || control.kind === "start" ? VISUAL.turnIndicator.poseDriveStartReducedFactor : 1;
								const r = (active && hovered) ? radius * (VISUAL.turnIndicator.activeHoveredRadiusMultiplier * reduced) : active ? radius * (VISUAL.turnIndicator.activeRadiusMultiplier * reduced) : hovered ? radius * VISUAL.turnIndicator.hoverRadiusMultiplier : radius;

								const thickness = active ? VISUAL.turnIndicator.activeThickness : hovered ? VISUAL.turnIndicator.hoverThickness : VISUAL.turnIndicator.defaultThickness;
								const baseStroke = control.pose.x !== null ? colors.turn.strokePos : active ? colors.turn.selected : colors.turn.stroke;

								const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);
								let angle = control.pose.angle ?? 0;

								if (control.kind === "pointTurn") {
									const pos = findPointToFace(path, idx);
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
								if (snapPose === null || snapPose.x === null || snapPose.y === null) return null;

								const active = control.selected;
								const hovered = hoveredId === control.id;
								const r = (active && hovered) ? radius * VISUAL.swingIndicator.activeHoveredRadiusMultiplier : active ? radius * VISUAL.swingIndicator.activeRadiusMultiplier : hovered ? radius * VISUAL.swingIndicator.hoverRadiusMultiplier : radius;
								const thickness = active ? VISUAL.swingIndicator.activeThickness : hovered ? VISUAL.swingIndicator.hoverThickness : VISUAL.swingIndicator.defaultThickness;
								const baseStroke = active ? colors.turn.selected : colors.turn.stroke;

								let angle = control.pose.angle ?? 0;
								if (control.kind === "pointSwing") {
									const pos = findPointToFace(path, idx);
									angle = calculateHeading({ x: snapPose.x, y: snapPose.y }, { x: pos.x, y: pos.y }) + (angle);
								}

								const curveLeft = (format === "mikLib" && (control.constants[0] as mikConstants).swing_direction == "left") ||
									(format === "LemLib" && (control.constants[0] as LemConstants).lockedSide === "DriveSide::RIGHT") ||
									(format === "JAR-Template" && (control.constants[0] as JarConstants).swing_direction === "left")
								const rInner = Math.max(0, r - (thickness * VISUAL.swingIndicator.innerRadiusOffsetFactor));
								const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);

								const tipPx = toPX({
									x: snapPose.x + ((rInner) * FIELD_REAL_DIMENSIONS.w / img.w) * Math.sin(toRad(angle)),
									y: snapPose.y + ((rInner) * FIELD_REAL_DIMENSIONS.h / img.h) * Math.cos(toRad(angle)),
								}, FIELD_REAL_DIMENSIONS, img);

								const dx = tipPx.x - basePx.x;
								const dy = tipPx.y - basePx.y;
								const len = Math.hypot(dx, dy) || 1;
								const nx = -dy / len;
								const ny = dx / len;
								const curveAmount = (active ? VISUAL.swingIndicator.activeCurveAmount : hovered ? VISUAL.swingIndicator.hoverCurveAmount : VISUAL.swingIndicator.defaultCurveAmount) * len;
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

			{path.segments.map((control, idx) => {
				if (control.kind !== "wait" || !control.visible) return null;
				const snapPose = getBackwardsSnapPose(path, idx);
				if (!snapPose || snapPose.x === null || snapPose.y === null) return null;

				const active = control.selected;
				const hovered = hoveredId === control.id;
				const r = (active && hovered) ? radius * VISUAL.waitIndicator.activeHoveredRadiusMultiplier : active ? radius * VISUAL.waitIndicator.activeRadiusMultiplier : hovered ? radius * VISUAL.waitIndicator.hoverRadiusMultiplier : radius;
				const fill = active ? toRGBA(colors.secondary, 0.6) : toRGBA(colors.secondary, 0.3);
				const px = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);

				return (
					<circle
						key={`wait-${control.id}`}
						pointerEvents="none"
						cx={px.x}
						cy={px.y}
						r={r * VISUAL.waitIndicator.scale}
						fill={fill}
					/>
				);
			})}

			{settings.numberedPath && path.segments.map((control, idx) => {
				if (!control.visible || control.pose.x === null || control.pose.y === null) return null;
				const pos = toPX({ x: control.pose.x, y: control.pose.y }, FIELD_REAL_DIMENSIONS, img);
				const num = segmentNumbers.get(idx);
				return (
					<text
						key={`num-${control.id}`}
						pointerEvents="none"
						x={pos.x}
						y={pos.y}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={radius * VISUAL.numberLabel.fontSizeMultiplier}
						fill={"#FFFFFF"}
					>
						{num}
					</text>
				);
			})}
		</>
	);
}
