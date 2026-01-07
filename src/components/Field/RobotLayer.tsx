import React from "react";
import RobotView from "../Util/RobotView";
import type { Pose } from "../../core/Types/Pose";
import type { Path } from "../../core/Types/Path";
import type { Rectangle } from "../../core/Util";

type RobotLayerProps = {
    img: Rectangle;
    pose: Pose | null;
    robotPose: Pose[];
    robotConstants: { width: number; height: number };
    visible: boolean;
    path: Path;
};

export default function RobotLayer({ img, pose, robotPose, robotConstants, visible, path }: RobotLayerProps) {
  return (
    <>
        {/* Active Robot */}
        {pose && visible && (
            <RobotView
                img={img}
                x={pose.x ?? 0}
                y={pose.y ?? 0}
                angle={pose.angle ?? 0}
                width={robotConstants.width}
                height={robotConstants.height}
            />
        )}

      {/* Ghost Robots */}
      {!visible &&
        robotPose.map((p, idx) => (
        <React.Fragment key={`ghost-${idx}`}>
            {path.segments[idx]?.visible && (
                <RobotView
                    img={img}
                    x={p.x ?? 0} 
                    y={p.y ?? 0}
                    angle={p.angle ?? 0}
                    width={robotConstants.width}
                    height={robotConstants.height}
                    bg={"rgba(150, 150, 150, 0.05)"}
                />
            )}
        </React.Fragment>
        ))}
    </>
  );
}