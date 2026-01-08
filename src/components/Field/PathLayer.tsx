import type { Path } from "../../core/Types/Path";
import { FIELD_IMG_DIMENSIONS, type Rectangle } from "../../core/Util";
import { getSegmentLines } from "./FieldUtils";

type PathLayerProps = {
  path: Path;
  img: Rectangle;
  visible: boolean;
};

export default function PathLayer({ path, img, visible }: PathLayerProps) {
  if (visible || path.segments.length < 2) return null;
  const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2; 
  const imgRealSize = (img.w + img.h) / 2
  const scale = imgRealSize / imgDefaultSize;

  return (
    <>
      {path.segments.map((control, idx) => {
        const segPts = getSegmentLines(idx, path, img);
        if (!segPts) return null;

        return (
          <polyline
            key={`hover-seg-${control.id}`}
            points={segPts}
            fill="none"
            stroke={control.hovered ? "rgba(180, 50, 11, 1)" : "rgba(21, 96, 189, 1)"}
            strokeDasharray={`${10 * scale}, ${7 * scale}`}
            strokeWidth={control.hovered ? (3 * scale) : (2 * scale)}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}