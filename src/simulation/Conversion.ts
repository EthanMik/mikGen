import { SIM_CONSTANTS } from "../core/ComputePathSim";
import type { Robot } from "../core/Robot";
import { distanceToPosition, getSegmentDistance, type Path } from "../core/Types/Path";
import { findPointToFace, makeId, roundOff, toDeg } from "../core/Util";
import type { Segment } from "../core/Types/Segment";
import type { Format } from "./FormatDefinition";
import type { FormatDef, SegmentConstants, SegmentDef, SegmentKind, SimFn } from "./FormatDefinition";
import { angle_error } from "./mikLibSim/Util";
import { createStore } from "../core/Store";

export function convertPathToString<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>>>(formatDef: FormatDef<F, Segs>, path: Path, selected = false): string {
    let pathString = '';

    for (let idx = 0; idx < path.segments.length; idx++) {
        const seg = path.segments[idx];

        if (selected && !seg.selected) continue;

        let x = roundOff(seg.pose.x, 2);
        let y = roundOff(seg.pose.y, 2);
        const angle = roundOff(seg.pose.angle, 2);
        const rawDistance = seg.kind === "distanceDrive" ? (seg.distance ?? getSegmentDistance(path, idx)) : seg.distance;
        const distance = roundOff(rawDistance, 2);
        const time = roundOff(seg.time, 0);
        const k = seg.constants as typeof formatDef.constants;
        const kind = seg.kind as SegmentKind;
        const segDef = formatDef.segments[kind];

        if (kind === "angleSwing" || kind === "pointSwing" || kind === "angleTurn" || kind === "pointTurn") {
            const turn_pos = findPointToFace(path, idx);
            x = roundOff(turn_pos.x, 2);
            y = roundOff(turn_pos.y, 2);
        }

        if (!segDef) continue;
        const resolvedDef = segDef.castTo ? (formatDef.segments[segDef.castTo] ?? segDef) : segDef;
        if (!resolvedDef.toStringTemplate) continue;

        const mergedK: Record<string, unknown> = Object.assign({}, ...k);
        const kBuilderStr = formatDef.kBuilder ? formatDef.kBuilder(resolvedDef.defaults ?? formatDef.constants, k, seg.pose, kind) : "";

        let line = resolvedDef.toStringTemplate
            .replace(/\$\{x\}/g, x)
            .replace(/\$\{y\}/g, y)
            .replace(/\$\{angle\}/g, angle)
            .replace(/\$\{distance\}/g, distance)
            .replace(/\$\{time\}/g, time);

        for (const key of Object.keys(mergedK)) {
            line = line.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(mergedK[key]));
        }

        line = line.replace(/\$\{(\d+):(\w+)\}/g, (_, idxStr, key) => {
            const group = k[Number(idxStr)] as unknown as Record<string, unknown> | undefined;
            return group && key in group ? String(group[key]) : '';
        });

        if (kBuilderStr === "") {
            line = line.replace(/,\s*\$\{kBuilder\}/g, "").replace(/\$\{kBuilder\}/g, "");
        } else {
            line = line.replace(/\$\{kBuilder\}/g, kBuilderStr);
        }

        pathString += line + '\n';
    }

    return pathString;
}

export function convertStringToPath<F extends Format>(
    formatDef: FormatDef<F>,
    format: F,
    pathString: string
): Segment[] {
    const segments: Segment[] = [];

    for (const rawLine of pathString.split('\n')) {
        const line = rawLine.trim().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
        if (!line) continue;

        for (const [kind, segDef] of Object.entries(formatDef.segments) as [SegmentKind, SegmentDef<F>][]) {
            if (!segDef || segDef.castTo || !segDef.toStringTemplate) continue;
            const seg = parseSegmentLine(line, kind, segDef, formatDef, format);
            if (seg) { segments.push(seg); break; }
        }
    }

    const tempPath: Path = { name: "", segments };
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg.kind !== "distanceDrive" || seg.distance == null) continue;
        const pos = distanceToPosition(tempPath, i, seg.distance);
        if (pos) segments[i] = { ...seg, pose: { ...seg.pose, x: pos.x, y: pos.y } };
    }

    return segments;
}

export function templateToRegex(template: string): { regex: RegExp; groups: string[] } {
    const groups: string[] = [];
    const hasOptKBuilder = template.includes(', ${kBuilder}');
    let t = template.replace(', ${kBuilder}', '__KBUILDER_OPT__');

    t = t.replace(/\$\{([^}]+)\}/g, (_, name: string) => {
        groups.push(name);
        return name === 'x' || name === 'y' || name === 'angle' || name === 'distance' || name === 'time' ? '__COORD__' : '__FIELD__';
    });

    t = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (hasOptKBuilder) {
        groups.push('kBuilder');
        t = t.replace('__KBUILDER_OPT__', '(?:, (.+))?');
    }
    t = t.replace(/__COORD__/g, '(-?[\\d.]+)');
    t = t.replace(/__FIELD__/g, '([^,)]+?)');

    return { regex: new RegExp(`^\\s*${t}\\s*$`), groups };
}

