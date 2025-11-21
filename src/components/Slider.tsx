import React, { useRef } from "react";
import { clamp } from "../core/Util";

type SliderProps = {
  sliderWidth: number,
  sliderHeight: number,
  knobWidth: number,
  knobHeight: number,
  value: number,
  setValue?: (value: number) => void; 
}

export default function Slider({
  sliderWidth,
  sliderHeight,
  knobWidth,
  knobHeight,
  value, 
  setValue
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
      handleMove(evt.clientX)
    }

    const stop = () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("mousemove", move);
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", stop)
  }

  return (
    <div className="bg-lightgray rounded-sm relative"
      style={{       
        width: `${sliderWidth}px`,
        height: `${sliderHeight}px`,
        }}
      ref={trackRef}
      onMouseDown={startDrag}

    >
      <div className="bg-white absolute top-[50%] rounded-full cursor-grab"
        style={{
          width: `${knobWidth}px`,
          height: `${knobHeight}px`,
          left: `${value}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}