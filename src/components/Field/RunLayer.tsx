import { memo, useMemo } from "react";
import { computeSegmentXte, type SegmentXte } from "../../core/CrossTrackError";
import { recordedRunStore, samplesBySegment, type RunSample } from "../../core/RecordedRun";
import type { Path } from "../../core/Types/Path";
import { FIELD_REAL_DIMENSIONS, type Rectangle } from "../../core/Util";
import { getSegmentPointsInch } from "./FieldUtils";

/** Error that saturates the warm end of the trace colouring, per unit. Degrees and inches are
 *  nowhere near the same scale, so one shared number would paint every turn solid red. */
const FULL_SCALE = { in: 4, deg: 15 };
/** Draw one tie line per this many samples, so a 50 Hz run does not become a solid block. */
const TIE_EVERY = 5;

/** Motions whose error is an angle. Mirrors the turnKinds set ComputePathSim uses for telemetry. */
const TURN_KINDS = new Set(["pointTurn", "angleTurn", "angleSwing", "pointSwing"]);

/** The boomerang carrot trail. Distinct from both the planned blue and the error ramp. */
const CARROT_COLOR = "rgb(140,200,255)";

/** Painted under the trace so it reads against the field art rather than sinking into it. */
const HALO_COLOR = "rgb(10,10,12)";

/**
 * Low error is green, high error is magenta.
 *
 * The warm end deliberately avoids red: the field's own waypoint markers are red, and a red trace
 * running through them is unreadable exactly where the error is worst and you most need to see it.
 */
function errorColor(magnitude: number, units: string): string {
    const t = Math.min(magnitude / (units === "deg" ? FULL_SCALE.deg : FULL_SCALE.in), 1);
    const r = Math.round(60 + t * 195);
    const g = Math.round(220 - t * 175);
    const b = Math.round(120 + t * 45);
    return `rgb(${r},${g},${b})`;
}

type RunLayerProps = {
    path: Path;
    img: Rectangle;
    visible: boolean;
};

/**
 * Draws an imported run over the planned path.
 *
 * The error plotted is whatever the run reported for itself: when the log carries the motion
 * algorithm's own cross-track error that is used untouched, and the geometric fallback only runs
 * for a log that has none. The two are not interchangeable, so the source is surfaced rather than
 * hidden - see CrossTrackError.ts.
 */
