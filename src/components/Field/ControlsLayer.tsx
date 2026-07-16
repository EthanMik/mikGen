import React from "react";
import { hoveredSegmentStore } from "../../core/HoverStore";
import type { Path } from "../../core/Types/Path";
import { getBackwardsSnapIdx, getBackwardsSnapPose } from "../../core/Types/Path";
import type { Segment } from "../../core/Types/Segment";
import { calculateHeading, toPX, toRad, FIELD_REAL_DIMENSIONS, type Rectangle, FIELD_IMG_DIMENSIONS, findPointToFace } from "../../core/Util";
import { useSettings } from "../../hooks/useSettings";
import { FIELD_COLORS, type SegmentAttribute } from "./FieldColors";

type ControlsLayerProps = {
	path: Path;
	img: Rectangle;
	radius: number;
	onPointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
};

type ShapeCtx = {
	path: Path;
	idx: number;
	seg: Segment;
	img: Rectangle;
	radius: number;
	scale: number;
	hovered: boolean;
	snapIdx: number | null;
};

function shapeColor(attr: SegmentAttribute, selected: boolean): string {
	return selected ? attr.selectedColor : attr.baseColor;
}

function shapeScale(attr: SegmentAttribute, selected: boolean, hovered: boolean): number {
	return (selected ? attr.selectedScale : 1) * (hovered ? attr.hoverScale : 1);
}

function indicatorThickness(selected: boolean, hovered: boolean): number {
	return selected ? 5 : hovered ? 4 : 2;
}

function indicatorAngle(ctx: ShapeCtx, snapPose: { x: number, y: number }): number {
	const angle = ctx.seg.pose.angle ?? 0;
	if (ctx.seg.kind === "pointTurn" || ctx.seg.kind === "pointSwing") {
		const pos = findPointToFace(ctx.path, ctx.idx);
		return calculateHeading({ x: snapPose.x, y: snapPose.y }, { x: pos.x, y: pos.y }) + angle;
	}
	return angle;
}

function indicatorTipPx(ctx: ShapeCtx, snapPose: { x: number, y: number }, angle: number, r: number) {
	return toPX(
		{
			x: snapPose.x + (r * FIELD_REAL_DIMENSIONS.w / ctx.img.w) * Math.sin(toRad(angle)),
			y: snapPose.y + (r * FIELD_REAL_DIMENSIONS.h / ctx.img.h) * Math.cos(toRad(angle)),
		},
		FIELD_REAL_DIMENSIONS, ctx.img
	);
}

function renderNode(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	const { seg } = ctx;
	if (seg.pose.x === null || seg.pose.y === null) return null;

	const nodePx = toPX({ x: seg.pose.x, y: seg.pose.y }, FIELD_REAL_DIMENSIONS, ctx.img);
	return (
		<circle
			style={{ stroke: FIELD_COLORS.endBorderColor, ...(seg.locked ? { cursor: "not-allowed" } : { cursor: "grab" }) }}
			id={seg.id}
			cx={nodePx.x}
			cy={nodePx.y}
			r={ctx.radius * shapeScale(attr, seg.selected, ctx.hovered)}
			fill={shapeColor(attr, seg.selected)}
			strokeWidth={ctx.idx === ctx.snapIdx ? 1.4 * ctx.scale : 0}
		/>
	);
}

function renderLine(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	const snapPose = getBackwardsSnapPose(ctx.path, ctx.idx);
	if (snapPose === null || snapPose.x === null || snapPose.y === null) return null;

	const { seg } = ctx;
	const r = ctx.radius * shapeScale(attr, seg.selected, ctx.hovered);
	const angle = indicatorAngle(ctx, { x: snapPose.x, y: snapPose.y });
	const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, ctx.img);
	const tipPx = indicatorTipPx(ctx, { x: snapPose.x, y: snapPose.y }, angle, r);

	return (
		<line
			pointerEvents="none"
			x1={basePx.x} y1={basePx.y} x2={tipPx.x} y2={tipPx.y}
			stroke={shapeColor(attr, seg.selected)}
			strokeWidth={indicatorThickness(seg.selected, ctx.hovered) * ctx.scale}
			strokeLinecap="round"
		/>
	);
}

