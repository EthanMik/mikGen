import type React from "react";
import { calculateHeading, clamp, normalizeDeg } from "../core/Util";
import { createPoseDriveSegment, type Path, type Segment } from "../core/Path";
import { useEffect, useState, type SetStateAction } from "react";
import type { PathSim } from "../core/PathSim";

export default function useMacros() {
  const MIN_FIELD_X = -100;
  const MIN_FIELD_Y = -100;
  const MAX_FIELD_X = 100;
  const MAX_FIELD_Y = 100;
  
  /** Using keys "←↑↓→" and "Shift + ←↑↓→" to move segments  */
  function moveControl(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
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
  
    setPath(prev => ({
      ...prev,
      segments: prev.segments.map(control =>
        control.selected
          ? {
              ...control,
              pose: {
                ...control.pose,
                x: clamp(control.pose.x + xScale, MIN_FIELD_X, MAX_FIELD_X),
                y: clamp(control.pose.y + yScale, MIN_FIELD_Y, MAX_FIELD_Y),
              },
            }
          : control
      ),
    }));
  }

  /** Using keys "WASD" and "Shift + WASD" to move angle of segment  */
  function moveHeading(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
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
    if (evt.key === " ") {
      setPath(prev => ({
        ...prev, segments:
          prev.segments.map((c, idx, arr) => 
            c.selected && idx < arr.length - 1 ?
            {
              ...c,
              turnToPos: { x: arr[idx + 1].pose.x, y: arr[idx + 1].pose.y },
              heading: calculateHeading({ x: arr[idx].pose.x, y: arr[idx].pose.y }, { x: arr[idx + 1].pose.x, y: arr[idx + 1].pose.y })
            } : 
            c
          )
      }));
    }

    if (thetaScale === 0) return;

    setPath(prev => ({
      ...prev,
      controls: prev.segments.map(control =>
        control.selected
          ? {
              ...control,
              heading: normalizeDeg(control.pose.angle + thetaScale)
            }
          : control
      ),
    }));    
  }
  
  /** Using key "Escape" to unselect whole path */
  function unselectPath(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
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
  function selectPath(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
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

  function selectInversePath(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
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
  function deleteControl(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
    if (evt.key === "Backspace" || evt.key === "Delete") {
        setPath(prev => ({
          segments:
            prev.segments.filter(c => !c.selected || c.locked)
        }));
    }
  }

  function undoPath(evt: KeyboardEvent, 
    undo: React.RefObject<boolean>,
    pathStorageRef: React.RefObject<Path[]>,
    pathStoragePtr: React.RefObject<number>,
    setPath: React.Dispatch<React.SetStateAction<Path>>
  ) {
    if (evt.ctrlKey && evt.key.toLowerCase() === "z") {
      const storage = pathStorageRef.current;
      const ptr = pathStoragePtr.current
      
      if (!storage.length || storage.length <= 0 || ptr > storage.length || ptr <= 0) return;

      undo.current = true;

      const last = storage[ptr - 1];
      pathStoragePtr.current = ptr - 1;

      setPath(last)
    }
  }

  function redoPath(evt: KeyboardEvent, 
    undo: React.RefObject<boolean>,
    pathStorageRef: React.RefObject<Path[]>,
    pathStoragePtr: React.RefObject<number>,
    setPath: React.Dispatch<React.SetStateAction<Path>>
  ) {
    if (evt.ctrlKey && evt.key.toLowerCase() === "y") {
      const storage = pathStorageRef.current;
      const ptr = pathStoragePtr.current
      
      if (!storage.length || storage.length <= 0 || ptr >= storage.length - 1 || ptr < 0) return;

      undo.current = true; 
      
      const last = storage[ptr + 1];
      pathStoragePtr.current = ptr + 1

      setPath(last)
    }
  }

  function toggleRobotVisibility(evt: KeyboardEvent, setVisibility: React.Dispatch<SetStateAction<boolean>>) {
    if (evt.key.toLowerCase() === "r") {
      setVisibility(v => !v)
      evt.stopPropagation();
    }
  }

  /** Using key "P" to start and stop simulator */
  const pauseSimulator = (evt: KeyboardEvent, setPlaying: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (evt.key.toLowerCase() === "k") {
      setPlaying(v => !v)
      evt.stopPropagation();
    }
  }

  const scrubSimulator = (evt: KeyboardEvent, setPercent: React.Dispatch<React.SetStateAction<number>>, computedPath: PathSim) => {
    const FAST_SCRUB_STEP = .25; // Move 1 second
    const SLOW_SCRUB_STEP = .05;

    const scrub = evt.shiftKey ? 
      FAST_SCRUB_STEP / computedPath.totalTime * 100 : 
      SLOW_SCRUB_STEP / computedPath.totalTime * 100;

    if (evt.key.toLowerCase() === "l") {
      setPercent(p => {
        if (p + scrub <= 100) {
          return p + scrub
        }
        return 100;
      });
    }
    if (evt.key.toLowerCase() === "j") {
      setPercent(p => {
        if (p - scrub >= 0) {
          return p - scrub
        }
        return 0;
      });
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
    toggleRobotVisibility,
    pauseSimulator,
    scrubSimulator
  }

}

