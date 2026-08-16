import type { Robot } from "../core/Robot";
import { distanceToPosition, getSegmentDistance, type Path } from "../core/Types/Path";
import { findPointToFace, makeId, roundOff, toDeg } from "../core/Util";
import type { Segment } from "../core/Types/Segment";
import { createControlPoint, type ControlPoint } from "../core/Types/Pose";
import { polylineLength, resolveBezier, sampleBezier } from "../core/Types/Bezier";
import { getDefaultConstants, type Format } from "./FormatDefinition";
import type { FormatDef, SegmentConstants, SegmentDef, SegmentKind, SimFn } from "./FormatDefinition";
import { angle_error } from "./mikLibSim/Util";
import { createStore } from "../core/Store";


/** Template placeholders that carry a bare number, so they parse back as one. */
const COORD_PLACEHOLDERS = new Set(['x', 'y', 'angle', 'distance', 'time', 'c1x', 'c1y', 'c2x', 'c2y']);

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

        if (kind === "bezierCurve") {
            // Always emitted as a cubic, so a segment with fewer controls is degree elevated first
            const bezier = resolveBezier(path, idx);
            line = line
                .replace(/\$\{c1x\}/g, roundOff(bezier?.c1.x, 2))
                .replace(/\$\{c1y\}/g, roundOff(bezier?.c1.y, 2))
                .replace(/\$\{c2x\}/g, roundOff(bezier?.c2.x, 2))
                .replace(/\$\{c2y\}/g, roundOff(bezier?.c2.y, 2));
        }

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

    const lines = pathString.split('\n').map(l => l.trim().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'));

    let i = 0;
    while (i < lines.length) {
        if (!lines[i]) { i++; continue; }

        let matched = false;
        for (const [kind, segDef] of Object.entries(formatDef.segments) as [SegmentKind, SegmentDef<F>][]) {
            if (!segDef || segDef.castTo || !segDef.toStringTemplate) continue;
            const templateLineCount = segDef.toStringTemplate.split('\n').length;
            const chunk = lines.slice(i, i + templateLineCount).join('\n');
            const seg = parseSegmentLine(chunk, kind, segDef, formatDef, format);
            if (seg) {
                segments.push(seg);
                i += templateLineCount;
                matched = true;
                break;
            }
        }
        if (!matched) i++;
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
        return COORD_PLACEHOLDERS.has(name) ? '__COORD__' : '__FIELD__';
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

    const defaults = getDefaultConstants(formatDef as unknown as FormatDef<Format>, format, kind) as SegmentConstants<F>;
    let constants: SegmentConstants<F>;
    if (formatDef.kParser) {
        const [parsedConstants, poseOverride] = formatDef.kParser(defaults, captured.kBuilder ?? '', kind);
        constants = parsedConstants;
        if (poseOverride?.angle !== undefined) angle = poseOverride.angle;
    } else {
        constants = defaults.map(k => ({ ...k })) as SegmentConstants<F>;
    }

    for (const [name, value] of Object.entries(captured)) {
        if (COORD_PLACEHOLDERS.has(name) || name === 'kBuilder' || !value) continue;
        const num = parseFloat(value);
        const parsed: unknown = isNaN(num) ? value.trim() : num;
        // ${idx:key} placeholders address one constants group by position instead of broadcasting by key
        const indexed = name.match(/^(\d+):(\w+)$/);
        if (indexed) {
            const group = constants[Number(indexed[1])] as unknown as Record<string, unknown> | undefined;
            if (group && indexed[2] in group) group[indexed[2]] = parsed;
            continue;
        }
        for (const k of constants) {
            if (name in k) (k as unknown as Record<string, unknown>)[name] = parsed;
        }
    }

    const parsedDistance = 'distance' in captured && captured.distance !== '' ? parseFloat(captured.distance) : undefined;
    const parsedTime = 'time' in captured && captured.time !== '' ? parseFloat(captured.time) : undefined;

    const num = (key: string) => {
        const parsed = key in captured ? parseFloat(captured[key]) : NaN;
        return isNaN(parsed) ? null : parsed;
    };
    const controls: ControlPoint[] = [];
    if (kind === "bezierCurve") {
        for (const [cx, cy] of [['c1x', 'c1y'], ['c2x', 'c2y']]) {
            const px = num(cx);
            const py = num(cy);
            if (px !== null && py !== null) controls.push(createControlPoint(px, py));
        }
    }

    return {
        id: makeId(10),
        selected: false, disabled: false, locked: false, visible: true,
        format,
        kind,
        pose: { x, y, angle },
        constants,
        controls,
        distance: parsedDistance !== undefined && !isNaN(parsedDistance) ? parsedDistance : 0,
        time: parsedTime !== undefined && !isNaN(parsedTime) ? parsedTime : 0,
    };
}

export const debugStore = createStore<boolean>(false);

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
        const simReset = resolvedSimDef.simReset;

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
                            simReset?.();
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
                            simReset?.();
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
                            simReset?.();
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
                            simReset?.();
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

            case "bezierCurve": {
                const bezier = resolveBezier(path, idx);
                if (bezier === null) break;
                const points = sampleBezier(bezier, 400);
                const arcLength = polylineLength(points);
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            simReset?.();
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = arcLength;
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        // A commanded heading is what the follower lands on; null leaves it on the exit tangent
                        const output = simFn(robot, dt, x, y, seg.pose.angle, k, points);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, kind, targetDist];
                    }
                );
                break;
            }

            case "strafeDrive":
            case "distanceDrive": {
                const segDistance = seg.distance ?? getSegmentDistance(path, idx) ?? 0;
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            simReset?.();
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