function parseSegmentLine<F extends Format>(
    line: string,
    kind: SegmentKind,
    segDef: SegmentDef<F>,
    formatDef: FormatDef<F>,
    format: F
): Segment | null {
    if (!segDef.toStringTemplate) return null;
    const { regex, groups } = templateToRegex(segDef.toStringTemplate);
    const match = line.match(regex);
    if (!match) return null;

    const captured: Record<string, string> = {};
    groups.forEach((name, i) => { captured[name] = match[i + 1] ?? ''; });

    const pointBased = kind === "pointTurn" || kind === "pointSwing";
    const x = (!pointBased && 'x' in captured) ? parseFloat(captured.x) : null;
    const y = (!pointBased && 'y' in captured) ? parseFloat(captured.y) : null;
    let angle: number | null = 'angle' in captured ? parseFloat(captured.angle) : (pointBased ? 0 : null);

    const defaults = segDef.defaults as SegmentConstants<F>;
    let constants: SegmentConstants<F>;
    if (formatDef.kParser) {
        const [parsedConstants, poseOverride] = formatDef.kParser(defaults, captured.kBuilder ?? '', kind);
        constants = parsedConstants;
        if (poseOverride?.angle !== undefined) angle = poseOverride.angle;
    } else {
        constants = defaults.map(k => ({ ...k })) as SegmentConstants<F>;
    }

    for (const [name, value] of Object.entries(captured)) {
        if (name === 'x' || name === 'y' || name === 'angle' || name === 'distance' || name === 'time' || name === 'kBuilder' || !value) continue;
        const num = parseFloat(value);
        const parsed: unknown = isNaN(num) ? value.trim() : num;
        for (const k of constants) {
            if (name in k) (k as unknown as Record<string, unknown>)[name] = parsed;
        }
    }

    const parsedDistance = 'distance' in captured && captured.distance !== '' ? parseFloat(captured.distance) : undefined;
    const parsedTime = 'time' in captured && captured.time !== '' ? parseFloat(captured.time) : undefined;

    return {
        id: makeId(10),
        selected: false, disabled: false, locked: false, visible: true,
        format,
        kind,
        pose: { x, y, angle },
        constants,
        distance: parsedDistance !== undefined && !isNaN(parsedDistance) ? parsedDistance : 0,
        time: parsedTime !== undefined && !isNaN(parsedTime) ? parsedTime : 0,
    };
}

export const debugStore = createStore<boolean>(false);

SIM_CONSTANTS.seconds = 99;
let currentPathTime = -2 / 60;
let simComputed = 0;

export function convertPathToSim<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>>>(formatDef: FormatDef<F, Segs>, path: Path): SimFn[] {
    const auton: SimFn[] = [];
    DEBUG_printSimulationStart();
    currentPathTime = -2 / 60;

    for (let idx = 0; idx < path.segments.length; idx++) {
        const seg = path.segments[idx];
        const x = seg.pose.x ?? 0;
        const time = seg.time ?? 0;
        const y = seg.pose.y ?? 0;
        const angle = seg.pose.angle ?? 0;
        const k = seg.constants as typeof formatDef.constants;
        const kind = seg.kind as SegmentKind;

        const turn_pos = findPointToFace(path, idx);

        const segDef = formatDef.segments[kind];
        if (!segDef) continue;
        const resolvedSimDef = segDef.castTo ? (formatDef.segments[segDef.castTo] ?? segDef) : segDef;
        if (!resolvedSimDef.simFn) continue;
        const simFn = resolvedSimDef.simFn;

        let started = false;
        let targetDist = 0;

        switch (kind) {
            case "start":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        DEBUG_printRobotState(robot, dt);
                        const output = simFn(robot, dt, x, y, angle, k);
                        return [output, kind, 0];
                    }
                );
                break;
            case "wait":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = 999;
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = simFn(robot, dt, time, 0, 0, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
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
                        const output = simFn(robot, dt, x, y, angle, k);
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
                            targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), "fastest")!);
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = simFn(robot, dt, turn_pos.x, turn_pos.y, angle, k);
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
                            targetDist = Math.abs(angle_error(angle - robot.getAngle(), "fastest")!);
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = simFn(robot, dt, x, y, angle, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
                    }
                );
                break;

            case "strafeDrive":
            case "distanceDrive": {
                const segDistance = seg.distance ?? getSegmentDistance(path, idx) ?? 0;
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = Math.abs(segDistance);
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = simFn(robot, dt, segDistance, y, seg.pose.angle, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
                    }
                );
                break;
            }
        }
    }

    return auton;
}

function DEBUG_printSegmentStart<F extends Format>(idx: number, formatDef: FormatDef<F>, kind: SegmentKind) {
    if (!debugStore.getState()) return;
    console.log(`%cStarting ${formatDef.segments[kind]?.name} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd<F extends Format>(idx: number, formatDef: FormatDef<F>, kind: SegmentKind) {
    if (!debugStore.getState()) return;
    console.log(`%cEnding ${formatDef.segments[kind]?.name} ${idx}`, "color: #ff6b6b; font-weight: bold");
}

function DEBUG_printRobotState(robot: Robot, dt: number) {
    if (!debugStore.getState()) return;
    currentPathTime += dt;
    console.log(`%cx: ${robot.getX().toFixed(2)}, y: ${robot.getY().toFixed(2)}, θ: ${robot.getAngle().toFixed(2)} dt: ${currentPathTime.toFixed(2)}s`, "color: cyan");
}

function DEBUG_printSimulationStart() {
    if (!debugStore.getState()) return;
    simComputed += 1;
    console.log(`%cSTARTING SIMULATION COMPUTE #${simComputed}`, "color: violet; font-weight: bold");
}