function renderCurve(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	const snapPose = getBackwardsSnapPose(ctx.path, ctx.idx);
	if (snapPose === null || snapPose.x === null || snapPose.y === null) return null;

	const { seg } = ctx;
	const r = ctx.radius * shapeScale(attr, seg.selected, ctx.hovered);
	const thickness = indicatorThickness(seg.selected, ctx.hovered);
	const angle = indicatorAngle(ctx, { x: snapPose.x, y: snapPose.y });

	const rInner = Math.max(0, r - (thickness * 0.6));
	const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, ctx.img);
	const tipPx = indicatorTipPx(ctx, { x: snapPose.x, y: snapPose.y }, angle, rInner);

	const dx = tipPx.x - basePx.x;
	const dy = tipPx.y - basePx.y;
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const curveAmount = (seg.selected ? 0.45 : ctx.hovered ? 0.35 : 0.25) * len;
	const mx = (basePx.x + tipPx.x) / 2;
	const my = (basePx.y + tipPx.y) / 2;
	const cx = mx + nx * curveAmount * -1;
	const cy = my + ny * curveAmount * -1;

	return (
		<path
			pointerEvents="none"
			d={`M ${basePx.x} ${basePx.y} Q ${cx} ${cy} ${tipPx.x} ${tipPx.y}`}
			fill="none"
			stroke={shapeColor(attr, seg.selected)}
			strokeWidth={thickness * ctx.scale}
			strokeLinecap="round"
		/>
	);
}

function renderCircle(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	const snapPose = getBackwardsSnapPose(ctx.path, ctx.idx);
	if (snapPose === null || snapPose.x === null || snapPose.y === null) return null;

	const { seg } = ctx;
	const px = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, ctx.img);
	return (
		<circle
			pointerEvents="none"
			cx={px.x}
			cy={px.y}
			r={ctx.radius * shapeScale(attr, seg.selected, ctx.hovered) * 0.3}
			fill={shapeColor(attr, seg.selected)}
		/>
	);
}

function renderAttr(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	switch (attr.shape) {
		case "node": return renderNode(ctx, attr);
		case "line": return renderLine(ctx, attr);
		case "curve": return renderCurve(ctx, attr);
		case "circle": return renderCircle(ctx, attr);
	}
}

export default function ControlsLayer({ path, img, radius, onPointerDown }: ControlsLayerProps) {
	const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2;
	const imgRealSize = (img.w + img.h) / 2
	const scale = imgRealSize / imgDefaultSize;
	const [settings] = useSettings();
	const hoveredId = hoveredSegmentStore.useStore();
	radius = radius * scale;

	const snapIdx = getBackwardsSnapIdx(path, path.segments.length - 1);

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
			{path.segments.map((seg, idx) => {
				const ctx: ShapeCtx = { path, idx, seg, img, radius, scale, hovered: hoveredId === seg.id, snapIdx };
				return (
					<g key={seg.id} onPointerDown={(e) => onPointerDown(e, seg.id)}>
						{seg.visible && FIELD_COLORS.segmentColors[seg.kind].map((attr, i) => (
							<React.Fragment key={i}>{renderAttr(ctx, attr)}</React.Fragment>
						))}
					</g>
				);
			})}

			{settings.numberedPath && path.segments.map((seg, idx) => {
				if (!seg.visible || seg.pose.x === null || seg.pose.y === null) return null;
				const pos = toPX({ x: seg.pose.x, y: seg.pose.y }, FIELD_REAL_DIMENSIONS, img);
				const num = segmentNumbers.get(idx);
				return (
					<text
						key={`num-${seg.id}`}
						pointerEvents="none"
						x={pos.x}
						y={pos.y}
						textAnchor="middle"
						dominantBaseline="central"
						fontSize={radius * 0.9}
						fill={"#FFFFFF"}
					>
						{num}
					</text>
				);
			})}
		</>
	);
}
