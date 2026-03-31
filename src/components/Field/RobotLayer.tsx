import React from "react";
import RobotView from "../Util/RobotView";
import type { Pose } from "../../core/Types/Pose";
import type { Path } from "../../core/Types/Path";
import type { Rectangle } from "../../core/Util";
import { useSettings } from "../../hooks/useSettings";
import type { RobotConstants } from "../../core/Robot";
import { useFormat } from "../../hooks/useFormat";

type RobotLayerProps = {
    img: Rectangle;
    pose: Pose | null;
    robotPose: Pose[];
    robotConstants: RobotConstants;
    visible: boolean;
    path: Path;
};

export default function RobotLayer({ img, pose, robotPose, robotConstants, visible, path }: RobotLayerProps) {
    const [ settings, ] = useSettings();
    const [ format, ] = useFormat();
 
    const mecnumColor: number[] = [29, 100, 8];
    const tankColor: number[] = [150, 150, 150];

    const expansionTransparency: number = 0.18;
    const ghostTransparency: number = 0.05;
    
    const bgColor = format === "RevMecanum" ? mecnumColor : tankColor;
    const bgTransparency: number = 0.4;

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
                    bg={bgColor}
                    expansionTransparency={expansionTransparency}
                    bgTransparency={bgTransparency}
                    frontExpansion={robotConstants.expansionFront}
                    leftExpansion={robotConstants.expansionLeft}
                    rightExpansion={robotConstants.expansionRight}
                    rearExpansion={robotConstants.expansionRear}    
                />
            )}

        {/* Ghost Robots */}
        {!visible && settings.ghostRobots && 
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
                        bg={bgColor}
                        bgTransparency={ghostTransparency}
                        expansionTransparency={ghostTransparency}
                        frontExpansion={robotConstants.expansionFront}
                        leftExpansion={robotConstants.expansionLeft}
                        rightExpansion={robotConstants.expansionRight}
                        rearExpansion={robotConstants.expansionRear}    
                    />
                )}
            </React.Fragment>
            ))}
        </>
    );
}