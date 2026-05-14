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
  OnChangeEnd
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    let newValue = ((clientX - rect.left) / rect.width) * 100;

    newValue = clamp(newValue, 0, 100);
    setValue?.(newValue);
  }

  const startDrag = (evt: React.MouseEvent) => {
    onChangeStart?.();
    evt.preventDefault();
    evt.stopPropagation();
    handleMove(evt.clientX);

    const move = (evt: MouseEvent) => {
      handleMove(evt.clientX)
    }

    const stop = () => {
      OnChangeEnd?.(value);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("mousemove", move);
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", stop)
  }

  return (
    <div className="relative flex items-center w-full cursor-pointer"
      style={{
        ...(sliderWidth > 0 ? { width: `${sliderWidth}px` } : {}),
        height: `${Math.max(knobHeight, sliderHeight) * 2}px`,
      }}
      ref={trackRef}
      onMouseDown={startDrag}
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
          left: `${value}%`,
          top: "50%",
          transform: `translate(-50%, -50%) scale(${1})`,
          transition: "transform 0.05s ease",
        }}
      />
    </div>
  );
}
