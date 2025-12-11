import type React from "react";
import { calculateHeading, clamp, normalizeDeg } from "../core/Util";
import type { Path, Segment } from "../core/Path";

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
  
  function unselectPath(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
    
  }

  /** Using keys "Backspace" and "Delete" to remove segments */
  function deleteControl(evt: KeyboardEvent, setPath: React.Dispatch<React.SetStateAction<Path>>) {
    if (evt.key === "Backspace" || evt.key === "Delete") {
        setPath(prev => ({
          segments:
            prev.segments.filter((c) => !c.selected || c.locked)
        }));
    }
  }

  /** Using key "P" to start and stop simulator */
  const pauseSimulator = (evt: KeyboardEvent, setPlaying: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (evt.key.toLowerCase() === "p") {
      setPlaying(v => !v)
      evt.stopPropagation();
    }
  }
  

  return {
    moveControl,
    unselectPath,
    deleteControl,
    moveHeading,
    pauseSimulator
  }

}

