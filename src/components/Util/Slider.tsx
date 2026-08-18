import React, { useRef } from "react";
import { clamp } from "../../core/Util";

type SliderProps = {
  sliderWidth?: number,
  sliderHeight: number,
  sliderColor?: string,
  knobWidth: number,
  knobHeight: number,
  knobColor?: string,
  value: number,
  setValue: (value: number) => void;
  onChangeStart?: () => void;
  OnChangeEnd?: (value: number) => void;
  step?: number;
}

/** Uses value on a scale of 0-100 */
export default function Slider({
  sliderWidth = 0,
  sliderHeight,
  sliderColor = "--color-lightgray",
  knobWidth,
  knobHeight,
  knobColor = "--color-verylightgray",
  value,
  setValue,
  onChangeStart,
  OnChangeEnd,
  step,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    let newValue = ((clientX - rect.left) / rect.width) * 100;

    if (step) newValue = Math.round(newValue / step) * step;
    newValue = clamp(newValue, 0, 100);
    setValue?.(newValue);
  }

  // Pointer events rather than mouse events, so the scrubber can be dragged by touch. Capture on
  // the track replaces the window level listeners: it keeps delivering moves once the finger or
  // cursor leaves the track, and releases itself automatically.
  const dragging = useRef(false);

  const startDrag = (evt: React.PointerEvent) => {
    if (evt.button !== 0) return;
    onChangeStart?.();
    evt.preventDefault();
    evt.stopPropagation();
    dragging.current = true;
    evt.currentTarget.setPointerCapture(evt.pointerId);
    handleMove(evt.clientX);
  }

  const onMove = (evt: React.PointerEvent) => {
    if (!dragging.current) return;
    handleMove(evt.clientX);
  }

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    OnChangeEnd?.(value);
  }

  return (
    <div className="relative flex items-center w-full cursor-pointer touch-none"
      style={{
        ...(sliderWidth > 0 ? { width: `${sliderWidth}px` } : {}),
        height: `${Math.max(knobHeight, sliderHeight) * 2}px`,
      }}
      ref={trackRef}
      onPointerDown={startDrag}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="rounded-sm w-full pointer-events-none"
        style={{
          backgroundColor: `var(${sliderColor})`,
          height: `${sliderHeight}px`,
        }}
      />
      <div className="absolute rounded-full cursor-grab pointer-events-none"
        style={{
          backgroundColor: `var(${knobColor})`,
          width: `${knobWidth}px`,
          height: `${knobHeight}px`,
          left: `${clamp(value, 0, 100)}%`,
          top: "50%",
          transform: `translate(-50%, -50%) scale(${1})`,
          transition: "transform 0.05s ease",
        }}
      />
    </div>
  );
}
