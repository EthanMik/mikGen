import { FIELD_REAL_DIMENSIONS, normalizeDeg, toPX, type Rectangle } from "../../core/Util";

type RobotViewProps = {
    img: Rectangle,
    x: number,
    y: number,
    angle: number,
    width: number,
    height: number,
    bg?: string,
    frontExpansion?: number,
    leftExpansion?: number,
    rightExpansion?: number,
    rearExpansion?: number
};

function toPxHeight(imgHeight: number, value: number) {
    return imgHeight / FIELD_REAL_DIMENSIONS.h * value;
}

function toPxWidth(imageWidth: number, value: number) {
    return imageWidth / FIELD_REAL_DIMENSIONS.w * value;
}

export default function RobotView({
    img,
    x,
    y,
    angle,
    width,
    height,
    bg,
    frontExpansion,
    leftExpansion,
    rightExpansion,
    rearExpansion,
}: RobotViewProps) {

    const pxWidth = toPxWidth(img.w, width);
    const pxHeight = toPxHeight(img.h, height);
    const pos = toPX({x: x, y: y}, FIELD_REAL_DIMENSIONS, img)
    const normAngle = normalizeDeg(angle);

    const pxFrontExpansion = toPxHeight(img.h, frontExpansion ?? 0);
    const pxRearExpansion = toPxHeight(img.h, rearExpansion ?? 0);
    const pxLeftExpansion = toPxWidth(img.w, leftExpansion ?? 0);
    const pxRightExpansion = toPxWidth(img.w, rightExpansion ?? 0);

    const robotX = -pxWidth / 2;
    const robotY = -pxHeight / 2;

    const expansionColor: string = "rgba(150, 150, 150, 0.18)";
    // const expansionColor: string = "rgba(155, 55, 19, 0.13)";

    return (
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${normAngle})`}>
            <rect
                fill={bg ?? "rgba(150, 150, 150, 0.4)"}
                stroke="black"
                strokeWidth={.5}
                x={robotX}
                y={robotY}
                width={pxWidth}
                height={pxHeight}
            />

            <line
                x1={0}
                y1={0}
                x2={0}
                y2={-pxHeight / 2}
                stroke="black"
                strokeWidth={1}
            />

            {/* Front expansion */}
            <rect
                fill={expansionColor}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX}
                y={robotY - pxFrontExpansion}
                width={pxWidth}
                height={pxFrontExpansion}
            />

            {/* Rear expansion */}
            <rect
                fill={expansionColor}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX}
                y={robotY + pxHeight}
                width={pxWidth}
                height={pxRearExpansion}
            />

            {/* Left expansion */}
            <rect
                fill={expansionColor}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX - pxLeftExpansion}
                y={robotY}
                width={pxLeftExpansion}
                height={pxHeight}
            />

            {/* Right expansion */}
            <rect
                fill={expansionColor}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX + pxWidth}
                y={robotY}
                width={pxRightExpansion}
                height={pxHeight}
            />
        </g>
    )
}