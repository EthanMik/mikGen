import { computedPathStore, SIM_CONSTANTS } from "../../core/ComputePathSim";
import type { Coordinate } from "../../core/Types/Coordinate";
import { getBackwardsSnapPose, type Path } from "../../core/Types/Path";
import type { Segment } from "../../core/Types/Segment";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, toRad, toRGBA, type Rectangle } from "../../core/Util";
import { fileFormatStore } from "../../hooks/useFileFormat";

export type FieldColors = {
    primary: string;
    secondary: string;

    control: {
        fill: string,
        selected: string,
        stroke: string,
    },
    turn: {
        stroke: string,
        strokePos: string,
        selected: string,
    }
    path: {
        strokeLight: string,
        stroke: string,
        strokeDark: string,
        hovered: string,
        textLabel: string,
    }
}

const RED_BLUE_THEME: FieldColors = {
    primary: "#a02007",
    secondary: "#1560BD",

    control: {
        fill: toRGBA("#a02007", 0.5),
        selected: toRGBA("#a0320b", 0.75),
        stroke: toRGBA("#1560BD", 0.75),
    },
    turn: {
        stroke: "#451717",
        selected: toRGBA("#a0320b", 0.9),
        strokePos: toRGBA("#1560BD", 1),
    },
    path: {
        strokeLight: toRGBA("#21b8c3", 1),
        stroke: toRGBA("#1560BD", 0.75),
        strokeDark: toRGBA("#7e1ca1", 1),
        hovered: toRGBA("#a02007", 1),
        textLabel: "#a0a0a06c",
    }
};

const gp_primary = "#7027c9";
const gp_secondary = "#31a504";
const gp_selected = "#8c2eff";

const GREEN_PURPLE_THEME: FieldColors = {
    primary: gp_primary,
    secondary: gp_secondary,

    control: {
        fill: toRGBA(gp_primary, 0.5),
        selected: toRGBA(gp_selected, 0.75),
        stroke: toRGBA(gp_secondary, 0.75),
    },
    turn: {
        stroke: "#021205",
        selected: toRGBA(gp_selected, 0.9),
        strokePos: toRGBA(gp_secondary, 1),
    },
    path: {
        strokeLight: toRGBA("#b3db5d", 1),
        stroke: toRGBA(gp_secondary, 0.75),
        strokeDark: toRGBA("#c80505", 1),
        hovered: toRGBA(gp_primary, 1),
        textLabel: "#a0a0a06c",
    }
};

const ORANGE_CYAN_THEME: FieldColors = {
    primary: "#d45a00",
    secondary: "#0096aa",

    control: {
        fill: toRGBA("#d45a00", 0.5),
        selected: toRGBA("#a03f00", 0.75),
        stroke: toRGBA("#0096aa", 0.75),
    },
    turn: {
        stroke: "#4a2000",
        selected: toRGBA("#a03f00", 0.9),
        strokePos: toRGBA("#0096aa", 1),
    },
    path: {
        strokeLight: toRGBA("#19ca69", 1),
        stroke: toRGBA("#0096aa", 0.75),
        strokeDark: toRGBA("#1b03a4", 1),
        hovered: toRGBA("#d45a00", 1),
        textLabel: "#a0a0a06c",
    }
};

const gn_primary = "#1f4acc";
const gn_secondary = "#b5820c";
const gn_selected = "#265cff";

const GOLD_NAVY_THEME: FieldColors = {
    primary: gn_primary,
    secondary: gn_secondary,

    control: {
        fill: toRGBA(gn_primary, 0.5),
        selected: toRGBA(gn_selected, 0.75),
        stroke: toRGBA(gn_secondary, 0.75),
    },
    turn: {
        stroke: "#3d2a00",
        selected: toRGBA(gn_selected, 0.9),
        strokePos: toRGBA(gn_secondary, 1),
    },
    path: {
        strokeLight: toRGBA("#f09e60", 1),
        stroke: toRGBA(gn_secondary, 0.75),
        strokeDark: toRGBA("#85b50c", 1),
        hovered: toRGBA(gn_primary, 1),
        textLabel: "#a0a0a06c",
    }
};

export const DEFAULT_THEMES = [
    RED_BLUE_THEME,
    GREEN_PURPLE_THEME,
    ORANGE_CYAN_THEME,
    GOLD_NAVY_THEME,
]

// const primary = toRGBA("#a02007", 0.5);
// const secondary = toRGBA("#1560BD", 0.75);

// const colors = {
//   node: {
//     fill: primary,
//     fillSelected: "rgba(180, 50, 11, .75)",
//     stroke: secondary,
//   },
//   indicator: {
//     stroke: "#451717",
//     strokeSelected: "rgba(160, 50, 11, .9)",
//     strokeWithPos: secondary,
//   },
//   numberLabel: "#a0a0a06c",
//   path: {
//     strokeLight: toRGBA("#00ab36", 1),
//     stroke: toRGBA("#b1d61c", 0.75),
//     strokeDark: toRGBA("#cd2020", 1), 
//     strokeHovered: "rgba(180, 50, 11, 1)",
//   },
// };


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

    return {
        ...path,
        segments: path.segments.map(s => ({
            ...s,
            selected: !s.locked && s.visible &&
                ((s.pose.x !== null && s.pose.y !== null &&
                    s.pose.x >= minX && s.pose.x <= maxX &&
                    s.pose.y >= minY && s.pose.y <= maxY) ||
                    snapWithinBox(s))
        }))
    };
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