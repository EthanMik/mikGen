import type { Path } from "../../core/Types/Path";
import { getBackwardsSnapPose } from "../../core/Types/Path";
import { interpolatePoses, toPX, FIELD_REAL_DIMENSIONS, type Rectangle } from "../../core/Util";
import { getSegmentLines } from "./FieldUtils";

type CommandLayerProps = {
  path: Path;
  img: Rectangle;
  visible: boolean;
};

export default function CommandLayer({ path, img, visible }: CommandLayerProps) {
  if (visible || !path) return null;

  return (
    <g>
      {path.segments.map((control, idx) => {
        if (!control.visible || control.pose.x === null || control.pose.y === null || control.command.name === "") {
          return null;
        }

        const snapPose = getBackwardsSnapPose(path, idx - 1);
        if (snapPose === null || snapPose.y === null || snapPose.x === null) return null;

        let posPx = toPX(interpolatePoses(control.pose, snapPose, control.command.percent / 100)!, FIELD_REAL_DIMENSIONS, img);

        const pts = getSegmentLines(idx, path, img)?.split(" ");
        if (control.kind === "poseDrive" && pts !== undefined) {
          const ptsIdx = Math.floor((control.command.percent / 100) * (pts?.length - 1));
          const coord = pts[ptsIdx].split(",");
          posPx = { x: Number(coord[0]), y: Number(coord[1]) };
        }

        return (
          <circle
            key={`cmd-${control.id}`}
            fill={"#1566bd" + "BF"}
            r={8}
            cx={posPx.x}
            cy={posPx.y}
          />
        );
      })}
    </g>
  );
}