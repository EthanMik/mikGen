import type { SegmentKind } from "../simulation/FormatDefinition";
import type { Robot } from "./Robot";
import { createStore } from "./Store";
import { normalizeDeg } from "./Util";

// dt is the robot's fixed 10ms control tick. precomputePath rewrites it from getControlDt so the
// playback code stays in step.
export const SIM_CONSTANTS = {
    seconds: 99,
    dt: 0.01,
    dt_ms: 10,
};

export interface SegmentTelemetry {
    totalTime: number,
    totalDistance: number,
    progressRaw: number,
    progressPercent: number,
    units: string,
}

export const pathTelemetry = createStore<SegmentTelemetry[]>([]);

export interface Snapshot {
    t: number,
    x: number,
    y: number,
    angle: number,
}

export interface EndSnapShot {
    x: number,
    y: number,
    angle: number
}

export interface SegmentTimeRange {
    startT: number,
    endT: number,
}

export interface PathSim {
    totalTime: number,
    trajectory: Snapshot[];
    endTrajectory: EndSnapShot[];
    segmentTrajectorys: Snapshot[][];
    segmentCumulativeDists: number[][];
    segmentTimeRanges: SegmentTimeRange[];
    timeOffset: number;
}

export const activeSimSegmentStore = createStore<number>(-1);
export const simJumpStore = createStore<number | null>(null);

export const computedPathStore = createStore<PathSim>({
    totalTime: 0,
    trajectory: [],
    endTrajectory: [],
    segmentTrajectorys: [],
    segmentCumulativeDists: [],
    segmentTimeRanges: [],
    timeOffset: 0,
});

export function activeSegmentAtTime(path: PathSim, t: number): number {
    return path.segmentTimeRanges.findIndex(r => t >= r.startT && t < r.endT);
}

export function precomputePath(
    robot: Robot,
    auton: ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[],
): PathSim
{
    const simLengthSeconds = SIM_CONSTANTS.seconds;

    let autoIdx = 0;
    const trajectory: Snapshot[] = [];
    const endTrajectory: EndSnapShot[] = [];
    const segmentTrajectory: Snapshot[] = [];
    const segmentTrajectorys: Snapshot[][] = [];
    const segmentKinds: SegmentKind[] = [];
    const segmentTargetDists: number[] = [];
    const segmentTimeRanges: SegmentTimeRange[] = [];

    const dt = robot.getControlDt();
    SIM_CONSTANTS.dt = dt;
    SIM_CONSTANTS.dt_ms = dt * 1000;

    let t = 0;
    let segmentStartT = 0;
    let safetyIter = 0;
    const maxIter = Math.ceil(simLengthSeconds / dt);

    while (safetyIter < maxIter) {

        if (autoIdx < auton.length) {
            const before = robot.getTime();
            const [done, kind, targetDist] = auton[autoIdx](robot, dt);
            if (done) {
                endTrajectory.push({
                    x: robot.getTrueX(),
                    y: robot.getTrueY(),
                    angle: robot.getTrueAngle(),
                });

                segmentTrajectorys.push([...segmentTrajectory]);
                segmentKinds.push(kind);
                segmentTargetDists.push(targetDist);
                segmentTimeRanges.push({ startT: segmentStartT, endT: t });
                segmentStartT = t;
                segmentTrajectory.length = 0;
                autoIdx++
            }

            // Ticks that never drove the robot advance by dt
            const stepped = robot.getTime() - before;

            if (autoIdx >= auton.length) break;

            // Snapshots record the true pose: the controller may believe the sensed one, but the
            // field shows where the robot really is
            segmentTrajectory.push({
                t,
                x: robot.getTrueX(),
                y: robot.getTrueY(),
                angle: robot.getTrueAngle(),
            });

            trajectory.push({
                t,
                x: robot.getTrueX(),
                y: robot.getTrueY(),
                angle: robot.getTrueAngle(),
            });

            t += stepped > 1e-9 ? stepped : dt;
        } else break;

        safetyIter++;
    }

    const turnKinds = new Set<SegmentKind>(["pointTurn", "angleTurn", "angleSwing", "pointSwing"]);

    function shortAngleDiff(a: number, b: number): number {
        let d = normalizeDeg(b - a);
        if (d > 180) d -= 360;
        return Math.abs(d);
    }

    const segmentCumulativeDists: number[][] = [];

    const telemetry: SegmentTelemetry[] = segmentTrajectorys.map((seg, i) => {
        const kind = segmentKinds[i];
        const isTurn = turnKinds.has(kind);
        const totalDistance = segmentTargetDists[i] ?? 0;

        if (seg.length === 0) {
            segmentCumulativeDists.push([]);
            return { totalTime: 0, totalDistance, progressRaw: 0, progressPercent: 0, units: isTurn ? "deg" : "in" };
        }

        const totalTime = seg[seg.length - 1].t - seg[0].t;

        const cumDist: number[] = [0];
        for (let j = 1; j < seg.length; j++) {
            let step: number;
            if (isTurn) {
                step = shortAngleDiff(seg[j - 1].angle, seg[j].angle);
            } else {
                const dx = seg[j].x - seg[j - 1].x;
                const dy = seg[j].y - seg[j - 1].y;
                step = Math.sqrt(dx * dx + dy * dy);
            }
            cumDist.push(cumDist[j - 1] + step);
        }
        segmentCumulativeDists.push(cumDist);

        const progressRaw = cumDist[cumDist.length - 1];
        const progressPercent = totalDistance > 0 ? Math.min((progressRaw / totalDistance) * 100, 100) : 100;

        return {
            totalTime,
            totalDistance,
            progressRaw,
            progressPercent,
            units: isTurn ? "deg" : "in",
        };
    });

    pathTelemetry.setState(telemetry);

    return {totalTime: t, trajectory, endTrajectory, segmentTrajectorys, segmentCumulativeDists, segmentTimeRanges, timeOffset: 0};
}
