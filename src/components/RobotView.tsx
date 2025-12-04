import { FIELD_IMG_DIMENSIONS, FIELD_REAL_DIMENSIONS, normalizeDeg, toPX } from "../core/Util";

type RobotViewProps = {
    x: number,
    y: number,
    angle: number,
    width: number,
    height: number,
};

function toPxHeight(value: number) {
    return FIELD_IMG_DIMENSIONS.h / FIELD_REAL_DIMENSIONS.h * value;
}

function toPxWidth(value: number) {
    return FIELD_IMG_DIMENSIONS.w / FIELD_REAL_DIMENSIONS.w * value;
}

export default function RobotView({
    x,
    y,
    angle,
    width,
    height
}: RobotViewProps) {

    const pxWidth = toPxWidth(width);
    const pxHeight = toPxHeight(height);
    const pos = toPX({x: x, y: y}, FIELD_REAL_DIMENSIONS, FIELD_IMG_DIMENSIONS)
    const normAngle = normalizeDeg(angle);

    return (
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${normAngle})`}>
            <rect
                fill="rgba(150, 150, 150, 0.4)"
                stroke="black"
                strokeWidth={.5}            
                x={-pxWidth / 2}
                y={-pxHeight / 2}
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
        </g>
    )
}