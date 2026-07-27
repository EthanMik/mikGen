import { memo, useMemo } from "react";
import { computedPathStore } from "../../core/ComputePathSim";
import { hoveredSegmentStore } from "../../core/HoverStore";
import type { Path } from "../../core/Types/Path";
import { FIELD_IMG_DIMENSIONS, FIELD_REAL_DIMENSIONS, toRGB, type Rectangle } from "../../core/Util";
import { getSegmentPointsInch, getPreciseSegmentDots, pointsToSvg } from "./FieldUtils";
import { FIELD_COLORS } from "./FieldColors";

const DOT_SPACING = 1.5;
const DOT_RADIUS = 1.8 * FIELD_REAL_DIMENSIONS.w / FIELD_IMG_DIMENSIONS.w;

const SLOW_RGB = toRGB(FIELD_COLORS.pathSlowColor);
const MID_RGB = toRGB(FIELD_COLORS.pathMedColor);
const FAST_RGB = toRGB(FIELD_COLORS.pathFastColor);
const HOVER_RGB = toRGB(FIELD_COLORS.pathHoverColor);

const HOVER_TINT = 0.45;

function speedColor(t: number, slow: number[], mid: number[], fast: number[], tint = 0): string {
  const [a, b, frac] = t < 0.5 ? [slow, mid, t * 2] : [mid, fast, (t - 0.5) * 2];
  const channel = (i: number) => {
    const c = a[i] + frac * (b[i] - a[i]);
    return Math.round(c + (HOVER_RGB[i] - c) * tint);
  };
  return `rgb(${channel(0)},${channel(1)},${channel(2)})`;
}

type Dot = { x: number; y: number; t: number };

/**
 * A segment's dots live in inch space and the enclosing group carries the zoom/pan transform,
 * so nothing here depends on img. Memoized because a long path is thousands of circles that
 * would otherwise be rebuilt on every pan frame.
 */
const PreciseDots = memo(function PreciseDots({ dots, hovered }: { dots: Dot[]; hovered: boolean }) {
  return (
    <>
      {dots.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={DOT_RADIUS}
          fill={speedColor(pt.t, SLOW_RGB, MID_RGB, FAST_RGB, hovered ? HOVER_TINT : 0)}
        />
      ))}
    </>
  );
});

type PathLayerProps = {
  path: Path;
  img: Rectangle;
  visible: boolean;
  precise: boolean;
};

export default function PathLayer({ path, img, visible, precise }: PathLayerProps) {
  const trajectories = computedPathStore.useSelector(s => s.segmentTrajectorys);
  const hoveredId = hoveredSegmentStore.useStore();

  const allDots = useMemo(
    () => path.segments.map((_, idx) => getPreciseSegmentDots(idx, DOT_SPACING)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trajectories, path.segments.length]
  );

  // Cached against the path so panning and zooming only re-run the cheap inch -> pixel mapping
  const allPoints = useMemo(
    () => path.segments.map((_, idx) => getSegmentPointsInch(idx, path)),
    [path]
  );

  if (visible || path.segments.length < 2) return null;

  const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2;
  const imgRealSize = (img.w + img.h) / 2;
  const scale = imgRealSize / imgDefaultSize;

  // single SVG transform mapping real-world inches -> pixel space
  // derived from toPX: px.x = img.x + sx*(x - field.x),  px.y = img.y - sy*(y - field.y)
  const sx = img.w / FIELD_REAL_DIMENSIONS.w;
  const sy = img.h / FIELD_REAL_DIMENSIONS.h;
  const tx = img.x - sx * FIELD_REAL_DIMENSIONS.x;
  const ty = img.y + sy * FIELD_REAL_DIMENSIONS.y;
  const dotTransform = `translate(${tx},${ty}) scale(${sx},${-sy})`;

  return (
    <>
      {path.segments.map((control, idx) => {
        const hovered = hoveredId === control.id;
        const color = hovered ? FIELD_COLORS.pathHoverColor : FIELD_COLORS.pathBaseColor;

        if (precise) {
          const dots = allDots[idx];
          if (!dots) return null;
          return (
            <g key={`precise-seg-${control.id}`} transform={dotTransform}>
              <PreciseDots dots={dots} hovered={hovered} />
            </g>
          );
        }

        const points = allPoints[idx];
        if (!points) return null;

        return (
          <polyline
            key={`hover-seg-${control.id}`}
            points={pointsToSvg(points, img)}
            fill="none"
            stroke={color}
            strokeDasharray={`${10 * scale}, ${7 * scale}`}
            strokeWidth={hovered ? (3 * scale) : (2 * scale)}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}
