import React, { memo, useMemo } from "react";
import { hoveredSegmentStore } from "../../core/HoverStore";
import type { Path } from "../../core/Types/Path";
import type { Coordinate } from "../../core/Types/Coordinate";
import { getBackwardsSnapIdx, getBackwardsSnapPose, turnHeadingAt } from "../../core/Types/Path";
import type { Segment } from "../../core/Types/Segment";
import { resolveBezier, segmentControls, type Bezier } from "../../core/Types/Bezier";
import { toPX, toRad, FIELD_REAL_DIMENSIONS, type Rectangle, FIELD_IMG_DIMENSIONS, resolveTurnPose } from "../../core/Util";
import { useSettings } from "../../hooks/useSettings";
import { controlAttributes, FIELD_COLORS, type SegmentAttribute } from "./FieldColors";
import { selectedLastOrder } from "./FieldUtils";

type ControlsLayerProps = {
	path: Path;
	img: Rectangle;
	radius: number;
	onPointerDown: (e: React.PointerEvent<SVGGElement>, id: string) => void;
	onControlPointerDown: (e: React.PointerEvent<SVGCircleElement>, id: string, controlIdx: number) => void;
};

/**
 * Everything a segment's shapes need that depends only on the path, not on the zoom/pan
 * rectangle. getBackwardsSnapPose, resolveTurnPose and resolveBezier each walk the path, and
 * the shapes used to call them several times per segment per render, so this is cached once
 * per path and reused across every pan and zoom frame.
 */
type SegGeom = {
	snapPose: { x: number; y: number } | null;
	indicatorAngle: number | null;
	bezier: Bezier | null;
	/** Where a point turn aims, for the target marker. Null on every other kind. */
	turnTarget: Coordinate | null;
};

type ShapeCtx = {
	path: Path;
	idx: number;
	seg: Segment;
	geom: SegGeom;
	img: Rectangle;
	radius: number;
	scale: number;
	hovered: boolean;
	snapIdx: number | null;
	onControlPointerDown: ControlsLayerProps["onControlPointerDown"];
};

/** Null when the kind has an optional heading and none is set, so nothing is drawn. */
function computeIndicatorAngle(path: Path, idx: number, seg: Segment, snapPose: { x: number; y: number }): number | null {
	// A point turn's heading lives entirely on turnPose; its own pose.angle is always null
	if (seg.kind === "pointTurn" || seg.kind === "pointSwing") return turnHeadingAt(path, idx, snapPose);
	return seg.pose.angle;
}

function computeSegGeoms(path: Path): SegGeom[] {
	return path.segments.map((seg, idx) => {
		const raw = getBackwardsSnapPose(path, idx);
		const snapPose = raw !== null && raw.x !== null && raw.y !== null ? { x: raw.x, y: raw.y } : null;
		const isPointTurn = seg.kind === "pointTurn" || seg.kind === "pointSwing";
		return {
			snapPose,
			indicatorAngle: snapPose === null ? null : computeIndicatorAngle(path, idx, seg, snapPose),
			bezier: seg.kind === "bezierCurve" ? resolveBezier(path, idx) : null,
			turnTarget: isPointTurn ? resolveTurnPose(path, idx) : null,
		};
	});
}

function shapeColor(attr: SegmentAttribute, selected: boolean): string {
	return selected ? attr.selectedColor : attr.baseColor;
}

function shapeScale(attr: SegmentAttribute, selected: boolean, hovered: boolean): number {
	return (selected ? attr.selectedScale : 1) * (hovered ? attr.hoverScale : 1);
}

