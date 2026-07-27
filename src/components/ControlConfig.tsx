import flipHorizontal from "../assets/flip-horizontal.svg";
import flipVertical from "../assets/flip-vertical.svg";
import { distanceToPosition, getSegmentDistance } from "../core/Types/Path";
import { saveSnapshot } from "../core/Undo/UndoHistory";
import { normalizeDeg } from "../core/Util";
import { useFormat, usePath } from "../hooks/useFileFormat";
import type { Segment } from "../core/Types/Segment";
import { segmentControls } from "../core/Types/Bezier";
import type { SegmentConstants, Format } from "../simulation/FormatDefinition";

import NumberInput from "./Util/NumberInput";
import Tooltip from "./Util/Tooltip";

type MirrorDirection = "x" | "y";

type MirrorControlProps = {
    src: string
    mirrorDirection: MirrorDirection
}

function flipSwingDirection(constants: SegmentConstants<Format>): SegmentConstants<Format> {
    const [first, ...rest] = constants;
    const k = first as unknown as Record<string, unknown>;
    let flipped: Record<string, unknown>;
    if (k.swing_direction !== undefined)
        flipped = { ...k, swing_direction: k.swing_direction === "left" ? "right" : "left" };
    else if (k.swing !== undefined)
        flipped = { ...k, swing: k.swing === "LEFT_SWING" ? "RIGHT_SWING" : "LEFT_SWING" };
    else if (k.lockedSide !== undefined)
        flipped = { ...k, lockedSide: k.lockedSide === "DriveSide::LEFT" ? "DriveSide::RIGHT" : "DriveSide::LEFT" };
    else
        flipped = k;
    return [flipped, ...rest] as unknown as SegmentConstants<Format>;
}

function applyMirrorExtras(c: Segment): Segment {
    if (c.kind === "strafeDrive")
        return { ...c, distance: -c.distance };
    if (c.kind === "angleSwing" || c.kind === "pointSwing")
        return { ...c, constants: flipSwingDirection(c.constants) };
    return c;
}

function MirrorControl({
    src,
    mirrorDirection
}: MirrorControlProps) {
    const [ path, setPath ] = usePath();

    // Controls mirror like segments do, each on its own selection
    const mirrorControls = (c: Segment, axis: MirrorDirection): Segment => {
        const controls = segmentControls(c);
        if (!controls.some(ctrl => ctrl.selected)) return c;
        return {
            ...c,
            controls: controls.map(ctrl => !ctrl.selected ? ctrl : axis === "x"
                ? { ...ctrl, x: ctrl.x != null ? -ctrl.x : null }
                : { ...ctrl, y: ctrl.y != null ? -ctrl.y : null }),
        };
    };

    const hasSelection = () =>
        path.segments.some(m => m.selected || segmentControls(m).some(ctrl => ctrl.selected));

    const mirrorX = () => {
        const hasSelected = hasSelection();
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(c => {
                const withControls = mirrorControls(c, "x");
                if (!c.selected) return withControls;
                const posed = {
                    ...withControls, pose: {
                        ...c.pose, angle: c.pose.angle != null ? normalizeDeg(360 - c.pose.angle) : null,
                        x: c.pose.x != null ? -c.pose.x : null
                    }
                };
                return applyMirrorExtras(posed);
            })
        }));
        if (hasSelected) saveSnapshot();
    }

    const mirrorY = () => {
        const hasSelected = hasSelection();
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(c => {
                const withControls = mirrorControls(c, "y");
                if (!c.selected) return withControls;
                const isPointBased = c.kind === "pointTurn" || c.kind === "pointSwing";
                const posed = {
                    ...withControls, pose: {
                        ...c.pose, angle: c.pose.angle != null ? normalizeDeg(isPointBased ? 360 - c.pose.angle : 180 - c.pose.angle) : null,
                        y: c.pose.y != null ? -c.pose.y : null
                    }
                };
                return applyMirrorExtras(posed);
            })
        }));
        if (hasSelected) saveSnapshot();
    }

    const handleOnClick = () => {
        if (mirrorDirection === "x") {
            mirrorX();
        } else if (mirrorDirection === "y") {
            mirrorY();
        }
    }

    return (
        <button
            className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer
            rounded-lg bg-transparent hover:bg-medgray_hover border-none outline-none fill-white"
            onClick={handleOnClick}>
            <img
                className="fill-white w-[30px] h-[30px]"
                src={src}
            />
        </button>
    );
}

