import { FIELD_REAL_DIMENSIONS, normalizeDeg, toPX, toRad, type Rectangle } from "../../core/Util";
import { SENSOR_COLORS } from "../Field/FieldColors";

const FIELD_WALL = 70.25;
const SENSOR_MIN_RANGE = 20 / 25.4;   // 20 mm in inches
const SENSOR_MAX_RANGE = 2000 / 25.4; // 2000 mm in inches

export type DistanceSensor = {
    face: "front" | "left" | "right" | "rear",
    offsetX: number,
    offsetY: number,
};

type RobotViewProps = {
    img: Rectangle,
    x: number,
    y: number,
    angle: number,
    width: number,
    height: number,
    bg: number[],
    bgTransparency: number,
    expansionTransparency: number,
    frontExpansion?: number,
    leftExpansion?: number,
    rightExpansion?: number,
    rearExpansion?: number,
    cogOffsetX?: number,
    cogOffsetY?: number,
    sensors?: DistanceSensor[],
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
    bgTransparency,
    expansionTransparency,
    frontExpansion,
    leftExpansion,
    rightExpansion,
    rearExpansion,
    cogOffsetX = 0,
    cogOffsetY = 0,
    sensors,
}: RobotViewProps) {

    const pxWidth = toPxWidth(img.w, width);
    const pxHeight = toPxHeight(img.h, height);
    const pos = toPX({x: x, y: y}, FIELD_REAL_DIMENSIONS, img)
    const normAngle = normalizeDeg(angle);

    const cogPxX = toPxWidth(img.w, cogOffsetX);
    const cogPxY = -toPxHeight(img.h, cogOffsetY);

    const pxFrontExpansion = toPxHeight(img.h, frontExpansion ?? 0);
    const pxRearExpansion = toPxHeight(img.h, rearExpansion ?? 0);
    const pxLeftExpansion = toPxWidth(img.w, leftExpansion ?? 0);
    const pxRightExpansion = toPxWidth(img.w, rightExpansion ?? 0);

    const robotX = -pxWidth / 2;
    const robotY = -pxHeight / 2;

    const theta = toRad(normAngle);
    const fwdWorld = { x: Math.sin(theta), y: Math.cos(theta) };
    const rightWorld = { x: Math.cos(theta), y: -Math.sin(theta) };

    const sensorRays = (sensors ?? []).map((s) => {
        const startWorldX = x + rightWorld.x * s.offsetX + fwdWorld.x * s.offsetY;
        const startWorldY = y + rightWorld.y * s.offsetX + fwdWorld.y * s.offsetY;

        const dirWorld =
            s.face === "front" ? fwdWorld :
            s.face === "rear" ? { x: -fwdWorld.x, y: -fwdWorld.y } :
            s.face === "right" ? rightWorld :
            { x: -rightWorld.x, y: -rightWorld.y };

        const hits: number[] = [];
        if (dirWorld.x !== 0) hits.push((FIELD_WALL - startWorldX) / dirWorld.x, (-FIELD_WALL - startWorldX) / dirWorld.x);
        if (dirWorld.y !== 0) hits.push((FIELD_WALL - startWorldY) / dirWorld.y, (-FIELD_WALL - startWorldY) / dirWorld.y);
        const dist = Math.min(...hits.filter(t => t > 0));
        const inRange = Number.isFinite(dist) && dist >= SENSOR_MIN_RANGE && dist <= SENSOR_MAX_RANGE;

        const startPxX = toPxWidth(img.w, s.offsetX);
        const startPxY = -toPxHeight(img.h, s.offsetY);
        const lenPxX = inRange ? toPxWidth(img.w, dist) : 3;
        const lenPxY = inRange ? toPxHeight(img.h, dist) : 3;
        const [endPxX, endPxY] =
            s.face === "front" ? [startPxX, startPxY - lenPxY] :
            s.face === "rear" ? [startPxX, startPxY + lenPxY] :
            s.face === "right" ? [startPxX + lenPxX, startPxY] :
            [startPxX - lenPxX, startPxY];

        return { face: s.face, startPxX, startPxY, endPxX, endPxY };
    });

    return (
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${normAngle})`}>
            <rect
                fill={`rgba(${[...bg, bgTransparency].join(", ")})`}
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

            <circle cx={cogPxX} cy={cogPxY} r={2} fill={`rgba(${[...bg, bgTransparency].join(", ")})`} />

            {/* Front expansion */}
            <rect
                fill={`rgba(${[...bg, expansionTransparency].join(", ")})`}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX}
                y={robotY - pxFrontExpansion}
                width={pxWidth}
                height={pxFrontExpansion}
            />

            {/* Rear expansion */}
            <rect
                fill={`rgba(${[...bg, expansionTransparency].join(", ")})`}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX}
                y={robotY + pxHeight}
                width={pxWidth}
                height={pxRearExpansion}
            />

            {/* Left expansion */}
            <rect
                fill={`rgba(${[...bg, expansionTransparency].join(", ")})`}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX - pxLeftExpansion}
                y={robotY}
                width={pxLeftExpansion}
                height={pxHeight}
            />

            {/* Right expansion */}
            <rect
                fill={`rgba(${[...bg, expansionTransparency].join(", ")})`}
                stroke="rgb(0, 0, 0)"
                strokeWidth={.5}
                x={robotX + pxWidth}
                y={robotY}
                width={pxRightExpansion}
                height={pxHeight}
            />

            {/* Distance sensor rays */}
            {sensorRays.map(r => (
                <g key={r.face}>
                    <circle
                        cx={r.startPxX}
                        cy={r.startPxY}
                        r={2}
                        fill="black"
                    />
                    <line
                        x1={r.startPxX}
                        y1={r.startPxY}
                        x2={r.endPxX}
                        y2={r.endPxY}
                        stroke={SENSOR_COLORS[r.face]}
                        strokeWidth={1.5}
                    />
                </g>
            ))}
        </g>
    )
}