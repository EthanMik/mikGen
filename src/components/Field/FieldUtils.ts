import type { Coordinate } from "../../core/Types/Coordinate";
import { getBackwardsSnapPose, type Path } from "../../core/Types/Path";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, toRad, type Rectangle } from "../../core/Util";

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

export const getSegmentLines = (idx: number, path: Path, img: Rectangle): string | null => {
  if (idx <= 0) return null;

  const m = path.segments[idx];
  if (m.pose.x === null || m.pose.y === null) return null;

  const startPose = getBackwardsSnapPose(path, idx - 1);
  if (startPose === null || startPose.x === null || startPose.y === null) return null;

  const pStart = toPX({ x: startPose.x, y: startPose.y }, FIELD_REAL_DIMENSIONS, img);
  const pEnd = toPX({ x: m.pose.x, y: m.pose.y }, FIELD_REAL_DIMENSIONS, img);

  if (m.kind === "pointDrive") {
    return `${pStart.x},${pStart.y} ${pEnd.x},${pEnd.y}`;
  }

  let lead = 0;
  if (m.kind !== "poseDrive") return "";

  switch (m.format) {
    case "mikLib" : 
        lead = m.constants.drive.lead ?? 0;
        break;
    case "ReveilLib" : 
        lead = m.constants.lead ?? 0;
        break;
  }

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