import { Component, memo, useMemo, useState, type ReactNode } from "react";
import { computedPathStore } from "../../core/ComputePathSim";
import { recordedRunStore, type RecordedRun } from "../../core/RecordedRun";
import { buildRunDots, errorAgainstPrecisePath, nearestRunDot, RUN_DOT_RADIUS, RUN_DOT_SPACING, runDotColor, type RunDot } from "../../core/RunDots";
import { clearRun, runLoadErrorStore } from "../../core/RunStore";
import { FIELD_REAL_DIMENSIONS, toInch, toPX, toRGB, type Rectangle } from "../../core/Util";
import { fileFormatStore } from "../../hooks/useFileFormat";
import { FIELD_COLORS } from "./FieldColors";
import { pointerToSvg } from "./FieldUtils";

/** The run's colours: purple when slow, blue in the middle, white at top speed. */
const RUN_SLOW_RGB = toRGB(FIELD_COLORS.runSlowColor);
const RUN_MID_RGB = toRGB(FIELD_COLORS.runMedColor);
const RUN_FAST_RGB = toRGB(FIELD_COLORS.runFastColor);

/**
 * The run's dots. Laid out and coloured with the same spacing, radius and colour ramp as the
 * precise path, mirrored in RunDots.ts; only the palette differs. Memoized for the same reason the
 * precise path's dots are: a long run is thousands of circles that would otherwise be rebuilt on
 * every pan frame.
 */
const RunDotCircles = memo(function RunDotCircles({ dots }: { dots: RunDot[] }) {
    return (
        <>
            {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={RUN_DOT_RADIUS} fill={runDotColor(d.t, RUN_SLOW_RGB, RUN_MID_RGB, RUN_FAST_RGB)} />
            ))}
        </>
    );
});

/** How close, in field inches, the pointer must be to a dot for the readout to latch onto it. */
const HOVER_RADIUS_IN = 3;

type RunLayerProps = {
    img: Rectangle;
    visible: boolean;
    /** Whether hovering the run shows the cross track error readout. */
    errorOnHover: boolean;
};

/** The hovered dot, and its cross track error against the precise path, or null with no path open. */
type Hover = { dot: RunDot, error: number | null };

/** "1.23 in left" or "0.40 in right", which reads more plainly than a bare signed number. */
function sideways(e: number): string {
    const side = e > 0 ? "left" : e < 0 ? "right" : "";
    return `${Math.abs(e).toFixed(2)} in${side ? ` ${side}` : ""}`;
}

/**
 * Draws a loaded run with the same dots as the precise path, in a purple, blue and white palette
 * of its own, so the planned path, the simulated path and the real run read as one family of
 * lines rather than three unrelated ones.
 *
 * The run is drawn from its own samples alone and never looks anything up in the open path, so it
 * can be loaded with no path open and survives the path being swapped underneath it. The path is
 * consulted only for the hover readout, which measures against the whole precise path and simply
 * says so when there is no path to compare against.
 */
const RunLayerInner = memo(function RunLayerInner({ img, visible, errorOnHover }: RunLayerProps) {
    const run = recordedRunStore.useStore();
    // Speed is coloured against the robot's configured top speed, the same scale the precise path uses
    const maxSpeedIn = fileFormatStore.useSelector(s => s.robot.speed * 12);
    // The whole simulated trajectory of the open path, empty when no path is open
    const precisePath = computedPathStore.useSelector(s => s.trajectory);
    const [hover, setHover] = useState<Hover | null>(null);

    const dots = useMemo(() => (run === null ? [] : buildRunDots(run.samples, RUN_DOT_SPACING, maxSpeedIn)), [run, maxSpeedIn]);

    // One wide invisible stroke through every dot, which is what catches the pointer
    const hitPoints = useMemo(() => dots.map(d => `${d.x},${d.y}`).join(" "), [dots]);

    if (!visible || run === null || dots.length === 0) return null;

    // Same inch to pixel mapping PathLayer uses, so the run stays locked to the field when panning
    const sx = img.w / FIELD_REAL_DIMENSIONS.w;
    const sy = img.h / FIELD_REAL_DIMENSIONS.h;
    const tx = img.x - sx * FIELD_REAL_DIMENSIONS.x;
    const ty = img.y + sy * FIELD_REAL_DIMENSIONS.y;
    const transform = `translate(${tx},${ty}) scale(${sx},${-sy})`;

    const onPointerMove = (e: React.PointerEvent<SVGPolylineElement>) => {
        const svg = e.currentTarget.ownerSVGElement;
        if (!svg) return;
        const p = toInch(pointerToSvg(e, svg), FIELD_REAL_DIMENSIONS, img);
        const dot = nearestRunDot(dots, p.x, p.y, HOVER_RADIUS_IN);
        setHover(dot === null ? null : { dot, error: errorAgainstPrecisePath(precisePath, dot.x, dot.y) });
    };

    const shown = errorOnHover ? hover : null;
    const labelAt = shown ? toPX({ x: shown.dot.x, y: shown.dot.y }, FIELD_REAL_DIMENSIONS, img) : null;

    return (
        <>
            <g transform={transform}>
                <RunDotCircles dots={dots} />

                {/* Only present while the readout is switched on, so otherwise the run never gets
                    in the way of the field. */}
                {errorOnHover && dots.length >= 2 && (
                    <polyline
                        points={hitPoints}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={HOVER_RADIUS_IN * 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pointerEvents="stroke"
                        onPointerMove={onPointerMove}
                        onPointerLeave={() => setHover(null)}
                    />
                )}

                {shown && (
                    <circle cx={shown.dot.x} cy={shown.dot.y} r={1} fill="none" stroke="white" strokeWidth={0.3} pointerEvents="none" />
                )}
            </g>

            {/* Drawn outside the flipped inch space group, so the text is not mirrored */}
            {shown && labelAt && (
                <g transform={`translate(${labelAt.x + 12},${labelAt.y - 12})`} pointerEvents="none">
                    <rect x={0} y={-30} width={200} height={32} rx={4} fill="rgb(20,20,22)" opacity={0.9} />
                    <text x={8} y={-10} fontSize={12} fill="white">
                        {shown.error === null
                            ? "Open a path to see cross track error"
                            : `Off precise path: ${sideways(shown.error)}`}
                    </text>
                </g>
            )}
        </>
    );
});

/**
 * Catches anything thrown while drawing a run. A bad log must never take the whole app down with
 * it, so on an error the run is cleared and the reason is shown in the run format popup instead.
 */
class RunErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        const run = recordedRunStore.getState();
        clearRun();
        runLoadErrorStore.setState({
            fileName: run?.name ?? "run",
            problems: [`The run loaded but could not be drawn: ${error instanceof Error ? error.message : String(error)}`],
        });
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

/** A stable number for each distinct run object, used to reset the boundary when a new run loads. */
const runIds = new WeakMap<RecordedRun, number>();
let nextRunId = 1;
function idOf(run: RecordedRun | null): number {
    if (run === null) return 0;
    let id = runIds.get(run);
    if (id === undefined) { id = nextRunId++; runIds.set(run, id); }
    return id;
}

export default function RunLayer(props: RunLayerProps) {
    const run = recordedRunStore.useStore();
    // Keyed on the run, so after a failure the boundary starts fresh for the next file loaded
    return (
        <RunErrorBoundary key={idOf(run)}>
            <RunLayerInner {...props} />
        </RunErrorBoundary>
    );
}
