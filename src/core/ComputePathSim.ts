import type { Robot } from "./Robot";
import { createStore } from "./Store";
import type { SegmentKind } from "./Types/Segment";
import { normalizeDeg } from "./Util";

export const SIM_CONSTANTS = {
    seconds: 99,
    dt: 1/60, // Sim is run at 60 hertz
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

export interface PathSim {
    totalTime: number,
    trajectory: Snapshot[];
    endTrajectory: EndSnapShot[];
    segmentTrajectorys: Snapshot[][];
    segmentCumulativeDists: number[][];
    timeOffset: number;
}

export const activeSimSegmentStore = createStore<number>(-1);

export const computedPathStore = createStore<PathSim>({
    totalTime: 0,
    trajectory: [],
    endTrajectory: [],
    segmentTrajectorys: [],
    segmentCumulativeDists: [],
    timeOffset: 0,
});

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

    const dt = SIM_CONSTANTS.dt;

    let t = 0;
    let safetyIter = 0;
    const maxIter = 60 * simLengthSeconds;

    while (safetyIter < maxIter) {

        if (autoIdx < auton.length) {
            const [done, kind, targetDist] = auton[autoIdx](robot, dt);
            if (done) {
                endTrajectory.push({
                    x: robot.getX(),
                    y: robot.getY(),
                    angle: robot.getAngle(),
                });

                segmentTrajectorys.push([...segmentTrajectory]);
                segmentKinds.push(kind);
                segmentTargetDists.push(targetDist);
                segmentTrajectory.length = 0;
                autoIdx++
            }

        }

        if (autoIdx >= auton.length) {
            if (Math.abs(robot.getXVelocity()) < 0.01 && Math.abs(robot.getYVelocity()) < 0.01) break;
            robot.tankDrive(0, 0, dt);
        }

        segmentTrajectory.push({
            t,
            x: robot.getX(),
            y: robot.getY(),
            angle: robot.getAngle(),
        });

        trajectory.push({
            t,
            x: robot.getX(),
            y: robot.getY(),
            angle: robot.getAngle(),
        });

        t += dt;
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

    return {totalTime: t, trajectory, endTrajectory, segmentTrajectorys, segmentCumulativeDists, timeOffset: 0};
}
