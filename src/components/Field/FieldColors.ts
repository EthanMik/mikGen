import { toRGBA } from "../../core/Util";
import type { SegmentKind } from "../../simulation/FormatDefinition";

export type SegmentAttribute = {
    shape: "line" | "curve" | "circle" | "node";

    baseColor: string;
    selectedColor: string;

    hoverScale: number;
    selectedScale: number;
};

export type FieldColors = {
    pathBaseColor: string;
    pathHoverColor: string;
    pathSlowColor: string;
    pathMedColor: string;
    pathFastColor: string;
    endBorderColor: string;
    segmentColors: Record<SegmentKind, SegmentAttribute[]>;
};

export const FIELD_COLORS: FieldColors = {
    pathBaseColor: toRGBA("#1560BD", 0.75),

    pathHoverColor: toRGBA("#a02807", 1),

    pathSlowColor: toRGBA("#aa0505", 1),
    pathMedColor: toRGBA("#977f03", 0.75),
    pathFastColor: toRGBA("#058d29", 1),

    endBorderColor: toRGBA("#1560BD", 0.75),
    segmentColors: {
        start: [
            {
                shape: "node",
                baseColor: toRGBA("#a00753", 0.5),
                selectedColor: toRGBA("#a00753", 0.75),
                hoverScale: 1.4,
                selectedScale: 1,
            },
            {
                shape: "line",
                baseColor: toRGBA("#a00753", 1),
                selectedColor: toRGBA("#a00753", 1),
                hoverScale: 1.2,
                selectedScale: 1.12,
            },
        ],
        poseDrive: [
            {
                shape: "node",
                baseColor: toRGBA("#a02007", 0.5),
                selectedColor: toRGBA("#a0320b", 0.75),
                hoverScale: 1.4,
                selectedScale: 1,
            },
            {
                shape: "line",
                baseColor: toRGBA("#a02007", 1),
                selectedColor: toRGBA("#a0320b", 1),
                hoverScale: 1.2,
                selectedScale: 1.12,
            },
        ],
        pointDrive: [
            {
                shape: "node",
                baseColor: toRGBA("#a04207", 0.5),
                selectedColor: toRGBA("#a0440b", 0.75),
                hoverScale: 1.4,
                selectedScale: 1,
            },
        ],
        distanceDrive: [
            {
                shape: "node",
                baseColor: toRGBA("#a06d07", 0.5),
                selectedColor: toRGBA("#a08407", 0.75),
                hoverScale: 1.4,
                selectedScale: 1,
            },
        ],
        strafeDrive: [
            {
                shape: "node",
                baseColor: toRGBA("#77a007", 0.5),
                selectedColor: toRGBA("#63a007", 0.75),
                hoverScale: 1.4,
                selectedScale: 1,
            },
        ],
        pointTurn: [
            {
                shape: "line",
                baseColor: "#382727",
                selectedColor: toRGBA("#9d3737", 0.9),
                hoverScale: 1.2,
                selectedScale: 1.4,
            },
        ],
        angleTurn: [
            {
                shape: "line",
                baseColor: "#056185",
                selectedColor: toRGBA("#056185", 0.9),
                hoverScale: 1.2,
                selectedScale: 1.4,
            },
        ],
        pointSwing: [
            {
                shape: "curve",
                baseColor: "#491717",
                selectedColor: toRGBA("#862828", 0.9),
                hoverScale: 1.2,
                selectedScale: 1.3,
            },
        ],
        angleSwing: [
            {
                shape: "curve",
                baseColor: "#910798",
                selectedColor: toRGBA("#910798", 0.9),
                hoverScale: 1.2,
                selectedScale: 1.3,
            },
        ],
        wait: [
            {
                shape: "circle",
                baseColor: toRGBA("#1560BD", 0.3),
                selectedColor: toRGBA("#1560BD", 0.6),
                hoverScale: 1.2,
                selectedScale: 1.4,
            },
        ],
    },
};

export const SENSOR_COLORS: Record<"front" | "left" | "right" | "rear", string> = {
    front: "#aa0505",
    left: "#1560BD",
    right: "#058d29",
    rear: "#c66719",
};
