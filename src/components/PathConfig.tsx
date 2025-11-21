import { useEffect, useState } from "react";
import Slider from "./Slider";
import eye from "../assets/eye.svg";
import lockClose from "../assets/lock-close.svg";
import downArrow from "../assets/down-arrow.svg";
import plus from "../assets/plus.svg";
import { useSegment } from "../hooks/useSegment";

type MotionListProps = {
    name: string
    segmentId: string
}

function MotionList({name, segmentId}: MotionListProps) {
    const [value, setValue] = useState<number>(0);
    const { segment, setSegment } = useSegment();

    useEffect(() => {
      if (name === "Drive") {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.selected
                ? { ...control, drivePower: value }
                : control
            ),
        }));
      }

      if (name === "Turn") {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.selected
                ? { ...control, turnPower: value }
                : control
            ),
        }));
      }

    }, [value])

    return (
        <div className="center justify-between items-center 
        flex flex-row w-[475px] h-[30px] gap-[10px]
        hover:bg-medgray_hover rounded-lg pl-4 pr-4
        ">
            <img className="w-[15px] h-[15px]"
                src={downArrow}
            />
            <img className="w-[30px] h-[22px]"
                src={eye}
            />
            <img className="w-[30px] h-[22px]"
                src={lockClose}
            />
            <span className="w-[80px] text-left">
                {name}
            </span>
            <Slider 
                sliderWidth={250}
                sliderHeight={5}
                knobHeight={16}
                knobWidth={16}
                value={value} 
                setValue={setValue}
            />
            <span className="w-10">
                {(value / 100).toFixed(2)}
            </span>
            <img className="w-[18px] h-[18px]"
                src={plus}
            />
        </div>
    );
}

function PathConfigHeader() {
  return (
    <div className="w-full">
      <span className="block text-[20px] text-left">
        Path
      </span>
    </div>
  );
}

export default function PathConfig() {
  const { segment, setSegment } = useSegment();

  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[10px] flex flex-col">
      <PathConfigHeader />

      <div className="mt-[10px] flex flex-col items-center space-y-1">
        {segment.controls.map((c, idx) => (
          <>
            {idx > 0 ? <MotionList name="Drive" segmentId={c.id} /> : <div/>}
            {idx > 0 && c.turnToPos !== null ? <MotionList name="Turn" segmentId={c.id} /> : <div/>}
            {/* {idx === 0 ? <MotionList name="Start" /> : <div/>} */}
          </>
        ))}

      </div>
    </div>
  );
}