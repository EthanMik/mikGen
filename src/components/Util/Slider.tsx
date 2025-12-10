  import React, { useRef } from "react";
import { clamp } from "../../core/Util";

type SliderProps = {
  sliderWidth: number,
  sliderHeight: number,
  sliderColor?: string,
  knobWidth: number,
  knobHeight: number,
  knobColor?: string,
  value: number,
  setValue: (value: number) => void; 
  onChangeStart?: () => void;
  OnChangeEnd?: () => void;
}

export default function Slider({
  sliderWidth,
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
    evt.preventDefault();

    
    const move = (evt: MouseEvent) => {
      onChangeStart?.();
      handleMove(evt.clientX)
    }

    const stop = () => {
      OnChangeEnd?.();
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("mousemove", move);
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", stop)
  }

  return (
    <div className="rounded-sm relative bg-amber-50"
      style={{
        backgroundColor: `var(${sliderColor})`,
        width: `${sliderWidth}px`,
        height: `${sliderHeight}px`,
      }}
      ref={trackRef}
      onMouseDown={startDrag}
      
      >
      <div className="absolute top-[50%] rounded-full cursor-grab"
        style={{
          backgroundColor: `var(${knobColor})`,
          width: `${knobWidth}px`,
          height: `${knobHeight}px`,
          left: `${value}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}