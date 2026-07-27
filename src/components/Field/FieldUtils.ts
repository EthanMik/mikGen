import { computedPathStore, SIM_CONSTANTS } from "../../core/ComputePathSim";
import type { Coordinate } from "../../core/Types/Coordinate";
import { getBackwardsSnapPose, type Path } from "../../core/Types/Path";
import type { Segment } from "../../core/Types/Segment";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, toRad, type Rectangle } from "../../core/Util";
import { fileFormatStore } from "../../hooks/useFileFormat";
import { resolveBezier, sampleBezier, segmentControls } from "../../core/Types/Bezier";

export const BEZIER_RENDER_STEPS = 30;

export function pointerToSvg(evt: React.PointerEvent | React.MouseEvent<SVGSVGElement> | WheelEvent, svg: SVGSVGElement): Coordinate {
    const ctm = svg.getScreenCTM();
    if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const p = pt.matrixTransform(ctm.inverse());
        return { x: p.x, y: p.y };
    }

    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return {
        x: vb.x + (evt.clientX - rect.left) * (vb.width / rect.width),
        y: vb.y + (evt.clientY - rect.top) * (vb.height / rect.height),
    };
}

export function getPressedPositionInch(evt: React.PointerEvent<SVGSVGElement>, svg: SVGSVGElement | null, img: Rectangle): Coordinate {
    if (!svg) return { x: 0, y: 0 };
    const posSvg = pointerToSvg(evt, svg);
    return toInch(posSvg, FIELD_REAL_DIMENSIONS, img);
}

export function insertIndexAfterSelection(segments: readonly { selected: boolean }[]): number {
    for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i].selected) return i + 1;
    }
    return segments.length;
}

export function selectedLastOrder(
    segments: readonly { selected: boolean; controls?: readonly { selected: boolean }[] }[],
): number[] {
    // A selected control lifts its whole segment, so the handle being dragged is never buried
    const isSelected = (i: number) =>
        segments[i].selected || (segments[i].controls ?? []).some(c => c.selected);
    return segments
        .map((_, i) => i)
        .sort((a, b) => Number(isSelected(a)) - Number(isSelected(b)));
}

export function selectSegmentsInBox(
    path: Path,
    startSvg: Coordinate,
    endSvg: Coordinate,
    img: Rectangle,
): Path {
    const a = toInch(startSvg, FIELD_REAL_DIMENSIONS, img);
    const b = toInch(endSvg, FIELD_REAL_DIMENSIONS, img);
    const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y);

    const snapWithinBox = (seg: Segment): boolean => {
        const idx = path.segments.indexOf(seg);
        if (idx <= 0) return false;
        const snap = getBackwardsSnapPose(path, idx);
        return snap !== null && snap.x !== null && snap.y !== null &&
            snap.x >= minX && snap.x <= maxX &&
            snap.y >= minY && snap.y <= maxY;
    }

    const withinBox = (x: number | null, y: number | null): boolean =>
        x !== null && y !== null && x >= minX && x <= maxX && y >= minY && y <= maxY;

    return {
        ...path,
        segments: path.segments.map(s => ({
            ...s,
            selected: !s.locked && s.visible &&
                (withinBox(s.pose.x, s.pose.y) || snapWithinBox(s)),
            controls: segmentControls(s).map(c => ({
                ...c,
                selected: !s.locked && s.visible && c.visible && withinBox(c.x, c.y),
            })),
        }))
    };
}

export type ControlSelectMode = "exclusive" | "toggle" | "range";

/** Every bezier control in path order, so a range select can span segments. */
function flatControlRefs(segments: readonly Segment[]): { segId: string; idx: number }[] {
    const refs: { segId: string; idx: number }[] = [];
    for (const s of segments) segmentControls(s).forEach((_, i) => refs.push({ segId: s.id, idx: i }));
    return refs;
}

/**
 * Applies a control selection using the same rules segments follow: an exclusive click
 * clears everything else (segments included), ctrl toggles just this one, shift ranges
 * over the flat control list. Shared by the field handles and the controls list.
 */
export function selectControlInPath(path: Path, segmentId: string, controlIdx: number, mode: ControlSelectMode): Path {
    const refs = flatControlRefs(path.segments);
    const clicked = refs.findIndex(r => r.segId === segmentId && r.idx === controlIdx);
    if (clicked === -1) return path;

    const wasSelected = (flatIdx: number): boolean => {
        const ref = refs[flatIdx];
        const seg = path.segments.find(s => s.id === ref.segId);
        return seg ? (segmentControls(seg)[ref.idx]?.selected ?? false) : false;
    };

    let isNextSelected: (flatIdx: number) => boolean;
    if (mode === "toggle") {
        const willSelect = !wasSelected(clicked);
        isNextSelected = (i) => i === clicked ? willSelect : wasSelected(i);
    } else if (mode === "range") {
        let anchor = -1;
        for (let i = refs.length - 1; i >= 0; i--) if (wasSelected(i)) { anchor = i; break; }
        if (anchor === -1) anchor = clicked;
        const lo = Math.min(anchor, clicked);
        const hi = Math.max(anchor, clicked);
        isNextSelected = (i) => i >= lo && i <= hi;
    } else {
        isNextSelected = (i) => i === clicked;
    }

    let flatIdx = 0;
    return {
        ...path,
        segments: path.segments.map(s => ({
            ...s,
            // Only an exclusive click takes selection away from the segments
            selected: mode === "exclusive" ? false : s.selected,
            controls: segmentControls(s).map(c => ({
                ...c,
                selected: !s.locked && isNextSelected(flatIdx++),
            })),
        })),
    };
}

