import React, { memo, useMemo } from "react";
import RobotView, { type DistanceSensor } from "../Util/RobotView";
import type { Pose } from "../../core/Types/Pose";
import type { Path } from "../../core/Types/Path";
import type { Rectangle } from "../../core/Util";
import { useSettings } from "../../hooks/useSettings";
import type { RobotConstants } from "../../core/Robot";
import { useFormat } from "../../hooks/useFileFormat";
import { usePose } from "../../hooks/usePose";
import { useRobotPose } from "../../hooks/useRobotPose";
import { computedPathStore, type Snapshot } from "../../core/ComputePathSim";

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

/**
 * Poses every `spacing` inches of travel along one segment, for the onion layers between its
 * start and its end. The end pose is drawn on its own, so a layer that would land on top of it
 * is dropped rather than doubling up the outline.
 */
function onionLayerPoses(segment: Snapshot[], spacing: number): Pose[] {
    if (spacing <= 0 || segment.length < 2) return [];

    const steps: number[] = [];
    let total = 0;
    for (let i = 1; i < segment.length; i++) {
        const step = Math.hypot(segment[i].x - segment[i - 1].x, segment[i].y - segment[i - 1].y);
        steps.push(step);
        total += step;
    }

    const poses: Pose[] = [];
    let travelled = 0;
    let next = spacing;
    for (let i = 1; i < segment.length; i++) {
        travelled += steps[i - 1];
        if (travelled < next || total - travelled < spacing / 2) continue;
        poses.push({ x: segment[i].x, y: segment[i].y, angle: segment[i].angle });
        // measured from where the layer actually landed, so the sampling cannot drift
        next = travelled + spacing;
    }
    return poses;
}

type OnionLayersProps = {
    img: Rectangle;
    endPoses: Pose[];
    layerPoses: Pose[][];
    robotConstants: RobotConstants;
    path: Path;
    bgColor: number[];
    show: boolean;
};

/** Memoized so pose-only animation frames re-render just the active robot, not every outline. */
const OnionLayers = memo(function OnionLayers({ img, endPoses, layerPoses, robotConstants, path, bgColor, show }: OnionLayersProps) {
    if (!show) return null;

    const outline = (p: Pose, key: string) => (
        <RobotView
            key={key}
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
    );

    return (
        <>
            {endPoses.map((p, idx) => (
                <React.Fragment key={`ghost-${idx}`}>
                    {path.segments[idx]?.visible && (
                        <>
                            {layerPoses[idx]?.map((layer, i) => outline(layer, `layer-${idx}-${i}`))}
                            {outline(p, `end-${idx}`)}
                        </>
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
    const computedPath = computedPathStore.useStore();

    const bgColor = format === "Holonomic" ? MECANUM_COLOR : TANK_COLOR;

    // Only the recompute writes the store, so the layers are sampled once per path change
    // rather than once per animation frame
    const spacing = settings.onionLayers ? settings.onionSpacing : 0;
    const layerPoses = useMemo(
        () => computedPath.segmentTrajectorys.map(segment => onionLayerPoses(segment, spacing)),
        [computedPath, spacing]
    );

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

            {/* Onion Layers */}
            <OnionLayers
                img={img}
                endPoses={robotPose}
                layerPoses={layerPoses}
                robotConstants={robotConstants}
                path={path}
                bgColor={bgColor}
                show={settings.onionLayers}
            />
        </>
    );
}
