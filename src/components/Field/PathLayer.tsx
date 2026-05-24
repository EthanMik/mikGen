import { useMemo } from "react";
import { computedPathStore } from "../../core/ComputePathSim";
import type { Path } from "../../core/Types/Path";
import { FIELD_IMG_DIMENSIONS, FIELD_REAL_DIMENSIONS, toRGB, type Rectangle } from "../../core/Util";
import { getSegmentLines, getPreciseSegmentDots, type FieldColors } from "./FieldUtils";

const DOT_SPACING = 2;
// radius in real-world inches so the SVG group transform scales it automatically with zoom
const DOT_RADIUS = 1.8 * FIELD_REAL_DIMENSIONS.w / FIELD_IMG_DIMENSIONS.w;

function speedColor(t: number, slow: number[], mid: number[], fast: number[]): string {
  const curved = Math.pow(t, 1.5);
  const [a, b, frac] = curved < 0.5 ? [slow, mid, curved * 2] : [mid, fast, (curved - 0.5) * 2];
  return `rgb(${Math.round(a[0] + frac * (b[0] - a[0]))},${Math.round(a[1] + frac * (b[1] - a[1]))},${Math.round(a[2] + frac * (b[2] - a[2]))})`;
}

type PathLayerProps = {
  path: Path;
  img: Rectangle;
  visible: boolean;
  precise: boolean;
  colors: FieldColors;
};

export default function PathLayer({ path, img, visible, precise, colors }: PathLayerProps) {
  const trajectories = computedPathStore.useSelector(s => s.segmentTrajectorys);

  const allDots = useMemo(
    () => path.segments.map((_, idx) => getPreciseSegmentDots(idx, DOT_SPACING)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trajectories, path.segments.length]
  );

  const slowRGB = useMemo(() => toRGB(colors.path.strokeDark), [colors.path.strokeDark]);
  const midRGB  = useMemo(() => toRGB(colors.path.stroke),     [colors.path.stroke]);
  const fastRGB = useMemo(() => toRGB(colors.path.strokeLight), [colors.path.strokeLight]);

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
        const color = control.hovered ? colors.path.hovered : colors.path.stroke;

        if (precise) {
          const dots = allDots[idx];
          if (!dots) return null;
          return (
            <g key={`precise-seg-${control.id}`} transform={dotTransform}>
              {dots.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={DOT_RADIUS}
                  fill={control.hovered ? color : speedColor(pt.t, slowRGB, midRGB, fastRGB)}
                />
              ))}
            </g>
          );
        }

        const segPts = getSegmentLines(idx, path, img, false);
        if (!segPts) return null;

        return (
          <polyline
            key={`hover-seg-${control.id}`}
            points={segPts}
            fill="none"
            stroke={color}
            strokeDasharray={`${10 * scale}, ${7 * scale}`}
            strokeWidth={control.hovered ? (3 * scale) : (2 * scale)}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}
