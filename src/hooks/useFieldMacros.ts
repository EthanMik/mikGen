import type React from "react";
import { useSegment } from "./useSegment";
import { calculateHeading, clamp, normalizeDeg } from "../core/Util";
import type { Segment } from "../core/Path";

export default function useFieldMacros() {
  const { segment, setSegment } = useSegment();
  
  const MIN_FIELD_X = -100;
  const MIN_FIELD_Y = -100;
  const MAX_FIELD_X = 100;
  const MAX_FIELD_Y = 100;

  
  function moveControl(evt: React.KeyboardEvent<HTMLDivElement>) {
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
  
    setSegment(prev => ({
      ...prev,
      controls: prev.controls.map(control =>
        control.selected
          ? {
              ...control,
              position: {
                ...control.position,
                x: clamp(control.position.x + xScale, MIN_FIELD_X, MAX_FIELD_X),
                y: clamp(control.position.y + yScale, MIN_FIELD_Y, MAX_FIELD_Y),
              },
            }
          : control
      ),
    }));
  }

  function moveHeading(evt: React.KeyboardEvent<HTMLDivElement>) {
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
      setSegment(prev => ({
        ...prev, controls:
          prev.controls.map((c, idx, arr) => 
            c.selected && idx < arr.length - 1 ?
            {
              ...c,
              turnToPos: arr[idx + 1].position,
              heading: calculateHeading(arr[idx].position, arr[idx + 1].position)
            } : 
            c
          )
      }));
    }

    if (thetaScale === 0) return;

    setSegment(prev => ({
      ...prev,
      controls: prev.controls.map(control =>
        control.selected
          ? {
              ...control,
              heading: normalizeDeg(control.heading + thetaScale)
            }
          : control
      ),
    }));    
  }
  
  function selectControl() {
  
  }

  function deleteControl(evt: React.KeyboardEvent<HTMLDivElement>) {
    if (evt.key === "Backspace" || evt.key === "Delete") {
        const next: Segment = {
          controls:
            segment.controls.filter((c) => !c.selected)
        }

      setSegment(next);
    }
  }
  

  return {
    moveControl,
    selectControl,
    deleteControl,
    moveHeading
  }

}

