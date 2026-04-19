import { SIM_CONSTANTS } from "../core/ComputePathSim";
import type { Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";
import { findPointToFace, roundOff, toDeg } from "../core/Util";
import type { Format } from "../hooks/useFormat";
import type { FormatDef, SegmentDef, SegmentKind, SimFn } from "./FormatDefinition";
import { angle_error } from "./mikLibSim/Util";

export function convertPathToString<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>>>(formatDef: FormatDef<F, Segs>, path: Path, selected = false): string {
    let pathString = '';

    for (let idx = 0; idx < path.segments.length; idx++) {
        const seg = path.segments[idx];

        if (selected && !seg.selected) continue;

        const x = roundOff(seg.pose.x, 2);
        const y = roundOff(seg.pose.y, 2);
        const angle = roundOff(seg.pose.angle, 2);
        const k = seg.constants as typeof formatDef.constants;
        const kind = seg.kind as SegmentKind;
        const segDef = formatDef.segments[kind];

        if (!segDef) continue;

        const mergedK: Record<string, unknown> = Object.assign({}, ...k);
        const kBuilderStr = formatDef.kBuilder ? formatDef.kBuilder(segDef.defaults, k) : "";

        let line = segDef.toStringTemplate
            .replace(/\$\{x\}/g, x)
            .replace(/\$\{y\}/g, y)
            .replace(/\$\{angle\}/g, angle);

        for (const key of Object.keys(mergedK)) {
            line = line.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(mergedK[key]));
        }

        if (kBuilderStr === "") {
            line = line.replace(/,\s*\$\{kBuilder\}/g, "").replace(/\$\{kBuilder\}/g, "");
        } else {
            line = line.replace(/\$\{kBuilder\}/g, kBuilderStr);
        }

        pathString += line + '\n';
    }

    return pathString;
}


const LOG_SEGMENT_START_AND_END = true;
const LOG_ROBOT_STATE = true;
const LOG_SIMULATION_NUMBER = true;

SIM_CONSTANTS.seconds = 99;
let currentPathTime = -2 / 60;
let simComputed = 0;

export function convertPathToSim<F extends Format, Segs extends Record<SegmentKind, SegmentDef<F>>>(formatDef: FormatDef<F, Segs>, path: Path): SimFn[] {
    const auton: SimFn[] = [];
    currentPathTime = -2 / 60;
    DEBUG_printSimulationStart();

    for (let idx = 0; idx < path.segments.length; idx++) {
        const seg = path.segments[idx];
        const x = seg.pose.x ?? 0;
        const y = seg.pose.y ?? 0;
        const angle = seg.pose.angle ?? 0;
        const k = seg.constants as typeof formatDef.constants;
        const kind = seg.kind as SegmentKind;

        const turn_pos = findPointToFace(path, idx);

        let started = false;
        let targetDist = 0;

        switch (kind) {
            case "start":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        DEBUG_printRobotState(robot, dt);
                        const output = formatDef.segments[kind].simFn(robot, dt, x, y, angle, k);
                        return [output, kind, 0];
                    }
                );
                break;

            case "poseDrive":
            case "pointDrive":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = formatDef.segments[kind].simFn(robot, dt, x, y, angle, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
                    }
                );
                break;

            case "pointTurn":
            case "pointSwing":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            const targetAngle = toDeg(Math.atan2(turn_pos.x - robot.getX(), turn_pos.y - robot.getY())) + angle;
                            targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = formatDef.segments[kind].simFn(robot, dt, turn_pos.x, turn_pos.y, angle, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
                    }
                );
                break;

            case "angleTurn":
            case "angleSwing":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = formatDef.segments[kind].simFn(robot, dt, x, y, angle, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
                    }
                );
                break;
        }
    }

    return auton;
}

function DEBUG_printSegmentStart<F extends Format>(idx: number, formatDef: FormatDef<F>, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cStarting ${formatDef.segments[kind]?.name} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd<F extends Format>(idx: number, formatDef: FormatDef<F>, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cEnding ${formatDef.segments[kind]?.name} ${idx}`, "color: #ff6b6b; font-weight: bold");
}

function DEBUG_printRobotState(robot: Robot, dt: number) {
    if (!LOG_ROBOT_STATE) return;
    currentPathTime += dt;
    console.log(`%cx: ${robot.getX().toFixed(2)}, y: ${robot.getY().toFixed(2)}, θ: ${robot.getAngle().toFixed(2)} dt: ${currentPathTime.toFixed(2)}s`, "color: cyan");
}

function DEBUG_printSimulationStart() {
    if (!LOG_SIMULATION_NUMBER) return;
    simComputed += 1;
    console.log(`%cSTARTING SIMULATION COMPUTE #${simComputed}`, "color: violet; font-weight: bold");
}