export default memo(function RunLayer({ path, img, visible }: RunLayerProps) {
    const run = recordedRunStore.useStore();

    const grouped = useMemo<RunSample[][]>(
        () => run === null ? [] : samplesBySegment(run),
        [run],
    );

    const segments = useMemo<SegmentXte[]>(() => {
        return grouped.map((samples, idx) => {
            // The log counts motions from 0, but path.segments[0] is the start pose, which the robot
            // never drives. The first logged motion is therefore path segment 1.
            const pathIdx = idx + 1;
            const reference = getSegmentPointsInch(pathIdx, path) ?? [];
            // Units decide the colour scale and keep the run summary's two halves apart, so they
            // have to come from what the motion actually is, not from a default.
            const kind = path.segments[pathIdx]?.kind;
            const isTurn = kind !== undefined && TURN_KINDS.has(kind);

            // A turn's heading error is logged, but mikGen does not consume it: the app already
            // presents turn progress in its own terms, and a second angular number competing with
            // that is noise. The column stays in the file as extra data for whoever wants it.
            if (isTurn) return computeSegmentXte([], reference, "deg");

            return computeSegmentXte(samples, reference, "in");
        });
    }, [grouped, path]);

    /**
     * The worst positional sample, ringed on the field. Angular segments are skipped rather than
     * compared: a turn's degrees would outrank every drive's inches and put the marker on a motion
     * that never left the path.
     */
    const worst = useMemo(() => {
        let found: { x: number, y: number } | null = null;
        let seen = -1;
        for (const seg of segments) {
            if (seg.units === "deg") continue;
            for (const p of seg.points) {
                const abs = Math.abs(p.e);
                if (abs > seen) { seen = abs; found = { x: p.x, y: p.y }; }
            }
        }
        return seen > 0 ? found : null;
    }, [segments]);

    if (!visible || run === null) return null;

    // Same inch -> pixel mapping PathLayer uses, so both layers stay locked together while panning
    const sx = img.w / FIELD_REAL_DIMENSIONS.w;
    const sy = img.h / FIELD_REAL_DIMENSIONS.h;
    const tx = img.x - sx * FIELD_REAL_DIMENSIONS.x;
    const ty = img.y + sy * FIELD_REAL_DIMENSIONS.y;
    const transform = `translate(${tx},${ty}) scale(${sx},${-sy})`;

    // Strokes live inside the inch-space group, so a width here is inches on the field and stays
    // the same real size at every zoom level, which is what makes the trace readable when zoomed out
    const traceWidth = 0.45;
    // A dark casing rather than a wider line: it separates the trace from whatever it crosses
    // without making the trace itself any heavier
    const haloWidth = traceWidth + 0.32;

    return (
        <g transform={transform}>
            {/* What a boomerang was steering at. Only present where the log carried it, which is
                only while drive_to_pose was running. */}
            {grouped.map((samples, idx) => {
                const pts = samples.filter(sm => sm.carrot !== undefined && sm.moving);
                if (pts.length < 2) return null;
                return (
                    <polyline
                        key={`carrot-${idx}`}
                        points={pts.map(sm => `${sm.carrot!.x},${sm.carrot!.y}`).join(" ")}
                        fill="none"
                        stroke={CARROT_COLOR}
                        strokeWidth={traceWidth * 0.55}
                        strokeDasharray={`${traceWidth} ${traceWidth}`}
                        opacity={0.85}
                    />
                );
            })}

            {/* One casing per segment, so this costs a single element rather than one per sample.
                Turns are skipped throughout: the robot does not move during one, so it would draw
                as a single saturated dot on top of the corner it is turning at. Its heading error
                still counts towards the run summary. */}
            {segments.map((seg, idx) => seg.points.length < 2 || seg.units === "deg" ? null : (
                <polyline
                    key={`halo-${idx}`}
                    points={seg.points.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={HALO_COLOR}
                    strokeWidth={haloWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.55}
                />
            ))}

            {segments.map((seg, idx) => seg.units === "deg" ? null : (
                <g key={`run-seg-${idx}`}>
                    {/* Tie lines first so the trace draws on top of them */}
                    {seg.points.map((p, i) =>
                        i % TIE_EVERY !== 0 || p.rx === undefined || p.ry === undefined ? null : (
                            <line
                                key={`tie-${i}`}
                                x1={p.x} y1={p.y} x2={p.rx} y2={p.ry}
                                stroke={errorColor(Math.abs(p.e), seg.units)}
                                strokeWidth={traceWidth * 0.4}
                                opacity={0.65}
                            />
                        )
                    )}

                    {seg.points.slice(1).map((p, i) => {
                        const prev = seg.points[i];
                        return (
                            <line
                                key={`trace-${i}`}
                                x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
                                stroke={errorColor(Math.abs(p.e), seg.units)}
                                strokeWidth={traceWidth}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>
            ))}

            {worst !== null && (
                <g>
                    {/* White, not the path's hover red: the marker has to be legible sitting on
                        top of a red waypoint, which is often exactly where the worst sample is */}
                    <circle
                        cx={worst.x} cy={worst.y}
                        r={traceWidth * 3}
                        fill="none"
                        stroke={HALO_COLOR}
                        strokeWidth={traceWidth * 1.1}
                        opacity={0.55}
                    />
                    <circle
                        cx={worst.x} cy={worst.y}
                        r={traceWidth * 3}
                        fill="none"
                        stroke="rgb(245,245,250)"
                        strokeWidth={traceWidth * 0.55}
                    />
                </g>
            )}
        </g>
    );
});
