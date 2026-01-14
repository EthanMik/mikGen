import { FIELD_REAL_DIMENSIONS, normalizeDeg, toPX, type Rectangle } from "../../core/Util";

type RobotViewProps = {
    img: Rectangle,
    x: number,
    y: number,
    angle: number,
    width: number,
    height: number,
    bg?: string,
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
}: RobotViewProps) {

    const pxWidth = toPxWidth(img.w, width);
    const pxHeight = toPxHeight(img.h, height);
    const pos = toPX({x: x, y: y}, FIELD_REAL_DIMENSIONS, img)
    const normAngle = normalizeDeg(angle);

    return (
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${normAngle})`}>
            <rect
                fill={bg ?? "rgba(150, 150, 150, 0.4)"}
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