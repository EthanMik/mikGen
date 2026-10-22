import flipHorizontal from "../assets/icons/ui/flip-horizontal.svg";
import flipVertical from "../assets/icons/ui/flip-vertical.svg";
import rotateLeft from "../assets/icons/ui/rotate-left.svg";
import rotateRight from "../assets/icons/ui/rotate-right.svg";
import { distanceToPosition, getSegmentDistance } from "../core/Types/Path";
import { saveSnapshot } from "../core/Undo/UndoHistory";
import { normalizeDeg, resolveTurnPose } from "../core/Util";
import { fileFormatStore, updatePath, usePath } from "../hooks/useFileFormat";
import type { Segment } from "../core/Types/Segment";
import type { Pose } from "../core/Types/Pose";
import { segmentControls } from "../core/Types/Bezier";
import type { SegmentConstants, Format } from "../simulation/FormatDefinition";

import NumberInput from "./Util/NumberInput";
import Tooltip from "./Util/Tooltip";

type MirrorDirection = "x" | "y";

type MirrorControlProps = {
    src: string
    mirrorDirection: MirrorDirection
}

type RotateDirection = "left" | "right";

type RotateControlProps = {
    src: string
    rotateDirection: RotateDirection
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
    else if (k.swing_side !== undefined)
        flipped = { ...k, swing_side: k.swing_side === "SwingSide::LEFT" ? "SwingSide::RIGHT" : "SwingSide::LEFT" };
    else
        flipped = k;
    return [flipped, ...rest] as unknown as SegmentConstants<Format>;
}

/**
 * A turn's offset is relative to the bearing at its target, and mirroring flips that bearing in both
 * axes, so the offset negates either way. Coordinates mirror on the axis being flipped, whether or
 * not the turn is locked, so a lock applied later is already correct.
 */
function mirrorTurnPose(c: Segment, axis: MirrorDirection): Pose {
    return {
        ...c.turnPose,
        angle: c.turnPose.angle != null ? normalizeDeg(360 - c.turnPose.angle) : null,
        x: axis === "x" && c.turnPose.x != null ? -c.turnPose.x : c.turnPose.x,
        y: axis === "y" && c.turnPose.y != null ? -c.turnPose.y : c.turnPose.y,
    };
}

function applyMirrorExtras(c: Segment): Segment {
    if (c.kind === "strafeDrive")
        return { ...c, distance: -c.distance };
    if (c.kind === "angleSwing" || c.kind === "pointSwing")
        return { ...c, constants: flipSwingDirection(c.constants) };
    return c;
}

/**
 * A quarter turn about the field's center. Right is clockwise on screen, the same way headings
 * increase, so a heading only has to step by 90 to stay with its point.
 */
function rotateCoord(x: number | null, y: number | null, direction: RotateDirection): { x: number | null, y: number | null } {
    if (x == null || y == null) return { x, y };
    return direction === "right" ? { x: y, y: -x } : { x: -y, y: x };
}

// The path is only needed inside click handlers; reading it at call time keeps the mounted
// transform buttons from re-rendering on every path write
const hasSelection = () =>
    fileFormatStore.getState().path.segments.some(m => m.selected || segmentControls(m).some(ctrl => ctrl.selected));

function TransformButton({ src, onClick }: { src: string, onClick: () => void }) {
    return (
        <button
            className="flex items-center justify-center w-[34px] h-[34px] cursor-pointer
            rounded-lg bg-transparent hover:bg-medgray_hover border-none outline-none fill-white"
            onClick={onClick}>
            <img
                className="fill-white w-[27px] h-[27px]"
                src={src}
            />
        </button>
    );
}

