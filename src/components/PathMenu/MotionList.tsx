/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import lockClose from "../../assets/lock-close.svg";
import lockOpen from "../../assets/lock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import Slider from "../Util/Slider";
import { usePath } from "../../hooks/usePath";
import CommandList from "./CommandList";
import { createCommand, type Command } from "../../core/Types/Command";
import { getDefaultConstantsForKind, isDriveConstants, type DriveConstants, type TurnConstants } from "../../core/Types/Segment";
import type { ConstantField } from "./ConstantRow";
import ConstantsList from "./ConstantsList";

export type ConstantListField = {
    header: string,
    values: any,
    fields: ConstantField[]
    onChange: (partial: Partial<any>) => void;
}

type MotionListProps = {
    name: string,
    startSpeed: number, 
    field: ConstantListField[], 
    segmentId: string,
    isOpenGlobal: boolean,
}

export default function MotionList({
    name, 
    startSpeed,
    field,
    segmentId, 
    isOpenGlobal,
}: MotionListProps) {
    const [ path, setPath ] = usePath(); 

    const segment = path.segments.find(s => s.id === segmentId)!;
    const selected = path.segments.find((c) => c.id === segmentId)?.selected;

    const [ value, setValue ] = useState<number>(startSpeed);
    const [ isEyeOpen, setEyeOpen ] = useState(true);
    const [ isLocked, setLocked ] = useState(false);
    const [ isOpen, setOpen ] = useState(false);
    const [ command, setCommand ] = useState<Command>(createCommand(''));


    const normalSelect = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, selected: true } 
                : {...segment, selected: false}
            )
        }));
    }
    
    const crtlSelect = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, selected: !segment.selected } 
                : {...segment}
            )
        }));
    }

    const shiftSelect = () => {
        setPath(prev => {
            const segments = prev.segments;

            const clickedIdx = segments.findIndex(s => s.id === segmentId);
            if (clickedIdx === -1) return prev;

            let anchorIdx = -1;
            for (let i = segments.length - 1; i >= 0; i--) {
                if (segments[i].selected) {
                    anchorIdx = i;
                    break;
                }
            }

            if (anchorIdx === -1) anchorIdx = clickedIdx;

            const start = Math.min(anchorIdx, clickedIdx);
            const end = Math.max(anchorIdx, clickedIdx);

            return {
                ...prev,
                segments: segments.map((s, i) => ({
                    ...s,
                    selected: i >= start && i <= end,
                })),
            };
        });
    };

    const handleOnClick = (evt: React.PointerEvent<HTMLButtonElement>) => {
        if (evt.button === 0 && evt.ctrlKey) {
            crtlSelect();
            return;
        }

        if (evt.button === 0 && evt.shiftKey) {
            shiftSelect();
            return;
        }

        if (evt.button === 0) {
            normalSelect();
            return;
        }
    }

    const StartHover = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, hovered: true } 
                : {...segment, hovered: false }
            )
        }));        
    }
    
    const EndHover = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, hovered: false } 
                : {...segment, hovered: false }
            )
        }));        
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

    const updateAllConstants = (constants: DriveConstants | TurnConstants) => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(s => {
            if (s.id !== segmentId) return s;

            if (isDriveConstants(s.constants)) {
                return {
                ...s,
                constants: constants
                };
            }

            return {
                ...s,
                constants: constants
            };
            }),
        }));
    }

    useEffect(() => {
        // onChange({ maxSpeed: value / 100 } as Partial<any>);
    }, [value]);

    return (
        <div className="flex flex-col gap-2">
            <button 
                onClick={handleOnClick}
                onMouseEnter={StartHover}
                onMouseLeave={EndHover}
                className={`${selected ? "bg-medlightgray" : ""} 
                justify-between 
                items-center 
                flex flex-row w-[450px] h-[35px] gap-[10px]
                hover:bg-medgray_hover 
                rounded-lg pl-4 pr-4
                transition-all duration-100
                active:scale-[0.995]
              active:bg-medgray_hover/70        
            `}>
                <button className="cursor-pointer" 
                    onClick={() => setOpen(!isOpen)}>
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

            </button>
            <div className={`flex flex-col ml-10 gap-2 transition-all ${isOpen ? "block" : "hidden"}`}>
                <CommandList command={command} setCommand={setCommand} />
                {field.map((f) => (
                <ConstantsList
                    key={f.header}
                    header={f.header}
                    fields={f.fields}
                    values={f.values}
                    isOpenGlobal={isOpenGlobal}
                    onChange={f.onChange}
                    onReset={() => updateAllConstants(getDefaultConstantsForKind(segment.kind))}
                />
                ))}
            </div>
        </div>
    );
}
