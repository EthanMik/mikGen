import type { Robot } from "../core/Robot";
import { distanceToPosition, getBackwardsSnapPose, getSegmentDistance, type Path } from "../core/Types/Path";
import { findPointToFace, makeId, resolveTurnPose, roundOff, toDeg } from "../core/Util";
import type { Segment } from "../core/Types/Segment";
import { createControlPoint, type ControlPoint } from "../core/Types/Pose";
import type { Coordinate } from "../core/Types/Coordinate";
import { fitCubic, polylineLength, resamplePolyline, resolveBezier, sampleBezier } from "../core/Types/Bezier";
import { getDefaultConstants, type Format } from "./FormatDefinition";
import type { FormatDef, SegmentConstants, SegmentDef, SegmentKind, SimFn } from "./FormatDefinition";
import { angle_error } from "./mikLibSim/Util";
import { createStore } from "../core/Store";


/** Template placeholders that carry a bare number, so they parse back as one. */
const COORD_PLACEHOLDERS = new Set(['x', 'y', 'angle', 'distance', 'time', 'c1x', 'c1y', 'c2x', 'c2y']);

/** Matches `${points}` or `${points:10}`, where the number is point spacing in inches. */
const POINTS_PLACEHOLDER = /\$\{points(?::([\d.]+))?\}/;

/** Spacing used by a bare `${points}`, in inches. */
const DEFAULT_POINT_SPACING = 5;

/** How many lines a single point block is allowed to span before parsing gives up on it. */
const MAX_POINT_BLOCK_LINES = 512;

/**
 * Point spacing in inches for a template that expands a curve into a waypoint vector, or null
 * when it does not. Codegen and the simulator both read density through here, so the preview
 * follows exactly the waypoints the exported code will.
 */
export function pointSpacing(template: string | undefined): number | null {
    const match = template?.match(POINTS_PLACEHOLDER);
    if (!match) return null;
    const spacing = match[1] === undefined ? DEFAULT_POINT_SPACING : parseFloat(match[1]);
    return Number.isFinite(spacing) && spacing > 0 ? spacing : DEFAULT_POINT_SPACING;
}

/**
 * Renders one point of a `${points:N}` expansion.
 *
 * Points that carry no heading lose the whole `${angle}` term rather than leaving a hole behind,
 * mirroring how an empty `${kBuilder}` takes its leading comma with it. That way a single point
 * template covers `{{x_in, y_in}, fwd, 110}` and `{{x_in, y_in, 45_deg}, fwd, 110}` both.
 */
function renderPoint(
    pointTemplate: string,
    point: Coordinate,
    angle: number | null,
    mergedK: Record<string, unknown>,
    k: readonly unknown[],
): string {
    let line = angle === null
        ? pointTemplate.replace(/,\s*[^,{}]*\$\{angle\}[^,{}]*/, '')
        : pointTemplate.replace(/\$\{angle\}/g, roundOff(angle, 2));

    line = line
        .replace(/\$\{x\}/g, roundOff(point.x, 2))
        .replace(/\$\{y\}/g, roundOff(point.y, 2));

    for (const key of Object.keys(mergedK)) {
        line = line.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(mergedK[key]));
    }

    return line.replace(/\$\{(\d+):(\w+)\}/g, (_, idxStr, key) => {
        const group = k[Number(idxStr)] as Record<string, unknown> | undefined;
        return group && key in group ? String(group[key]) : '';
    });
}

/** The kinds that face a coordinate, and so read their target and offset off turnPose. */
const isPointBased = (kind: SegmentKind): boolean => kind === "pointTurn" || kind === "pointSwing";

/**
 * Decides which pasted point turns keep the coordinate their code named. A turn whose target is
 * already what the path derives stays unlocked and goes on tracking; one that names anything else
 * has to be locked or the aim its code asked for is lost on the next export.
 *
 * Deliberately compares against `findPointToFace` rather than `resolveTurnPose`: the latter falls
 * back to the segment's own stored coordinate, which here *is* the parsed value, so nothing would
 * ever look like a mismatch. Rounding both sides to the 2 places codegen emits makes this exactly
 * the "would a re-export change the text" test.
 */