function indicatorThickness(selected: boolean, hovered: boolean): number {
	return selected ? 5 : hovered ? 4 : 2;
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
			style={{ stroke: FIELD_COLORS.endBorderColor, cursor: "grab" }}
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
	const snapPose = ctx.geom.snapPose;
	if (snapPose === null) return null;

	const { seg } = ctx;
	const r = ctx.radius * shapeScale(attr, seg.selected, ctx.hovered);
	const angle = ctx.geom.indicatorAngle;
	if (angle === null) return null;

	const basePx = toPX(snapPose, FIELD_REAL_DIMENSIONS, ctx.img);
	const tipPx = indicatorTipPx(ctx, snapPose, angle, r);

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
	const snapPose = ctx.geom.snapPose;
	if (snapPose === null) return null;

	const { seg } = ctx;
	const r = ctx.radius * shapeScale(attr, seg.selected, ctx.hovered);
	const thickness = indicatorThickness(seg.selected, ctx.hovered);
	const angle = ctx.geom.indicatorAngle;
	if (angle === null) return null;

	const rInner = Math.max(0, r - (thickness * 0.6));
	const basePx = toPX(snapPose, FIELD_REAL_DIMENSIONS, ctx.img);
	const tipPx = indicatorTipPx(ctx, snapPose, angle, rInner);

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
	const snapPose = ctx.geom.snapPose;
	if (snapPose === null) return null;

	const { seg } = ctx;
	const px = toPX(snapPose, FIELD_REAL_DIMENSIONS, ctx.img);
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

/** The coordinate a point turn aims at, shown only while the row owns the selection. */
function renderTurnTarget(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	const { seg, geom } = ctx;
	if (!seg.selected || geom.turnTarget === null) return null;

	const px = toPX(geom.turnTarget, FIELD_REAL_DIMENSIONS, ctx.img);
	return (
		<circle
			pointerEvents="none"
			cx={px.x}
			cy={px.y}
			r={ctx.radius * 0.35}
			fill={attr.selectedColor}
		/>
	);
}

function renderControls(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	const { seg } = ctx;

	const i = controlAttributes().indexOf(attr);
	const control = segmentControls(seg)[i];
	if (!control || !control.visible || control.x === null || control.y === null) return null;

	const bezier = ctx.geom.bezier;
	if (bezier === null) return null;

	const anchor = i === 0 ? bezier.p0 : bezier.p1;
	const anchorPx = toPX(anchor, FIELD_REAL_DIMENSIONS, ctx.img);
	const controlPx = toPX({ x: control.x, y: control.y }, FIELD_REAL_DIMENSIONS, ctx.img);

	return (
		<>
			<line
				pointerEvents="none"
				x1={anchorPx.x} y1={anchorPx.y} x2={controlPx.x} y2={controlPx.y}
				stroke={"#00000035"}
				strokeWidth={1 * ctx.scale}
			/>
			<circle
				style={{ cursor: "grab" }}
				cx={controlPx.x}
				cy={controlPx.y}
				r={ctx.radius * shapeScale(attr, control.selected, ctx.hovered) * 0.5}
				fill={shapeColor(attr, control.selected)}
				onPointerDown={(e) => { e.stopPropagation(); ctx.onControlPointerDown(e, seg.id, i); }}
			/>
		</>
	);
}

/**
 * Draw order within one segment. A shape is hit-tested by what is painted last, so whichever
 * of the node or the controls is selected has to come last or you cannot grab it when they overlap.
 */
function selectedLastAttrs(seg: Segment): { attr: SegmentAttribute; key: number }[] {
	const attrs = FIELD_COLORS.segmentColors[seg.kind];
	const controlAttrs = controlAttributes();
	const controls = segmentControls(seg);

	const isSelected = (attr: SegmentAttribute): boolean => {
		if (attr.shape !== "control") return seg.selected;
		return controls[controlAttrs.indexOf(attr)]?.selected ?? false;
	};

	return attrs
		.map((attr, key) => ({ attr, key }))
		.sort((a, b) => Number(isSelected(a.attr)) - Number(isSelected(b.attr)) || a.key - b.key);
}

function renderAttr(ctx: ShapeCtx, attr: SegmentAttribute): React.ReactNode {
	switch (attr.shape) {
		case "node": return renderNode(ctx, attr);
		case "line": return renderLine(ctx, attr);
		case "curve": return renderCurve(ctx, attr);
		case "circle": return renderCircle(ctx, attr);
		case "control": return renderControls(ctx, attr);
		case "turnTarget": return renderTurnTarget(ctx, attr);
	}
}

// Memoized (with stable handler props from Field) so Field renders that leave the path and
// viewport untouched, like pose animation frames and box-select updates, skip the full
// per-segment shape render
export default memo(function ControlsLayer({ path, img, radius, onPointerDown, onControlPointerDown }: ControlsLayerProps) {
	const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2;
	const imgRealSize = (img.w + img.h) / 2
	const scale = imgRealSize / imgDefaultSize;
	const [settings] = useSettings();
	const hoveredId = hoveredSegmentStore.useStore();
	radius = radius * scale;

	const snapIdx = getBackwardsSnapIdx(path, path.segments.length - 1);

	const geoms = useMemo(() => computeSegGeoms(path), [path]);

	const renderOrder = selectedLastOrder(path.segments);

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
			{renderOrder.map((idx) => {
				const seg = path.segments[idx];
				const ctx: ShapeCtx = { path, idx, seg, geom: geoms[idx], img, radius, scale, hovered: hoveredId === seg.id, snapIdx, onControlPointerDown };
				return (
					<g key={seg.id} onPointerDown={(e) => onPointerDown(e, seg.id)}>
						{seg.visible && selectedLastAttrs(seg).map(({ attr, key }) => (
							<React.Fragment key={key}>{renderAttr(ctx, attr)}</React.Fragment>
						))}
					</g>
				);
			})}

			{settings.numberedPath && renderOrder.map((idx) => {
				const seg = path.segments[idx];
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
});
