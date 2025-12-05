import { useEffect, useState } from "react";
import Slider from "./Slider";
import eyeOpen from "../assets/eye-open.svg";
import eyeClosed from "../assets/eye-closed.svg";
import threeDots from "../assets/three-dots.svg"
import lockClose from "../assets/lock-close.svg";
import lockOpen from "../assets/lock-open.svg"
import downArrow from "../assets/down-arrow.svg";
import plus from "../assets/plus.svg";
import copy from "../assets/copy.svg";
import { useSegment } from "../hooks/useSegment";
import { ReveilLibPathFormat } from "../formats/ReveilLibPathFormat";
import { convertPath } from "../core/PathConversion";
import { usePathVisibility } from "./usePathVisibility";
import { mikLibFormat } from "../formats/mikLibFormat";

type MotionListProps = {
    name: string
    segmentId: string
}

function MotionList({name, segmentId}: MotionListProps) {
  const [value, setValue] = useState<number>(0);
  const [ segment, setSegment ] = useSegment(); 
  const selected = segment.controls.find((c) => c.id === segmentId)?.selected;
  const [ isEyeOpen, setEyeOpen ] = useState(false);
  const [ isLocked, setLocked ] = useState(false);

    useEffect(() => {
      if (name === "Drive") {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.id === segmentId
                ? { ...control, drivePower: value }
                : control
            ),
        }));
      }

      if (name === "Turn") {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.id === segmentId
                ? { ...control, turnPower: value }
                : control
            ),
        }));
      }

    }, [value])

    const handleEyeOnClick = () => {
      setEyeOpen((visible) => {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.id === segmentId
                ? { ...control, visible: !visible }
                : control
            ),
        }));
        return !visible
      })
    }

    const handleLockOnClick = () => {
      setLocked((locked) => {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.id === segmentId
                ? { ...control, locked: !locked }
                : control
            ),
        }));

        return !locked
      })
    }

    return (
        <div className={`${selected ? "bg-medlightgray" : ""} center justify-between items-center 
        flex flex-row w-[450px] h-[35px] gap-[10px]
        hover:bg-medgray_hover rounded-lg pl-4 pr-4
        `}>
            <img className="w-[15px] h-[15px]"
                src={downArrow}
            />
            <button className="cursor-pointer" 
              onClick={handleEyeOnClick}>
              <img className="w-[30px] h-[22px]"
                  src={isEyeOpen ? eyeClosed : eyeOpen}
              />
            </button>

            <button className="cursor-pointer" 
              onClick={handleLockOnClick}>
              <img className="w-[30px] h-[22px]"
                  src={isLocked ? lockClose : lockOpen}
              />
            </button>
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
                src={threeDots}
            />
        </div>
    );
}

function PathConfigHeader() {
  const [ segment, setSegment ] = useSegment(); 
  const [ isEyeOpen, setEyeOpen ] = useState(false);
  const [ pathVisible, setPathVisibility ] = usePathVisibility();

  const copyOnClick = () => {
    const format = new mikLibFormat();
    const out = convertPath(segment, format);
    navigator.clipboard.writeText(out);
  }

  const handleEyeOnClick = () => {
    setEyeOpen((eye) => {
      setPathVisibility(!eye);
      return !eye
    });
  }

  return (
    <div className="w-full flex flex-row items-center justify-between">
      <span className="block text-[20px]">
        Path
      </span>
        <div className="flex flex-row gap-[10px] items-center">
          <button 
            className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer 
                      rounded-sm hover:bg-medgray_hover active:scale-95 transition-normal duration-50"
            onClick={copyOnClick}
            >
            <img className="w-[25px] h-[25px] pr-[2px]"
              src={copy}
            />
          </button>
          <button className="cursor-pointer" 
              onClick={handleEyeOnClick}>
              <img className="w-[20px] h-[22px]"
                  src={isEyeOpen ? eyeClosed : eyeOpen}
          />
          </button>
          <img className="w-[15px] h-[15px]"
            src={downArrow}
          />
          <img className="block w-[18px] h-[18px]"
            src={plus}
          />
        </div>
    </div>
  );
}

export default function PathConfig() {
  const [ segment, setSegment ] = useSegment(); 

  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader />

      <div className="mt-[10px] flex-1 min-h-2 overflow-y-auto 
       flex-col items-center overflow-x-hidden space-y-1">
        {segment.controls.map((c, idx) => (
          <>
            {idx > 0 ? <MotionList name="Drive" segmentId={c.id} /> : <div/>}
            {idx > 0 && c.turnToPos !== null ? <MotionList name="Turn" segmentId={c.id} /> : <div/>}
            {idx === 0 ? <MotionList name="Start" segmentId={c.id} /> : <div/>}
          </>
        ))}

      </div>
    </div>
  );
}