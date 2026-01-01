import type React from "react";
import { clamp, normalizeDeg } from "../core/Util";
import type { Path } from "../core/Types/Path";
import type { SetStateAction } from "react";
import { createAngleSwingSegment, createAngleTurnSegment, createPointDriveSegment, createPointSwingSegment, createPointTurnSegment, createPoseDriveSegment, type Segment } from "../core/Types/Segment";
import type { Coordinate } from "../core/Types/Coordinate";
import type { Pose } from "../core/Types/Pose";
import type { Format } from "../hooks/useFormat";
import { convertPathToString } from "../Conversion/Conversion";

export default function FieldMacros() {
    const MIN_FIELD_X = -100;
    const MIN_FIELD_Y = -100;
    const MAX_FIELD_X = 100;
    const MAX_FIELD_Y = 100;

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

        setPath((prev) => ({
            ...prev,
            segments: prev.segments.map((control) =>
                control.selected
                    ? {
                          ...control,
                          pose: {
                              ...control.pose,
                              x: clamp(
                                  control.pose.x + xScale,
                                  MIN_FIELD_X,
                                  MAX_FIELD_X
                              ),
                              y: clamp(
                                  control.pose.y + yScale,
                                  MIN_FIELD_Y,
                                  MAX_FIELD_Y
                              ),
                          },
                      }
                    : control
            ),
        }));
    }

    /** Using keys "WASD" and "Shift + WASD" to move angle of segment  */
    function moveHeading(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        const BASE_HEADING_STEP = 5;
        const FAST_HEADING_STEP = 10;

        const LARGE_HEADING_STEP = 90;
        const LARGE_HEADING_STEP_FAST = 180;

        const headingStep = evt.shiftKey ? FAST_HEADING_STEP : BASE_HEADING_STEP;
        const largeHeadingStep = evt.shiftKey
            ? LARGE_HEADING_STEP_FAST
            : LARGE_HEADING_STEP;

        let thetaScale = 0;

        if (evt.key.toLowerCase() === "a") {
            thetaScale = -headingStep;
        }
        if (evt.key.toLowerCase() === "d") {
            thetaScale = headingStep;
        }

        if (evt.key.toLowerCase() === "w") {
            thetaScale = largeHeadingStep;
        }
        if (evt.key.toLowerCase() === "s") {
            thetaScale = -largeHeadingStep;
        }
        // if (evt.key === " ") {
        //   setPath(prev => ({
        //     ...prev, segments:
        //       prev.segments.map((c, idx, arr) =>
        //         c.selected && idx < arr.length - 1 ?
        //         {
        //           ...c,
        //           turnToPos: { x: arr[idx + 1].pose.x, y: arr[idx + 1].pose.y },
        //           heading: calculateHeading({ x: arr[idx].pose.x, y: arr[idx].pose.y }, { x: arr[idx + 1].pose.x, y: arr[idx + 1].pose.y })
        //         } :
        //         c
        //       )
        //   }));
        // }

        if (thetaScale === 0) return;

        setPath((prev) => ({
            ...prev,
            segments: prev.segments.map((c) =>
                c.selected
                    ? {
                          ...c,
                          pose: {
                              ...c.pose,
                              angle:
                                  c.pose.angle !== null
                                      ? normalizeDeg(c.pose.angle + thetaScale)
                                      : c.pose.angle,
                          },
                      }
                    : c
            ),
        }));
    }

    /** Using key "Escape" to unselect whole path */
    function unselectPath(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.key === "Escape")
            setPath((prevSegment) => ({
                ...prevSegment,
                segments: prevSegment.segments.map((c) => ({
                    ...c,
                    selected: false,
                })),
            }));
    }

    /** Using keys "ctrl + a" to select whole path */
    function selectPath(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (!evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a") {
            evt.preventDefault();
            setPath((prevSegment) => ({
                ...prevSegment,
                segments: prevSegment.segments.map((c) => ({
                    ...c,
                    selected: true,
                })),
            }));
        }
    }

    function selectInversePath(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a") {
            evt.preventDefault();
            setPath((prevSegment) => ({
                ...prevSegment,
                segments: prevSegment.segments.map((c) => ({
                    ...c,
                    selected: !c.selected,
                })),
            }));
        }
    }

    /** Using keys "Backspace" and "Delete" to remove segments */
    function deleteControl(
        evt: KeyboardEvent,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.key === "Backspace" || evt.key === "Delete") {
            setPath((prev) => ({
                segments: prev.segments.filter((c) => !c.selected || c.locked),
            }));
        }
    }

    function undoPath(
        evt: KeyboardEvent,
        undo: React.RefObject<boolean>,
        pathStorageRef: React.RefObject<Path[]>,
        pathStoragePtr: React.RefObject<number>,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.ctrlKey && evt.key.toLowerCase() === "z") {
            const storage = pathStorageRef.current;
            const ptr = pathStoragePtr.current;

            if (!storage.length || storage.length <= 0 || ptr > storage.length || ptr <= 0)
                return;

            undo.current = true;

            const last = storage[ptr - 1];
            pathStoragePtr.current = ptr - 1;

            setPath(last);
        }
    }

    function redoPath(
        evt: KeyboardEvent,
        undo: React.RefObject<boolean>,
        pathStorageRef: React.RefObject<Path[]>,
        pathStoragePtr: React.RefObject<number>,
        setPath: React.Dispatch<React.SetStateAction<Path>>
    ) {
        if (evt.ctrlKey && evt.key.toLowerCase() === "y") {
            const storage = pathStorageRef.current;
            const ptr = pathStoragePtr.current;

            if (
                !storage.length ||
                storage.length <= 0 ||
                ptr >= storage.length - 1 ||
                ptr < 0
            )
                return;

            undo.current = true;

            const last = storage[ptr + 1];
            pathStoragePtr.current = ptr + 1;

            setPath(last);
        }
    }

    const addSegment = (segment: Segment, setPath: React.Dispatch<SetStateAction<Path>>) => {
        setPath(prev => {
            let selectedIndex = prev.segments.findIndex(c => c.selected);
            selectedIndex = selectedIndex === -1 ? selectedIndex = prev.segments.length : selectedIndex + 1;
        
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
        
            return {
                ...prev,
                segments: controls,
            };
        });
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
        undoPath,
        redoPath,
        copyAllPath,
        copySelectedPath,
        addPointDriveSegment,
        addPointTurnSegment,
        addPoseDriveSegment,
        addAngleTurnSegment,
        addAngleSwingSegment,
        addPointSwingSegment
    };
}
