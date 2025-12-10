import { useEffect, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import threeDots from "../../assets/three-dots.svg";
import lockClose from "../../assets/lock-close.svg";
import lockOpen from "../../assets/lock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import Slider from "../Util/Slider";
import { usePath } from "../../hooks/usePath";
import CommandList from "./CommandList";
import { createCommand, type Command } from "../../core/Command";

type MotionListProps = {
    name: string,
    segmentId: string,
    defaultSpeed: number,
    isOpenGlobal: boolean,
}

export default function MotionList({name, segmentId, isOpenGlobal, defaultSpeed}: MotionListProps) {
    const [value, setValue] = useState<number>(defaultSpeed);
    const [ path, setPath ] = usePath(); 
    const selected = path.segments.find((c) => c.id === segmentId)?.selected;
    const [ isEyeOpen, setEyeOpen ] = useState(true);
    const [ isLocked, setLocked ] = useState(false);
    const [ isOpen, setOpen ] = useState(false);
    const [ command, setCommand ] = useState<Command>(createCommand(''));

    const handleOnClick = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, selected: true } 
                : {...segment, selected: false}
            )
        }))
    }

    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])

    useEffect(() => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, command: command } 
                : {...segment}
            )
        }))        
    }, [command])

    // useEffect(() => {
    //   if (name === "Drive") {
    //     setPath(prev => ({
    //         ...prev,
    //         controls: prev.segments.map(control =>
    //             control.id === segmentId
    //             ? { ...control, drivePower: value }
    //             : control
    //         ),
    //     }));
    //   }

    //   if (name === "Turn") {
    //     setSegment(prev => ({
    //         ...prev,
    //         controls: prev.controls.map(control =>
    //             control.id === segmentId
    //             ? { ...control, turnPower: value }
    //             : control
    //         ),
    //     }));
    //   }

    // }, [value])

    const handleEyeOnClick = () => {
      setEyeOpen((visible) => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(control =>
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
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(control =>
                control.id === segmentId
                ? { ...control, locked: !locked }
                : control
            ),
        }));

        return !locked
      })
    }
    console.log(path)
    // console.log(0)

    return (
        <div className="flex flex-col gap-2">
            <button onClick={handleOnClick}
            className={`${selected ? "bg-medlightgray" : ""} center justify-between items-center 
            flex flex-row w-[450px] h-[35px] gap-[10px]
            hover:bg-medgray_hover 
            rounded-lg pl-4 pr-4
            transition-all duration-100
            active:scale-[0.99]
          active:bg-medgray_hover/70        
            `}>
                <button onClick={() => setOpen(!isOpen)}>
                    { !isOpen ? 
                    <img className="w-[15px] h-[15px] rotate-270" src={downArrow}/>
                    : <img className="w-[15px] h-[15px]" src={downArrow}/>
                    }
                </button>

                <button className="cursor-pointer" 
                onClick={handleEyeOnClick}>
                <img className="w-[30px] h-[22px]"
                    src={isEyeOpen ? eyeOpen : eyeClosed}
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
            </button>
            <div className={`ml-10 transition-all ${isOpen ? "block" : "hidden"}`}>
                <CommandList command={command} setCommand={setCommand} />
            </div>
        </div>
    );
}