export default function ControlConfig() {
    const [ path, setPath ] = usePath();
    const [ format ] = useFormat();

    // Controls are selectable like segments, so when one owns the selection the X/Y inputs
    // drive it instead. Controls carry no heading or distance, so those inputs grey out.
    const selectedControls = path.segments.flatMap(s =>
        segmentControls(s).map((c, i) => ({ segId: s.id, idx: i, control: c })).filter(r => r.control.selected)
    );
    const soleControl = path.segments.some(s => s.selected) || selectedControls.length !== 1
        ? null
        : selectedControls[0];

    const selectedSegment = soleControl ? "bezierControl" : path.segments.find((s) => s.selected)?.kind;

    const updateControlPos = (patch: { x?: number | null; y?: number | null }) => {
        if (!soleControl) return;
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(s => s.id !== soleControl.segId ? s : {
                ...s,
                controls: segmentControls(s).map((c, i) => i === soleControl.idx ? { ...c, ...patch } : c),
            }),
        }));
    };

    const getDistance = (): number | null => {
        const selectedIdx = path.segments.findIndex((s) => s.selected);
        if (path.segments.filter(c => c.selected).length !== 1) return null;
        return getSegmentDistance(path, selectedIdx, selectedSegment === "strafeDrive" ? 90 : 0);
    }

    const updateDistance = (newDist: number | null) => {
        if (newDist === null) return;
        const selectedIdx = path.segments.findIndex((s) => s.selected);
        if (path.segments.filter(c => c.selected).length !== 1 || selectedIdx <= 0) return;

        const newPos = distanceToPosition(path, selectedIdx, newDist, selectedSegment === "strafeDrive" ? 90 : 0);
        if (!newPos) return;

        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(control =>
                control.selected
                    ? { ...control, pose: { ...control.pose, x: newPos.x, y: newPos.y }, distance: newDist }
                    : control
            ),
        }));
    }

    const getXValue = (): number | null => {
        if (soleControl) return soleControl.control.x;
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const x: number | null | undefined = path.segments.find(c => c.selected)?.pose.x;
        if (x === null || x === undefined) return null;
        return x
    }

    const getYValue = (): number | null => {
        if (soleControl) return soleControl.control.y;
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const y: number | null | undefined = path.segments.find(c => c.selected)?.pose.y;
        if (y === null || y === undefined) return null;
        return y
    }

    const getHeadingValue = (): number | null => {
        if (soleControl) return null;
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const heading: number | null | undefined = path.segments.find(c => c.selected)?.pose.angle;
        if (heading === null || heading === undefined) return null;
        return heading;
    }

    const updateXValue = (newX: number | null) => {
        if (soleControl) return updateControlPos({ x: newX });

        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return;

        const selectedSegment = path.segments.find(c => c.selected);
        if (selectedSegment === undefined) return;

        if (selectedSegment.kind === "angleSwing" ||
            selectedSegment.kind === "pointSwing" ||
            selectedSegment.kind === "angleTurn" ||
            selectedSegment.kind === "pointTurn"
        ) return;

        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, x: newX, }, }
                        : control
                    ),
                }));
    }

    const updateYValue = (newY: number | null) => {
        if (soleControl) return updateControlPos({ y: newY });

        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return

        const selectedSegment = path.segments.find(c => c.selected);
        if (selectedSegment === undefined) return;

        if (selectedSegment.kind === "angleSwing" ||
            selectedSegment.kind === "pointSwing" ||
            selectedSegment.kind === "angleTurn" ||
            selectedSegment.kind === "pointTurn"
        ) return;

        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, y: newY, }, }
                        : control
                    ),
                }));
    }

    const updateHeadingValue = (newHeading: number | null) => {
        if (soleControl) return;

        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return

        const selectedSegment = path.segments.find(c => c.selected);
        if (selectedSegment === undefined) return;

        if (selectedSegment.kind === "pointSwing" ||
            selectedSegment.kind === "pointTurn"
        ) return;

        // Kinds whose heading is optional can be cleared back to null without changing kind
        const headingOptional = selectedSegment.kind === "poseDrive" || selectedSegment.kind === "distanceDrive"
            || selectedSegment.kind === "strafeDrive" || selectedSegment.kind === "bezierCurve";
        if (newHeading === null && !headingOptional) return;
        if (newHeading !== null) newHeading = normalizeDeg(newHeading);
        setPath(prev => {
                let kind = selectedSegment.kind;
                if (selectedSegment.kind === "poseDrive" && newHeading === null) {
                    kind = "pointDrive";
                }
                if (selectedSegment.kind === "pointDrive" && newHeading !== null) {
                    kind = "poseDrive";
                }

                return {
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control,
                            pose: { ...control.pose, angle: newHeading, },
                            kind: kind
                        }
                        : control
                    ),
                }
            });
    }

    return (
        <div className="flex flex-row items-center justify-center gap-4 bg-medgray w-[500px] h-[65px] rounded-lg">
            { selectedSegment !== "distanceDrive" && selectedSegment !== "strafeDrive" &&
                <div className={`flex items-center flex-row gap-2 ${(selectedSegment === "angleSwing" || selectedSegment === "pointSwing" || selectedSegment === "angleTurn" || selectedSegment === "pointTurn" || selectedSegment === "wait") ? "opacity-50 pointer-events-none" : ""}`}>
                        <span style={{ fontSize: 20 }}>X</span>
                        <NumberInput
                            width={80}
                            height={40}
                            fontSize={18}
                            setValue={format === "ReveilLib" ? updateYValue : updateXValue }
                            value={format === "ReveilLib" ? getYValue() : getXValue() }
                            stepSize={1}
                            roundTo={2}
                            bounds={[-999, 999]}
                            units="in"
                            addToHistory={() => { saveSnapshot(); }}
                        />
                        <span style={{ fontSize: 20 }}>Y</span>
                        <NumberInput
                            width={80}
                            height={40}
                            fontSize={18}
                            stepSize={1}
                            roundTo={2}
                            setValue={format === "ReveilLib" ? updateXValue : updateYValue }
                            value={format === "ReveilLib" ? getXValue() : getYValue() }
                            bounds={[-999, 999]}
                            units="in"
                            addToHistory={() => { saveSnapshot(); }}
                        />
                </div>
            }

            { (selectedSegment === "distanceDrive" || selectedSegment === "strafeDrive") &&
                <>
                    <div className="w-[100px]"></div>
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: 20 }}>Δ</span>
                        <NumberInput
                            width={80}
                            height={40}
                            fontSize={18}
                            setValue={updateDistance}
                            value={getDistance()}
                            stepSize={1}
                            roundTo={2}
                            bounds={[-999, 999]}
                            units="in"
                            addToHistory={() => { saveSnapshot(); }}
                        />
                    </div>
                </>
            }

            <div className={`flex items-center gap-2 ${(selectedSegment === "pointSwing" || selectedSegment === "pointTurn" || selectedSegment === "wait" || selectedSegment === "bezierControl") ? "opacity-50 pointer-events-none" : ""}`}>
                <span style={{ fontSize: 20 }}>θ</span>
                <NumberInput
                    width={80}
                    height={40}
                    fontSize={18}
                    stepSize={5}
                    roundTo={2}
                    setValue={updateHeadingValue}
                    value={getHeadingValue()}
                    bounds={[-Infinity, Infinity]}
                    units="deg"
                    addToHistory={() => { saveSnapshot(); }}
                />
            </div>

            <div className={`flex items-center flex-row gap-[15px] ${selectedSegment === "wait" ? "opacity-50 pointer-events-none" : ""}`}>
                <Tooltip label="Mirror Horizontally">
                    <MirrorControl mirrorDirection="x" src={flipHorizontal}/>
                </Tooltip>
                <Tooltip label="Mirror Vertically">
                    <MirrorControl mirrorDirection="y" src={flipVertical}/>
                </Tooltip>
            </div>
        </div>
    );
}
