/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { clamp, FIELD_IMG_DIMENSIONS, mergeDeep, normalizeDeg, makeId, type Rectangle } from "../core/Util";
import type { Path } from "../core/Types/Path";
import type { SetStateAction } from "react";
import { createAngleSwingSegment, createAngleTurnSegment, createPointDriveSegment, createPointSwingSegment, createPointTurnSegment, createPoseDriveSegment, createSegmentGroup, type Segment } from "../core/Types/Segment";
import type { Coordinate } from "../core/Types/Coordinate";
import type { Pose } from "../core/Types/Pose";
import type { Format } from "../hooks/useFormat";
import { convertPathToString } from "../Conversion/Conversion";
import { pointerToSvg } from "../components/Field/FieldUtils";
import type { FileFormat } from "../hooks/useFileFormat";
import { AddToUndoHistory, redoHistory, undoHistory } from "../core/Undo/UndoHistory";

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

        setPath(prev => {
            const newSegments = (
                prev.segments.map((c) =>
                    c.selected
                        ? {
                            ...c,
                            pose: {
                                ...c.pose,
                                x: c.pose.x !== null
                                    ? clamp(
                                    c.pose.x + xScale,
                                    MIN_FIELD_X,
                                    MAX_FIELD_X
                                    ) : c.pose.x,
                                y: c.pose.y !== null 
                                    ? clamp(
                                    c.pose.y + yScale,
                                    MIN_FIELD_Y,
                                    MAX_FIELD_Y
                                    )
                                    : c.pose.y
                                    
                            },
                        }
                        : c
                )
            );  
            AddToUndoHistory({ path: { ...prev, segments: newSegments }})

            return {
                ...prev,
                segments: newSegments
            }
        })

        setPath((prev) => ({
            ...prev,
        }));
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
        setPath: React.Dispatch<React.SetStateAction<Path>>,
    ) {
        const BASE_STEP = 90;
        const SMALL_STEP = 5;

        const BIG_TICK_PX = 10;
        const SMALL_TICK_PX = 20;

        const BIG_IDLE_MS = 50;

        if (!evt.shiftKey) return;
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

                AddToUndoHistory({ path: { ...prev, segments: newSegments } });

                return {
                    ...prev,
                    segments: newSegments,
                };
            });
        };

        if (evt.ctrlKey) {
            smallAccum += dy;

            if (Math.abs(smallAccum) < SMALL_TICK_PX) return;

            const dir = smallAccum < 0 ? 1 : -1;
            smallAccum = 0;

            apply(dir * SMALL_STEP);
            return;
        }


        if (bigIdleTimer) clearTimeout(bigIdleTimer);
        bigIdleTimer = setTimeout(() => {
            bigLocked = false;
            bigAccum = 0;
        }, BIG_IDLE_MS);

        if (bigLocked) return;

        bigAccum += dy;
        if (Math.abs(bigAccum) < BIG_TICK_PX) return;

        const dir = bigAccum < 0 ? 1 : -1;

        bigAccum = 0;
        bigLocked = true; 

        apply(dir * BASE_STEP);
    }


    /** Using key "Escape" to unselect whole path */
    function unselectPath(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.key === "Escape") {
            setPath((prev) => {
                const newSegments = prev.segments.map((c) => ({
                    ...c,
                    selected: false,
                }));
                
                return {
                    ...prev,
                    segments: newSegments,
                };
            });
        }
    }

    /** Using keys "ctrl + a" to select whole path */
    function selectPath(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (!evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a") {
            evt.preventDefault();
            setPath((prev) => {
                const newSegments = prev.segments.map((c) => ({
                    ...c,
                    selected: true,
                }));

                return {
                    ...prev,
                    segments: newSegments,
                };
            });
        }
    }

    function selectInversePath(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a") {
            evt.preventDefault();
            setPath((prev) => {
                const newSegments = prev.segments.map((c) => ({
                    ...c,
                    selected: !c.selected,
                }));

                return {
                    ...prev,
                    segments: newSegments,
                };
            });
        }
    }

    /** Using keys "Backspace" and "Delete" to remove segments */
    function deleteControl(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.key === "Backspace" || evt.key === "Delete") {
            setPath((prev) => {
                const allSelected = prev.segments.length > 0 && prev.segments.every((s) => s.selected);

                const newSegments = prev.segments.filter((c, i) => {
                    if (c.locked) return true;
                    if (!c.selected) return true;

                    if (i === 0 && prev.segments.length > 1 && !allSelected) return true;

                    return false;
                });

                if (newSegments.length !== prev.segments.length) {
                    AddToUndoHistory({ path: { ...prev, segments: newSegments } });
                }

                return {
                    ...prev,
                    segments: newSegments,
                };
            });
        }
    }

    function performUndo(setFileFormat: React.Dispatch<React.SetStateAction<FileFormat>>) {
        const undoState = undoHistory.getState();
        if (undoState.length <= 1) return;
        
        setFileFormat((current) => {
            const popped = undoState[undoState.length - 1];
            undoHistory.setState(undoState.slice(0, -1));
            redoHistory.setState([...redoHistory.getState(), popped]);
            
            const previousSnapshot = undoState[undoState.length - 2];
            return mergeDeep(current, previousSnapshot as any);
        });
    }

    function performRedo(setFileFormat: React.Dispatch<React.SetStateAction<FileFormat>>) {
        const redoState = redoHistory.getState();
        if (redoState.length === 0) return;
        
        setFileFormat((current) => {
            const nextSnapshot = redoState[redoState.length - 1];
            redoHistory.setState(redoState.slice(0, -1));
            undoHistory.setState([...undoHistory.getState(), nextSnapshot]);
            
            return mergeDeep(current, nextSnapshot as any);
        });
    }

    function undo(
        evt: KeyboardEvent,
        setFileFormat: React.Dispatch<React.SetStateAction<FileFormat>>,
    ) {
        if (evt.ctrlKey) {
            const key = evt.key.toLowerCase();
            if (key === "z" && !evt.shiftKey) {
                evt.preventDefault();
                performUndo(setFileFormat);
            }
            else if ((key === "z" && evt.shiftKey) || key === "y") {
                evt.preventDefault();
                performRedo(setFileFormat);
            }
        }
    }

    const copy = (
        evt: KeyboardEvent,
        path: Path,
        setClipboard: React.Dispatch<SetStateAction<Segment[]>>
    ) => {
        if (evt.key.toLowerCase() === "c" && evt.ctrlKey) {
            const segments = path.segments.filter(s => s.selected);
            if (segments === undefined) return; 
            setClipboard(structuredClone(segments));
        }
    }

    const cut = (
        evt: KeyboardEvent,
        path: Path,
        setClipboard: React.Dispatch<SetStateAction<Segment[]>>,
        setPath:React.Dispatch<SetStateAction<Path>>
    ) => {
        if (evt.key.toLowerCase() === "x" && evt.ctrlKey) {
            const segments = path.segments.filter(s => s.selected);
            if (segments === undefined) return; 
            setClipboard(structuredClone(segments));
            const del = new KeyboardEvent("keydown", { key: "Delete"});
            deleteControl(del, setPath);
        }
    }

    const paste = (
        evt: KeyboardEvent,
        setPath: React.Dispatch<SetStateAction<Path>>,
        clipboard: Segment[]
    ) => {
        if (evt.key.toLowerCase() === "v" && evt.ctrlKey) {
            setPath(prev => {
                let selectedIndex = prev.segments.findIndex(c => c.selected);
                selectedIndex = selectedIndex === -1 ? selectedIndex = prev.segments.length : selectedIndex + 1;

                const oldSegments = prev.segments;

                const groupIdMap = new Map<string, string>();
                clipboard.forEach((s) => {
                    if (s.groupId && !groupIdMap.has(s.groupId)) {
                        groupIdMap.set(s.groupId, makeId(10));
                    }
                });

                const newSegments = clipboard.map((s) => {
                    const cloned = structuredClone(s);
                    if (cloned.groupId) {
                        cloned.groupId = groupIdMap.get(cloned.groupId);
                    }
                    return {
                        ...cloned,
                        id: makeId(10),
                        selected: !s.locked,
                        hovered: false,
                        command: s.command ? { ...s.command, id: makeId(10) } : s.command,
                    };
                });
                
                const inserted: Segment[] = [
                    ...oldSegments.slice(0, selectedIndex),
                    ...newSegments,
                    ...oldSegments.slice(selectedIndex)
                ]
    
                const pastedSet = new Set(newSegments);
                const controls = inserted.map(s =>
                    pastedSet.has(s) ? s : { ...s, selected: false }
                );
                
                AddToUndoHistory({ path: { ...prev, segments: inserted } });
            
                return {
                    ...prev,
                    segments: controls,
                };
            });        
        }

    }

    const addSegment = (segment: Segment, setPath: React.Dispatch<SetStateAction<Path>>) => {
        setPath(prev => {
            let selectedIndex = prev.segments.findIndex(c => c.selected);
            selectedIndex = selectedIndex === -1 ? selectedIndex = prev.segments.length : selectedIndex + 1;
            
            const selectedSegment = prev.segments.find(c => c.selected);
            if (selectedSegment !== undefined && selectedSegment.groupId !== undefined) {
                segment.groupId = selectedSegment.groupId;
            }
            console.log(selectedIndex, selectedSegment, segment);

            const oldControls = prev.segments;
        
            const newControl = { ...segment, selected: !segment.locked };
        
            const inserted =
                selectedIndex >= 0
                ? [
                    ...oldControls.slice(0, selectedIndex),
                    newControl,
                    ...oldControls.slice(selectedIndex)
                    ]
                : [...oldControls, newControl];
        
            const controls = inserted.map(c =>
                c === newControl ? c : { ...c, selected: false }
            );
            
            AddToUndoHistory({ path: { ...prev, segments: controls } });
        
            return {
                ...prev,
                segments: controls,
            };
        });
    }

    const fieldZoomKeyboard = (evt: KeyboardEvent, setImg: React.Dispatch<SetStateAction<Rectangle>>) => {
        const ZOOM_STEP = 200;

        let dir = 0;

        if (!evt.ctrlKey) return;
        if (evt.key === "=") dir = 1;
        if (evt.key === "-") dir = -1;

        if (evt.key === "0") {
            setImg(FIELD_IMG_DIMENSIONS);
            return;         
        }
        
        evt.preventDefault();
        evt.stopPropagation();

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
    
    const fieldZoomWheel = (evt: WheelEvent, setImg: React.Dispatch<SetStateAction<Rectangle>>, svgRef: React.RefObject<SVGSVGElement | null>) => {
        if (evt.shiftKey || !evt.ctrlKey || svgRef.current === null) return;

        evt.preventDefault();
        evt.stopPropagation();
  
        const cursorPos = pointerToSvg(evt, svgRef.current);
  
        const zoomSpeed = 1; 
        const delta = -evt.deltaY * zoomSpeed;
  
        setImg((prev) => {
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

    const fieldPanWheel = (evt: WheelEvent, setImg: React.Dispatch<SetStateAction<Rectangle>>) => {
        if (evt.shiftKey || evt.ctrlKey) return;

        evt.preventDefault();
        
        const panSpeed = 1.0;
        const dx = -evt.deltaX * panSpeed;
        const dy = -evt.deltaY * panSpeed;

        setImg((prev) => ({
            ...prev,
            x: clamp(prev.x + dx, -9999, 9999),
            y: clamp(prev.y + dy, -9999, 9999),
        }));
    }

    const addAngleTurnSegment = (format: Format, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createAngleTurnSegment(format, 0);
        addSegment(control, setPath);
    }
    
    const addPointTurnSegment = (format: Format, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createPointTurnSegment(format, {x: null, y: null, angle: 0})
        addSegment(control, setPath);
    }

    const addPoseDriveSegment = (format: Format, position: Pose, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createPoseDriveSegment(format, position)
        addSegment(control, setPath);
    }

    const addPointDriveSegment = (format: Format, position: Coordinate, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createPointDriveSegment(format, position)
        addSegment(control, setPath);
    }
    
    const addPointSwingSegment = (format: Format, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createPointSwingSegment(format, {x: null, y: null, angle: 0})
        addSegment(control, setPath);
    }
    
    const addAngleSwingSegment = (format: Format, setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createAngleSwingSegment(format, 0)
        addSegment(control, setPath);
    }

    const addSegmentGroup = (setPath: React.Dispatch<SetStateAction<Path>>) => {
        const control = createSegmentGroup();
        addSegment(control, setPath);
    }

    const copySelectedPath = (evt: KeyboardEvent, path: Path, format: Format, trigger: () => void) => {
        if (evt.key.toLowerCase() === "c" && evt.ctrlKey && !evt.shiftKey) {
            trigger();
            evt.preventDefault();
            const out = convertPathToString(path, format, true);
            navigator.clipboard.writeText(out ?? "");
        }
    }
    
    const copyAllPath = (evt: KeyboardEvent, path: Path, format: Format, trigger: () => void) => {
        if (evt.key.toLowerCase() === "c" && evt.shiftKey && evt.ctrlKey) {
            trigger();
            evt.preventDefault();
            const out = convertPathToString(path, format, false);
            navigator.clipboard.writeText(out ?? "");
        }

    }

    return {
        moveControl,
        unselectPath,
        selectPath,
        selectInversePath,
        deleteControl,
        moveHeading,
        undo,
        cut,
        copy,
        paste,
        copyAllPath,
        fieldZoomKeyboard,
        fieldZoomWheel,
        fieldPanWheel,
        copySelectedPath,
        addPointDriveSegment,
        addPointTurnSegment,
        addPoseDriveSegment,
        addAngleTurnSegment,
        addAngleSwingSegment,
        addPointSwingSegment,
        addSegmentGroup,
    };
}