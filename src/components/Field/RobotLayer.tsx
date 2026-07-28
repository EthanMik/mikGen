import React, { memo } from "react";
import RobotView, { type DistanceSensor } from "../Util/RobotView";
import type { Pose } from "../../core/Types/Pose";
import type { Path } from "../../core/Types/Path";
import type { Rectangle } from "../../core/Util";
import { useSettings } from "../../hooks/useSettings";
import type { RobotConstants } from "../../core/Robot";
import { useFormat } from "../../hooks/useFileFormat";
import { usePose } from "../../hooks/usePose";
import { useRobotPose } from "../../hooks/useRobotPose";

type RobotLayerProps = {
    img: Rectangle;
    robotConstants: RobotConstants;
    visible: boolean;
    path: Path;
};

const MECANUM_COLOR: number[] = [29, 100, 8];
const TANK_COLOR: number[] = [150, 150, 150];

const EXPANSION_TRANSPARENCY: number = 0.18;
const GHOST_TRANSPARENCY: number = 0.05;
const BG_TRANSPARENCY: number = 0.4;

type GhostRobotsProps = {
    img: Rectangle;
    robotPose: Pose[];
    robotConstants: RobotConstants;
    path: Path;
    bgColor: number[];
    show: boolean;
};

/** Memoized so pose-only animation frames re-render just the active robot, not every ghost. */
const GhostRobots = memo(function GhostRobots({ img, robotPose, robotConstants, path, bgColor, show }: GhostRobotsProps) {
    if (!show) return null;

    return (
        <>
            {robotPose.map((p, idx) => (
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
                            bgTransparency={GHOST_TRANSPARENCY}
                            expansionTransparency={GHOST_TRANSPARENCY}
                            frontExpansion={robotConstants.expansionFrontDisabled ? 0 : robotConstants.expansionFront}
                            leftExpansion={robotConstants.expansionLeftDisabled ? 0 : robotConstants.expansionLeft}
                            rightExpansion={robotConstants.expansionRightDisabled ? 0 : robotConstants.expansionRight}
                            rearExpansion={robotConstants.expansionRearDisabled ? 0 : robotConstants.expansionRear}
                        />
                    )}
                </React.Fragment>
            ))}
        </>
    );
});

export default function RobotLayer({ img, robotConstants, visible, path }: RobotLayerProps) {
    // Subscribed here rather than in Field so a pose write during playback re-renders
    // only this layer instead of the whole SVG tree
    const [pose] = usePose();
    const [robotPose] = useRobotPose();
    const [ settings, ] = useSettings();
    const [ format, ] = useFormat();

    const bgColor = format === "Holonomic" ? MECANUM_COLOR : TANK_COLOR;

    const sensors: DistanceSensor[] = (["Front", "Left", "Right", "Rear"] as const)
        .filter(side => !robotConstants[`sensor${side}Disabled`])
        .map(side => ({
            face: side.toLowerCase() as DistanceSensor["face"],
            offsetX: robotConstants[`sensor${side}X`],
            offsetY: robotConstants[`sensor${side}Y`],
        }));

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
                    expansionTransparency={EXPANSION_TRANSPARENCY}
                    bgTransparency={BG_TRANSPARENCY}
                    frontExpansion={robotConstants.expansionFrontDisabled ? 0 : robotConstants.expansionFront}
                    leftExpansion={robotConstants.expansionLeftDisabled ? 0 : robotConstants.expansionLeft}
                    rightExpansion={robotConstants.expansionRightDisabled ? 0 : robotConstants.expansionRight}
                    rearExpansion={robotConstants.expansionRearDisabled ? 0 : robotConstants.expansionRear}
                    cogOffsetX={robotConstants.cogOffsetXDisabled ? 0 : robotConstants.cogOffsetX}
                    cogOffsetY={robotConstants.cogOffsetYDisabled ? 0 : robotConstants.cogOffsetY}
                    sensors={sensors}
                />
            )}

            {/* Ghost Robots */}
            <GhostRobots
                img={img}
                robotPose={robotPose}
                robotConstants={robotConstants}
                path={path}
                bgColor={bgColor}
                show={settings.ghostRobots}
            />
        </>
    );
}