function MirrorControl({
    src,
    mirrorDirection
}: MirrorControlProps) {
    const setPath = updatePath;

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

    const mirrorX = () => {
        const hasSelected = hasSelection();
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(c => {
                const withControls = mirrorControls(c, "x");
                if (!c.selected) return withControls;
                const posed = {
                    ...withControls,
                    pose: {
                        ...c.pose, angle: c.pose.angle != null ? normalizeDeg(360 - c.pose.angle) : null,
                        x: c.pose.x != null ? -c.pose.x : null
                    },
                    turnPose: mirrorTurnPose(c, "x"),
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
                const posed = {
                    ...withControls,
                    pose: {
                        ...c.pose, angle: c.pose.angle != null ? normalizeDeg(180 - c.pose.angle) : null,
                        y: c.pose.y != null ? -c.pose.y : null
                    },
                    turnPose: mirrorTurnPose(c, "y"),
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

    return <TransformButton src={src} onClick={handleOnClick} />;
}

/**
 * Unlike a mirror, a rotation keeps handedness, so a turn's offset, a strafe's side and a swing's
 * side all carry over as they are. Only positions and headings move.
 */
function RotateControl({
    src,
    rotateDirection
}: RotateControlProps) {
    const setPath = updatePath;
    const step = rotateDirection === "right" ? 90 : -90;

    const rotate = () => {
        const hasSelected = hasSelection();
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(c => {
                // Controls rotate like segments do, each on its own selection
                const controls = segmentControls(c);
                const withControls = !controls.some(ctrl => ctrl.selected) ? c : {
                    ...c,
                    controls: controls.map(ctrl => !ctrl.selected ? ctrl : { ...ctrl, ...rotateCoord(ctrl.x, ctrl.y, rotateDirection) }),
                };
                if (!c.selected) return withControls;
                return {
                    ...withControls,
                    pose: {
                        ...rotateCoord(c.pose.x, c.pose.y, rotateDirection),
                        angle: c.pose.angle != null ? normalizeDeg(c.pose.angle + step) : null,
                    },
                    // Rotated whether or not the turn is locked, so a lock applied later is already correct
                    turnPose: { ...c.turnPose, ...rotateCoord(c.turnPose.x, c.turnPose.y, rotateDirection) },
                };
            })
        }));
        if (hasSelected) saveSnapshot();
    }

    return <TransformButton src={src} onClick={rotate} />;
}

export default function ControlConfig() {
    const [ path, setPath ] = usePath();

    // Controls are selectable like segments, so when one owns the selection the X/Y inputs
    // drive it instead. Controls carry no heading or distance, so those inputs grey out.
    const selectedControls = path.segments.flatMap(s =>
        segmentControls(s).map((c, i) => ({ segId: s.id, idx: i, control: c })).filter(r => r.control.selected)
    );
    const soleControl = path.segments.some(s => s.selected) || selectedControls.length !== 1
        ? null
        : selectedControls[0];

    const selectedSegment = soleControl ? "bezierControl" : path.segments.find((s) => s.selected)?.kind;

    // X/Y drive a point turn's target rather than a position, and only once its lock owns it
    const soleSegment = soleControl || path.segments.filter(s => s.selected).length !== 1
        ? null
        : path.segments.find(s => s.selected) ?? null;
    const isPointBased = soleSegment?.kind === "pointTurn" || soleSegment?.kind === "pointSwing";
    const turnTargetEditable = isPointBased && soleSegment!.turnLocked;

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

    /** Shows the coordinate a point turn is aiming at, tracked or locked, in place of a position. */
    const getTurnTarget = (): { x: number; y: number } =>
        resolveTurnPose(path, path.segments.findIndex(s => s.selected));

    const getXValue = (): number | null => {
        if (soleControl) return soleControl.control.x;
        if (isPointBased) return getTurnTarget().x;
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const x: number | null | undefined = path.segments.find(c => c.selected)?.pose.x;
        if (x === null || x === undefined) return null;
        return x
    }

    const getYValue = (): number | null => {
        if (soleControl) return soleControl.control.y;
        if (isPointBased) return getTurnTarget().y;
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

        if (selectedSegment.kind === "angleSwing" || selectedSegment.kind === "angleTurn") return;

        // An unlocked target is derived, so a wrihttp://localhost:5173/te to it would be discarded on the next read
        if (isPointBased) {
            if (!turnTargetEditable) return;
            return setPath(prev => ({
                ...prev,
                segments: prev.segments.map(control =>
                    control.selected ? { ...control, turnPose: { ...control.turnPose, x: newX } } : control
                ),
            }));
        }

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

        if (selectedSegment.kind === "angleSwing" || selectedSegment.kind === "angleTurn") return;

        if (isPointBased) {
            if (!turnTargetEditable) return;
            return setPath(prev => ({
                ...prev,
                segments: prev.segments.map(control =>
                    control.selected ? { ...control, turnPose: { ...control.turnPose, y: newY } } : control
                ),
            }));
        }

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
        const headingOptional = selectedSegment.kind === "poseDrive" || selectedSegment.kind === "poseDrive2"
            || selectedSegment.kind === "distanceDrive" || selectedSegment.kind === "strafeDrive"
            || selectedSegment.kind === "bezierCurve";
        if (newHeading === null && !headingOptional) return;
        if (newHeading !== null) newHeading = normalizeDeg(newHeading);
        setPath(prev => {
                let kind = selectedSegment.kind;
                if ((selectedSegment.kind === "poseDrive" || selectedSegment.kind === "poseDrive2") && newHeading === null) {
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
        <div className="flex flex-row items-center justify-center gap-3 bg-medgray w-[500px] h-[65px] rounded-lg">
            { selectedSegment !== "distanceDrive" && selectedSegment !== "strafeDrive" &&
                <div className={`flex items-center flex-row gap-2 ${(selectedSegment === "angleSwing" || selectedSegment === "angleTurn" || selectedSegment === "wait" || (isPointBased && !turnTargetEditable)) ? "opacity-50 pointer-events-none" : ""}`}>
                        <span style={{ fontSize: 20 }}>X</span>
                        <NumberInput
                            width={76}
                            height={40}
                            fontSize={18}
                            setValue={updateXValue}
                            value={getXValue()}
                            stepSize={1}
                            roundTo={2}
                            bounds={[-999, 999]}
                            units="in"
                            addToHistory={() => { saveSnapshot(); }}
                        />
                        <span style={{ fontSize: 20 }}>Y</span>
                        <NumberInput
                            width={76}
                            height={40}
                            fontSize={18}
                            stepSize={1}
                            roundTo={2}
                            setValue={updateYValue}
                            value={getYValue()}
                            bounds={[-999, 999]}
                            units="in"
                            addToHistory={() => { saveSnapshot(); }}
                        />
                </div>
            }

            { (selectedSegment === "distanceDrive" || selectedSegment === "strafeDrive") &&
                <>
                    <div className="w-[93px]"></div>
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: 20 }}>Δ</span>
                        <NumberInput
                            width={76}
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
                    width={76}
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

            <div className={`flex items-center flex-row gap-[2px] ${selectedSegment === "wait" ? "opacity-50 pointer-events-none" : ""}`}>
                <Tooltip label="Mirror Horizontally">
                    <MirrorControl mirrorDirection="x" src={flipHorizontal}/>
                </Tooltip>
                <Tooltip label="Mirror Vertically">
                    <MirrorControl mirrorDirection="y" src={flipVertical}/>
                </Tooltip>
                <Tooltip label="Rotate Left">
                    <RotateControl rotateDirection="left" src={rotateLeft}/>
                </Tooltip>
                <Tooltip label="Rotate Right">
                    <RotateControl rotateDirection="right" src={rotateRight}/>
                </Tooltip>
            </div>
        </div>
    );
}
