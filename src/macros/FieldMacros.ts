/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { clamp, FIELD_IMG_DIMENSIONS, normalizeDeg, type Rectangle } from "../core/Util";
import { distanceToPosition, getBackwardsSnapPose, getSegmentDistance, type Path } from "../core/Types/Path";
import type { SetStateAction } from "react";
import { createSegment, type Segment } from "../core/Types/Segment";
import { seedControls, segmentControls } from "../core/Types/Bezier";
import type { Coordinate } from "../core/Types/Coordinate";
import type { Pose } from "../core/Types/Pose";
import type { Format } from "../hooks/useFileFormat";
import { applyTurnLocks, convertPathToString, convertStringToPath } from "../simulation/Conversion";
import { insertIndexAfterSelection, invertAllSelection, pointerToSvg, setAllSelection } from "../components/Field/FieldUtils";
import { fileFormatStore } from "../hooks/useFileFormat";
import { seedSegments } from "../core/FileSchema";
import { saveSnapshot, redoHistory, undoHistory } from "../core/Undo/UndoHistory";
import { queueFieldImg } from "../hooks/useFieldImg";
import { copiedSegmentsStore } from "../core/CopyStore";

export default function FieldMacros() {
    const MIN_FIELD_X = -999;
    const MIN_FIELD_Y = -999;
    const MAX_FIELD_X = 999;
    const MAX_FIELD_Y = 999 ;

    /** Using keys "←↑↓→" and "Shift + ←↑↓→" to move segments  */
    function moveControl(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        const BASE_POS_STEP = 0.25;
        const FAST_POS_STEP = 1;

        const posStep = evt.shiftKey ? FAST_POS_STEP : BASE_POS_STEP;

        let xScale = 0;
        let yScale = 0;

        if (evt.key === "ArrowUp") yScale = posStep;
        if (evt.key === "ArrowDown") yScale = -posStep;
        if (evt.key === "ArrowLeft") xScale = -posStep;
        if (evt.key === "ArrowRight") xScale = posStep;

        if (xScale === 0 && yScale === 0) return;

        evt.preventDefault();

        const nudge = <T extends { x: number | null; y: number | null }>(p: T): T => ({
            ...p,
            x: p.x !== null ? clamp(p.x + xScale, MIN_FIELD_X, MAX_FIELD_X) : p.x,
            y: p.y !== null ? clamp(p.y + yScale, MIN_FIELD_Y, MAX_FIELD_Y) : p.y,
        });

        setPath(prev => {
            const newSegments = prev.segments.map((c) => {
                const controls = segmentControls(c);
                const moved = {
                    ...c,
                    // Bezier controls select like segments, so the arrow keys move them too
                    controls: controls.some(ctrl => ctrl.selected)
                        ? controls.map(ctrl => ctrl.selected ? nudge(ctrl) : ctrl)
                        : controls,
                };
                return c.selected ? { ...moved, pose: nudge(c.pose) } : moved;
            });

            return { ...prev, segments: newSegments };
        });
    }

    /** Use mouse wheel to change angle of selected segment
     * - base step: 5° (ctrl)
     * - shift step: 90° (shift only)
     */
    let bigAccum = 0;
    let smallAccum = 0;

    let bigLocked = false;
    let bigIdleTimer: ReturnType<typeof setTimeout> | null = null;

    function moveHeading(
        evt: WheelEvent,
        path: Path,
        setPath: React.Dispatch<React.SetStateAction<Path>>,
    ) {
        const BASE_STEP = 90;
        const SMALL_STEP = 5;

        const BIG_TICK_PX = 10;
        const SMALL_TICK_PX = 20;

        const BIG_IDLE_MS = 50;

        

        if (!evt.shiftKey) return;
        if (path.segments.filter(c => c.selected).every(c => c.pose.angle === null)) return false;
        evt.preventDefault();

        let dy = evt.deltaY;
        if (evt.deltaMode === 1) dy *= 16;
        if (evt.deltaMode === 2) dy *= 800;
        if (dy === 0) return;

        const apply = (degDelta: number) => {
            setPath((prev) => {
                const newSegments = prev.segments.map((c) =>
                    c.selected
                        ? {
                            ...c,
                            pose: {
                                ...c.pose,
                                angle:
                                    c.pose.angle !== null
                                        ? normalizeDeg(c.pose.angle + degDelta)
                                        : c.pose.angle,
                            },
                        }
                        : c
                );

                return { ...prev, segments: newSegments };
            });
        };

        if (evt.ctrlKey) {
            smallAccum += dy;

            if (Math.abs(smallAccum) < SMALL_TICK_PX) return false;

            const dir = smallAccum < 0 ? 1 : -1;
            smallAccum = 0;

            apply(dir * SMALL_STEP);
            return true;
        }


        if (bigIdleTimer) clearTimeout(bigIdleTimer);
        bigIdleTimer = setTimeout(() => {
            bigLocked = false;
            bigAccum = 0;
        }, BIG_IDLE_MS);

        if (bigLocked) return false;

        bigAccum += dy;
        if (Math.abs(bigAccum) < BIG_TICK_PX) return false;

        const dir = bigAccum < 0 ? 1 : -1;

        bigAccum = 0;
        bigLocked = true;

        apply(dir * BASE_STEP);
        return true;
    }


    /** Using key "Escape" to unselect whole path */
    function unselectPath(
        evt: KeyboardEvent | null,
        setPath: React.Dispatch<React.SetStateAction<Path>>,
    ) {
        if (evt === null || evt.key === "Escape") {
            setPath((prev) => setAllSelection(prev, false));
        }
    }

    /** Using keys "ctrl + a" to select whole path */
    function selectPath(
        evt: KeyboardEvent | null,
        setPath: React.Dispatch<React.SetStateAction<Path>>,
    ) {
        if (evt === null || (!evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a")) {
            if (evt !== null) evt.preventDefault();
            setPath((prev) => setAllSelection(prev, true));
        }
    }

    function selectInversePath(
        evt: KeyboardEvent | null,
        setPath: React.Dispatch<React.SetStateAction<Path>>,
    ) {
        if (evt === null || (evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a")) {
            if (evt !== null) evt.preventDefault();
            setPath((prev) => invertAllSelection(prev));
        }
    }

    /** Using keys "Backspace" and "Delete" to remove segments */
    function deleteControl(
        evt: KeyboardEvent | null,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt === null || (evt.key === "Backspace" || evt.key === "Delete")) {
            setPath((prev) => {
                // Deleting a segment takes its controls with it, so segments win a mixed
                // selection. Controls are only deleted on their own when nothing else is selected.
                const hasSelectedSegment = prev.segments.some(s => s.selected);
                const hasSelectedControl = prev.segments.some(s => segmentControls(s).some(c => c.selected));
                if (hasSelectedControl && !hasSelectedSegment) {
                    return {
                        ...prev,
                        segments: prev.segments.map(s => ({
                            ...s,
                            controls: segmentControls(s).filter(c => !c.selected),
                        })),
                    };
                }

                const allSelected = prev.segments.length > 0 && prev.segments.every((s) => s.selected);

                const newSegments = prev.segments.filter((c, i) => {
                    if (!c.selected) return true;

                    if (i === 0 && prev.segments.length > 1 && !allSelected) return true;

                    return false;
                });

                return {
                    ...prev,
                    segments: newSegments,
                };
            });
            saveSnapshot();
        }
    }

    function undo(evt: KeyboardEvent | null) {
        if (evt === null || (evt.ctrlKey && evt.key.toLowerCase() === "z" && !evt.shiftKey)) {
            if (evt !== null) evt.preventDefault();
            const undoState = undoHistory.getState();
            if (undoState.length <= 1) return;
            const popped = undoState[undoState.length - 1];
            const previousSnapshot = undoState[undoState.length - 2];
            undoHistory.setState(undoState.slice(0, -1));
            redoHistory.setState([...redoHistory.getState(), popped]);
            fileFormatStore.setState(previousSnapshot);
        }
    }

    function redo(evt: KeyboardEvent | null) {
        if (evt === null || (evt.ctrlKey && ((evt.key.toLowerCase() === "z" && evt.shiftKey) || evt.key.toLowerCase() === "y"))) {
            if (evt !== null) evt.preventDefault();
            const redoState = redoHistory.getState();
            if (redoState.length === 0) return;
            const nextSnapshot = redoState[redoState.length - 1];
            redoHistory.setState(redoState.slice(0, -1));
            undoHistory.setState([...undoHistory.getState(), nextSnapshot]);
            fileFormatStore.setState(nextSnapshot);
        }
    }

    const writeToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).catch(() => {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        });
    };

    const cut = (
        evt: KeyboardEvent | null,
        path: Path,
        setPath: React.Dispatch<SetStateAction<Path>>,
    ) => {
        if (evt === null || (evt.key.toLowerCase() === "x" && evt.ctrlKey)) {
            const formatDef = fileFormatStore.getState().formatDef;
            const out = convertPathToString(formatDef, path, true);
            writeToClipboard(out ?? "");
            const del = new KeyboardEvent("keydown", { key: "Delete" });
            deleteControl(del, setPath);
        }
    }

    const copy = (evt: KeyboardEvent | null, path: Path, copyAll: boolean = false) => {
        const keyMatch = evt !== null && (copyAll
            ? (evt.key.toLowerCase() === "c" && evt.shiftKey && evt.ctrlKey)
            : (evt.key.toLowerCase() === "c" && evt.ctrlKey && !evt.shiftKey));
        if (evt === null || keyMatch) {
            if (evt !== null) evt.preventDefault();
            const formatDef = fileFormatStore.getState().formatDef;
            const out = convertPathToString(formatDef, path, !copyAll);
            writeToClipboard(out ?? "");
            copiedSegmentsStore.setState(path.segments.filter(s => copyAll || s.selected).map(s => s.id));
        }
    }

    const paste = (
        evt: ClipboardEvent | null,
        setPath: React.Dispatch<SetStateAction<Path>>,
    ) => {
        const apply = (text: string) => {
            const { formatDef, format } = fileFormatStore.getState();
            // Pasted text is as untrusted as a loaded file, so it goes through the same seeding
            const parsed = seedSegments(formatDef, format, convertStringToPath(formatDef, format, text));
            if (parsed.length === 0) return;

            setPath(prev => {
                const selectedIndex = insertIndexAfterSelection(prev.segments);

                const toInsert: Segment[] = prev.segments.length === 0 && parsed[0].kind !== "start"
                    ? [createSegment(formatDef, format, "start", { x: 0, y: 0, angle: 0 }), ...parsed]
                    : parsed;

                const insertStart = selectedIndex;
                const insertEnd = selectedIndex + toInsert.length;

                const inserted: Segment[] = [
                    ...prev.segments.slice(0, selectedIndex).map(s => ({ ...s, selected: false })),
                    ...toInsert,
                    ...prev.segments.slice(selectedIndex).map(s => ({ ...s, selected: false })),
                ];

                const fullPath: Path = { name: "", segments: inserted };
                for (let i = insertStart; i < insertEnd; i++) {
                    const seg = inserted[i];
                    if (seg.kind !== "distanceDrive") continue;
                    const dist = seg.distance ?? getSegmentDistance(fullPath, i);
                    if (dist == null) continue;
                    const pos = distanceToPosition(fullPath, i, dist);
                    if (pos) inserted[i] = { ...seg, pose: { ...seg.pose, x: pos.x, y: pos.y }, distance: dist };
                }

                // Only now, with the pasted rows sitting among their new neighbours and the distance
                // segments re-projected, can a turn tell whether its own coordinate is the one this
                // path derives or one it has to hold on to
                const locked = applyTurnLocks({ name: "", segments: inserted }, insertStart, insertEnd);

                return {
                    ...prev,
                    segments: locked.map((s, i) =>
                        (i >= insertStart && i < insertEnd) ? { ...s, selected: true } : s
                    ),
                };
            });
            saveSnapshot();
        };

        if (evt === null) {
            navigator.clipboard.readText().then(apply);
            return;
        }

        const target = evt.target as HTMLElement | null;
        const isPasteProxy = target?.hasAttribute('data-paste-proxy');
        if (!isPasteProxy && (target?.isContentEditable || target?.tagName === "INPUT")) return;
        evt.preventDefault();
        apply(evt.clipboardData?.getData('text/plain') ?? '');
    }

    const addSegment = (segment: Segment, setPath: React.Dispatch<SetStateAction<Path>>) => {
        setPath(prev => {
            const selectedIndex = insertIndexAfterSelection(prev.segments);

            const selectedSegment = prev.segments[selectedIndex - 1];
            if (selectedSegment?.selected && selectedSegment.groupId !== undefined) {
                segment.groupId = selectedSegment.groupId;
            }

            const oldControls = prev.segments;

            const newControl = { ...segment, selected: true };

            const inserted = [
                ...oldControls.slice(0, selectedIndex),
                newControl,
                ...oldControls.slice(selectedIndex)
            ];

            return {
                ...prev,
                segments: inserted.map(c =>
                    c === newControl ? c : { ...c, selected: false, controls: segmentControls(c).map(ctrl => ({ ...ctrl, selected: false })) }
                ),
            };
        });
        saveSnapshot();
    }

    const fieldZoomKeyboard = (evt: KeyboardEvent | null, setImg: React.Dispatch<SetStateAction<Rectangle>>, action: "ZoomIn" | "ZoomOut" | "ZoomReset" | null = null) => {
        const ZOOM_STEP = 200;

        if (action === "ZoomReset" || (evt !== null && evt.key === "0")) {
            setImg(FIELD_IMG_DIMENSIONS);
            return;
        }

        let dir = 0;

        if (evt !== null && !evt.ctrlKey && action === null) return;
        if (evt?.key === "=" || action === "ZoomIn") dir = 1;
        if (evt?.key === "-" || action === "ZoomOut") dir = -1;

        if (evt !== null) {
            evt.preventDefault();
            evt.stopPropagation();
        }

        setImg((prev) => {
            const aspectRatio = prev.w / prev.h;
            
            const newW = Math.max(100, prev.w + (ZOOM_STEP * dir));
            const newH = newW / aspectRatio;

            return {
                ...prev,
                w: clamp(newW, 0, FIELD_IMG_DIMENSIONS.w * 3),
                h: clamp(newH, 0, FIELD_IMG_DIMENSIONS.h * 3),
            };
        });
    }
    
    const fieldZoomWheel = (evt: WheelEvent, svgRef: React.RefObject<SVGSVGElement | null>) => {
        if (evt.shiftKey || !evt.ctrlKey || svgRef.current === null) return;

        evt.preventDefault();
        evt.stopPropagation();

        const cursorPos = pointerToSvg(evt, svgRef.current);

        const zoomSpeed = 1;
        const delta = -evt.deltaY * zoomSpeed;

        queueFieldImg((prev) => {
            const aspectRatio = prev.w / prev.h;

            const newW = Math.max(100, prev.w + delta);
            const newH = newW / aspectRatio;

            const fx = (cursorPos.x - prev.x) / prev.w;
            const fy = (cursorPos.y - prev.y) / prev.h;

            const newX = clamp(cursorPos.x - fx * newW, -9999, 9999);
            const newY = clamp(cursorPos.y - fy * newH, -9999, 9999);

            const maxWidth = FIELD_IMG_DIMENSIONS.w * 3;
            const maxHeight = FIELD_IMG_DIMENSIONS.w * 3;

            if (newW >= maxWidth || newH >= maxHeight) return prev;

            return {
                x: newX,
                y: newY,
                w: newW,
                h: newH,
            };
        });        
    }

    const fieldPanWheel = (evt: WheelEvent) => {
        if (evt.shiftKey || evt.ctrlKey) return;

        evt.preventDefault();

        const panSpeed = 1.0;
        const dx = -evt.deltaX * panSpeed;
        const dy = -evt.deltaY * panSpeed;

        queueFieldImg((prev) => ({
            ...prev,
            x: clamp(prev.x + dx, -9999, 9999),
            y: clamp(prev.y + dy, -9999, 9999),
        }));
    }

    const addStartSegment = (format: Format, position: Pose, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["start"]?.castTo) return;
        addSegment(createSegment(formatDef, format, "start", position), setPath);
    }

    /** Left click */
    const addPointDriveSegment = (evt: React.MouseEvent<Element> | null, format: Format, position: Coordinate, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(!evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 0)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["pointDrive"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "pointDrive", { x: position.x, y: position.y, angle: null }), setPath);
    }

    /** Ctrl + Left click */
    const addPoseDriveSegment = (evt: React.MouseEvent<Element> | null, format: Format, position: Pose, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(evt.ctrlKey && !evt.altKey && evt.button === 0)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["poseDrive"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "poseDrive", position), setPath);
    }

    /** Alt + Left click */
    const addDistanceSegment = (evt: React.MouseEvent<Element> | null, format: Format, position: Pose, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(!evt.ctrlKey && evt.altKey && evt.button === 0)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["distanceDrive"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "distanceDrive", position), setPath);
    }

    /** Ctrl + Alt + Left click */
    const addStrafeSegment = (evt: React.MouseEvent<Element> | null, format: Format, position: Pose, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(evt.ctrlKey && evt.altKey && evt.button === 0)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["strafeDrive"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "strafeDrive", position), setPath);
    }

    /** Right click */
    const addPointTurnSegment = (evt: React.MouseEvent<Element> | null, format: Format, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(!evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 2)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["pointTurn"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "pointTurn", { x: null, y: null, angle: null }), setPath);
    }

    /** Ctrl + Right click */
    const addAngleTurnSegment = (evt: React.MouseEvent<Element> | null, format: Format, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 2)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["angleTurn"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "angleTurn", { x: null, y: null, angle: 0 }), setPath);
    }

    /** Alt + Right click */
    const addPointSwingSegment = (evt: React.MouseEvent<Element> | null, format: Format, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(!evt.ctrlKey && evt.altKey && evt.button === 2)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["pointSwing"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "pointSwing", { x: null, y: null, angle: null }), setPath);
    }

    /** Ctrl + Alt + Right click */
    const addAngleSwingSegment = (evt: React.MouseEvent<Element> | null, format: Format, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(evt.ctrlKey && evt.altKey && evt.button === 2)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["angleSwing"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "angleSwing", { x: null, y: null, angle: 0 }), setPath);
    }

    /** Shift + Left click */
    const addBezierSegment = (evt: React.MouseEvent<Element> | null, format: Format, position: Pose, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        if (evt !== null && !(evt.shiftKey && !evt.ctrlKey && !evt.altKey && evt.button === 0)) return;
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["bezierCurve"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);

        const end = { x: position.x ?? 0, y: position.y ?? 0 };
        const insertIdx = insertIndexAfterSelection(path.segments);
        const startPose = getBackwardsSnapPose(path, insertIdx - 1);
        const start = startPose !== null && startPose.x !== null && startPose.y !== null
            ? { x: startPose.x, y: startPose.y }
            : end;

        const angle = formatDef.segments["bezierCurve"]?.defaultHeading ?? null;
        const segment = createSegment(formatDef, format, "bezierCurve", { x: end.x, y: end.y, angle });
        segment.controls = seedControls(start, end);
        addSegment(segment, setPath);
    }

    const addWaitSegment = (format: Format, setPath: React.Dispatch<SetStateAction<Path>>, path: Path) => {
        const formatDef = fileFormatStore.getState().formatDef;
        if (formatDef.segments["wait"]?.castTo) return;
        if (path.segments.length === 0) return addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath);
        addSegment(createSegment(formatDef, format, "wait", { x: null, y: null, angle: null }), setPath);
    }

    return {
        moveControl,
        unselectPath,
        selectPath,
        selectInversePath,
        deleteControl,
        moveHeading,
        undo,
        redo,
        cut,
        copy,
        paste,
        fieldZoomKeyboard,
        fieldZoomWheel,
        fieldPanWheel,
        addPointDriveSegment,
        addPointTurnSegment,
        addPoseDriveSegment,
        addAngleTurnSegment,
        addAngleSwingSegment,
        addPointSwingSegment,
        addStrafeSegment,
        addBezierSegment,
        addWaitSegment,
        addDistanceSegment,
        addStartSegment,
    };
}