export function applyTurnLocks(path: Path, from: number, to: number): Segment[] {
    const segments = [...path.segments];
    for (let i = from; i < to; i++) {
        const seg = segments[i];
        if (!isPointBased(seg.kind)) continue;
        const { x, y } = seg.turnPose;
        if (x === null || y === null) continue;

        const auto = findPointToFace({ ...path, segments }, i);
        if (roundOff(auto.x, 2) !== roundOff(x, 2) || roundOff(auto.y, 2) !== roundOff(y, 2)) {
            segments[i] = { ...seg, turnLocked: true };
        }
    }
    return segments;
}

export function convertPathToString<F extends Format, Segs extends Partial<Record<SegmentKind, SegmentDef<F>>>>(formatDef: FormatDef<F, Segs>, path: Path, selected = false): string {
    let pathString = '';

    for (let idx = 0; idx < path.segments.length; idx++) {
        const seg = path.segments[idx];

        if (selected && !seg.selected) continue;

        // A point turn keeps its target and offset on turnPose; its own pose carries nothing
        const facing = isPointBased(seg.kind) ? resolveTurnPose(path, idx) : seg.pose;
        const x = roundOff(facing.x, 2);
        const y = roundOff(facing.y, 2);
        const angle = roundOff(facing.angle, 2);
        const rawDistance = seg.kind === "distanceDrive" ? (seg.distance ?? getSegmentDistance(path, idx)) : seg.distance;
        const distance = roundOff(rawDistance, 2);
        const time = roundOff(seg.time, 0);
        const k = seg.constants as typeof formatDef.constants;
        const kind = seg.kind as SegmentKind;
        const segDef = formatDef.segments[kind];

        if (!segDef) continue;
        const resolvedDef = segDef.castTo ? (formatDef.segments[segDef.castTo] ?? segDef) : segDef;
        if (!resolvedDef.toStringTemplate) continue;

        const mergedK: Record<string, unknown> = Object.assign({}, ...k);
        const kBuilderStr = formatDef.kBuilder ? formatDef.kBuilder(resolvedDef.defaults ?? formatDef.constants, k, facing, kind) : "";

        let line = resolvedDef.toStringTemplate
            .replace(/\$\{x\}/g, x)
            .replace(/\$\{y\}/g, y)
            .replace(/\$\{angle\}/g, angle)
            .replace(/\$\{distance\}/g, distance)
            .replace(/\$\{time\}/g, time);

        let bezier = null;
        if (kind === "bezierCurve") {
            // Always emitted as a cubic, so a segment with fewer controls is degree elevated first
            bezier = resolveBezier(path, idx);
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

        // Expanded last, once every other placeholder has resolved, so the continuation lines can
        // be indented to where the vector actually starts rather than to where its placeholder was
        const spacing = pointSpacing(resolvedDef.toStringTemplate);
        if (spacing !== null && resolvedDef.pointTemplate && bezier) {
            const waypoints = resamplePolyline(sampleBezier(bezier, 400), spacing);
            const column = line.split('\n').find(l => POINTS_PLACEHOLDER.test(l))?.search(POINTS_PLACEHOLDER) ?? 0;
            const block = waypoints
                // A heading lands on the last point only: that is the one EZ boomerangs onto
                .map((point, i) => renderPoint(
                    resolvedDef.pointTemplate!,
                    point,
                    i === waypoints.length - 1 ? facing.angle : null,
                    mergedK,
                    k,
                ))
                .join(',\n' + ' '.repeat(column));
            line = line.replace(POINTS_PLACEHOLDER, block);
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

export function convertStringToPath<F extends Format>(
    formatDef: FormatDef<F>,
    format: F,
    pathString: string
): Segment[] {
    const segments: Segment[] = [];

    const lines = pathString.split('\n').map(l => l.trim().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'));

    /** Waypoints parsed out of a point block, awaiting the fit that needs the preceding segment. */
    const pendingPoints = new Map<number, Coordinate[]>();

    let i = 0;
    while (i < lines.length) {
        if (!lines[i]) { i++; continue; }

        let matched = false;
        for (const [kind, segDef] of Object.entries(formatDef.segments) as [SegmentKind, SegmentDef<F>][]) {
            if (!segDef || segDef.castTo || !segDef.toStringTemplate) continue;
            const templateLineCount = segDef.toStringTemplate.split('\n').length;

            // A point block is variable length, so the chunk grows a line at a time until the
            // template matches. Smallest-first, so the shortest valid block wins and a run of
            // them cannot be swallowed as one.
            const maxLineCount = pointSpacing(segDef.toStringTemplate) === null
                ? templateLineCount
                : Math.min(lines.length - i, templateLineCount + MAX_POINT_BLOCK_LINES);

            for (let lineCount = templateLineCount; lineCount <= maxLineCount; lineCount++) {
                const chunk = lines.slice(i, i + lineCount).join('\n');
                const parsed = parseSegmentLine(chunk, kind, segDef, formatDef, format);
                if (!parsed) continue;

                if (parsed.points) pendingPoints.set(segments.length, parsed.points);
                segments.push(parsed.seg);
                i += lineCount;
                matched = true;
                break;
            }
            if (matched) break;
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

    // Runs last: a curve's start is the segment in front of it, which only exists once every
    // line has been parsed and any distance drive has been resolved to a coordinate
    for (const [idx, points] of pendingPoints) {
        const seg = segments[idx];
        if (seg.pose.x === null || seg.pose.y === null) continue;
        const startPose = getBackwardsSnapPose({ name: "", segments }, idx - 1);
        if (startPose === null || startPose.x === null || startPose.y === null) continue;

        const [c1, c2] = fitCubic(
            { x: startPose.x, y: startPose.y },
            { x: seg.pose.x, y: seg.pose.y },
            points,
        );
        segments[idx] = { ...seg, controls: [createControlPoint(c1.x, c1.y), createControlPoint(c2.x, c2.y)] };
    }

    return segments;
}

export function templateToRegex(template: string, anchored = true): { regex: RegExp; groups: string[] } {
    const groups: string[] = [];
    const hasOptKBuilder = template.includes(', ${kBuilder}');
    let t = template.replace(', ${kBuilder}', '__KBUILDER_OPT__');

    t = t.replace(/\$\{([^}]+)\}/g, (_, name: string) => {
        // A point block is variable length and spans lines, so it gets its own class and a
        // normalized group name; the `:N` spacing only matters to codegen
        if (/^points(?::[\d.]+)?$/.test(name)) {
            groups.push('points');
            return '__POINTS__';
        }
        groups.push(name);
        return COORD_PLACEHOLDERS.has(name) ? '__COORD__' : '__FIELD__';
    });

    t = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (hasOptKBuilder) {
        groups.push('kBuilder');
        t = t.replace('__KBUILDER_OPT__', '(?:, (.+))?');
    }
    t = t.replace(/__COORD__/g, '(-?[\\d.]+)');
    // Greedy: the block's own text is full of the same punctuation that closes it, so matching
    // backwards from the end of the chunk finds the real terminator far faster than forwards.
    // Chunks are grown smallest-first, so this cannot swallow a following segment.
    t = t.replace(/__POINTS__/g, '([\\s\\S]+)');
    t = t.replace(/__FIELD__/g, '([^,)]+?)');

    // Unanchored is for matching one entry inside a larger block, where the surrounding text is
    // the rest of the vector rather than the end of the line
    return { regex: new RegExp(anchored ? `^\\s*${t}\\s*$` : t), groups };
}

/**
 * Pulls the coordinates out of an expanded point block, ignoring everything wrapped around them.
 * Deliberately loose about the surrounding syntax: the point template is user editable, so the
 * only thing that can be relied on is a pair of numbers with an optional unit suffix, optionally
 * followed by a heading on the point that carries one.
 */
function parsePointBlock(block: string): { points: Coordinate[]; endAngle: number | null } {
    const points: Coordinate[] = [];
    let endAngle: number | null = null;

    const pointRegex = /\{\s*(-?[\d.]+)\s*\w*\s*,\s*(-?[\d.]+)\s*\w*\s*(?:,\s*(-?[\d.]+)\s*\w*\s*)?\}/g;
    for (const match of block.matchAll(pointRegex)) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
        endAngle = match[3] !== undefined ? parseFloat(match[3]) : null;
    }

    return { points, endAngle };
}

function parseSegmentLine<F extends Format>(
    line: string,
    kind: SegmentKind,
    segDef: SegmentDef<F>,
    formatDef: FormatDef<F>,
    format: F
): { seg: Segment; points?: Coordinate[] } | null {
    if (!segDef.toStringTemplate) return null;
    const { regex, groups } = templateToRegex(segDef.toStringTemplate);
    const match = line.match(regex);
    if (!match) return null;

    const captured: Record<string, string> = {};
    groups.forEach((name, i) => { captured[name] = match[i + 1] ?? ''; });

    // A point block stands in for the coordinates the template would otherwise name directly:
    // the curve ends on the last waypoint, and a heading there is the pose it boomerangs onto
    let blockPoints: Coordinate[] | undefined;
    if ('points' in captured) {
        const { points, endAngle } = parsePointBlock(captured.points);
        if (points.length === 0) return null;

        // Constants written into each point, like direction and speed, are only named by the
        // point template, so the outer match never sees them. They are the same on every entry,
        // so matching the first one recovers them for the constants pass below.
        if (segDef.pointTemplate) {
            const interior = segDef.pointTemplate.replace(/,\s*[^,{}]*\$\{angle\}[^,{}]*/, '');
            const { regex: pointRegex, groups: pointGroups } = templateToRegex(interior, false);
            const pointMatch = captured.points.match(pointRegex);
            if (pointMatch) {
                pointGroups.forEach((name, i) => {
                    if (COORD_PLACEHOLDERS.has(name) || name in captured) return;
                    captured[name] = pointMatch[i + 1] ?? '';
                });
            }
        }

        const end = points[points.length - 1];
        captured.x = String(end.x);
        captured.y = String(end.y);
        if (endAngle !== null) captured.angle = String(endAngle);
        blockPoints = points;
    }

    const pointBased = isPointBased(kind);
    const capturedX = 'x' in captured ? parseFloat(captured.x) : null;
    const capturedY = 'y' in captured ? parseFloat(captured.y) : null;
    // A point turn's captured coordinate is its target, not a position, so it lands on turnPose
    const x = pointBased ? null : capturedX;
    const y = pointBased ? null : capturedY;
    let angle: number | null = 'angle' in captured ? parseFloat(captured.angle) : null;
    // ReveilLib is the one format that emits the offset in the ${angle} slot
    let turnAngle = pointBased ? (angle ?? 0) : 0;
    if (pointBased) angle = null;

    const defaults = getDefaultConstants(formatDef as unknown as FormatDef<Format>, format, kind) as SegmentConstants<F>;
    let constants: SegmentConstants<F>;
    if (formatDef.kParser) {
        const [parsedConstants, poseOverride] = formatDef.kParser(defaults, captured.kBuilder ?? '', kind);
        constants = parsedConstants;
        if (poseOverride?.angle != null) {
            if (pointBased) turnAngle = poseOverride.angle;
            else angle = poseOverride.angle;
        }
    } else {
        constants = defaults.map(k => ({ ...k })) as SegmentConstants<F>;
    }

    for (const [name, value] of Object.entries(captured)) {
        if (COORD_PLACEHOLDERS.has(name) || name === 'kBuilder' || name === 'points' || !value) continue;
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
        seg: {
            id: makeId(10),
            selected: false, disabled: false, visible: true,
            format,
            kind,
            pose: { x, y, angle },
            turnPose: { x: pointBased ? capturedX : 0, y: pointBased ? capturedY : 0, angle: turnAngle },
            // The pasted coordinate may or may not be one the path derives; paste decides (applyTurnLocks)
            turnLocked: false,
            constants,
            controls,
            distance: parsedDistance !== undefined && !isNaN(parsedDistance) ? parsedDistance : 0,
            time: parsedTime !== undefined && !isNaN(parsedTime) ? parsedTime : 0,
        },
        points: blockPoints,
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

        // Only a point turn has a target, and its offset lives there too rather than on pose.angle
        const turn = isPointBased(kind) ? resolveTurnPose(path, idx) : null;

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
                            const targetAngle = toDeg(Math.atan2(turn!.x - robot.getX(), turn!.y - robot.getY())) + turn!.angle;
                            targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), "fastest")!);
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = simFn(robot, dt, turn!.x, turn!.y, turn!.angle, k);
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
                const dense = sampleBezier(bezier, 400);
                const arcLength = polylineLength(dense);
                // A format that exports a waypoint vector is simulated on that same vector, at the
                // spacing its own template asks for, so the preview shows what the robot will get
                // rather than a curve the generated code never mentions
                const spacing = pointSpacing(resolvedSimDef.toStringTemplate);
                const points = spacing === null ? dense : resamplePolyline(dense, spacing);
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