/** Selects or clears every segment and every control at once (Escape, Ctrl+A). */
export function setAllSelection(path: Path, selected: boolean): Path {
    return {
        ...path,
        segments: path.segments.map(s => ({
            ...s,
            selected,
            controls: segmentControls(s).map(c => ({ ...c, selected })),
        })),
    };
}

/** Flips the selection of every segment and every control (Ctrl+Shift+A). */
export function invertAllSelection(path: Path): Path {
    return {
        ...path,
        segments: path.segments.map(s => ({
            ...s,
            selected: !s.selected,
            controls: segmentControls(s).map(c => ({ ...c, selected: !c.selected })),
        })),
    };
}

/** Clears selection on every control, used whenever a segment is selected exclusively. */
export function deselectControls(segments: readonly Segment[]): Segment[] {
    return segments.map(s => {
        const controls = segmentControls(s);
        if (!controls.some(c => c.selected)) return s;
        return { ...s, controls: controls.map(c => ({ ...c, selected: false })) };
    });
}

export function hasSelectedControl(segments: readonly Segment[]): boolean {
    return segments.some(s => segmentControls(s).some(c => c.selected));
}

/** Total selected items across both segments and controls. */
export function selectionCount(segments: readonly Segment[]): number {
    return segments.reduce(
        (n, s) => n + (s.selected ? 1 : 0) + segmentControls(s).filter(c => c.selected).length,
        0,
    );
}

export const getPreciseSegmentLines = (idx: number, img: Rectangle): string | null => {
    const points: string[] = [];
    const segPts = computedPathStore.getState().segmentTrajectorys[idx];
    if (segPts === undefined) return null;
    for (const rawPt of segPts) {
        const point = toPX({ x: rawPt.x, y: rawPt.y }, FIELD_REAL_DIMENSIONS, img);
        points.push(`${point.x},${point.y}`);
    }
    return points.join(" ");
}

export const getPreciseSegmentDots = (idx: number, spacing: number): { x: number, y: number, t: number }[] | null => {
    const segPts = computedPathStore.getState().segmentTrajectorys[idx];
    if (segPts === undefined || segPts.length === 0) return null;

    const maxSpeedIn = fileFormatStore.getState().robot.speed * 12;
    const dots: { x: number, y: number, t: number }[] = [];
    let distSinceLast = 0;

    for (let i = 1; i < segPts.length; i++) {
        const dx = segPts[i].x - segPts[i - 1].x;
        const dy = segPts[i].y - segPts[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        const t = Math.min((segLen / SIM_CONSTANTS.dt) / maxSpeedIn, 1);

        distSinceLast += segLen;
        while (distSinceLast >= spacing) {
            distSinceLast -= spacing;
            const frac = 1 - distSinceLast / segLen;
            dots.push({ x: segPts[i - 1].x + frac * dx, y: segPts[i - 1].y + frac * dy, t });
        }
    }

    return dots;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLead(m: any): number {
    const lead1 = m.constants?.[0].lead;

    if (lead1) return lead1;
    return 0;
}

export const getSegmentLines = (idx: number, path: Path, img: Rectangle, precise = false): string | null => {
    if (idx <= 0) return null;

    if (precise) {
        return getPreciseSegmentLines(idx, img);
    }

    const m = path.segments[idx];
    if (m.pose.x === null || m.pose.y === null) return null;

    const startPose = getBackwardsSnapPose(path, idx - 1);
    if (startPose === null || startPose.x === null || startPose.y === null) return null;

    const pStart = toPX({ x: startPose.x, y: startPose.y }, FIELD_REAL_DIMENSIONS, img);
    const pEnd = toPX({ x: m.pose.x, y: m.pose.y }, FIELD_REAL_DIMENSIONS, img);

    if (m.kind === "bezierCurve") {
        const bezier = resolveBezier(path, idx);
        if (bezier === null) return null;
        return sampleBezier(bezier, BEZIER_RENDER_STEPS)
            .map(pt => {
                const px = toPX(pt, FIELD_REAL_DIMENSIONS, img);
                return `${px.x},${px.y}`;
            })
            .join(" ");
    }

    if ((m.kind === "poseDrive" && m.format === "Holonomic") || m.kind === "pointDrive" || m.kind === "distanceDrive" || m.kind === "strafeDrive") {
        return `${pStart.x},${pStart.y} ${pEnd.x},${pEnd.y}`;
    }

    const lead = getLead(m);
    if (m.kind !== "poseDrive") return "";

    const ΘEnd = m.pose.angle ?? 0;

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