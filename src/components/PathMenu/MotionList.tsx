/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import lockClose from "../../assets/lock-close.svg";
import lockOpen from "../../assets/lock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import cwccw from "../../assets/cwwcw.svg";
import Slider from "../Util/Slider";
import { usePath } from "../../hooks/usePath";
import CommandList from "./CommandList";
import { createCommand, type Command } from "../../core/Types/Command";
import type { ConstantField } from "./ConstantRow";
import ConstantsList from "./ConstantsList";
import CycleImageButton from "../Util/CycleButton";


export type ConstantListField = {
    header: string,
    values: any,
    fields: ConstantField[]
    defaults: Partial<any>;
    onChange: (partial: Partial<any>) => void;
    setDefault: (partial: Partial<any>) => void;
}

type MotionListProps = {
    name: string,
    speedScale: number,
    field: ConstantListField[], 
    segmentId: string,
    isOpenGlobal: boolean,
    start?: boolean,
}

export default function MotionList({
    name, 
    speedScale,
    field,
    segmentId, 
    isOpenGlobal,
    start = false
}: MotionListProps) {
    const [ path, setPath ] = usePath(); 

    const segment = path.segments.find(s => s.id === segmentId)!;
    const selected = path.segments.find((c) => c.id === segmentId)?.selected;

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

    useEffect(() => {
        setEyeOpen(segment.visible);
    }, [segment.visible])

    useEffect(() => {
        setLocked(segment.locked);
    }, [segment.locked])

    const getValuesFromKeys = (
        keys: Array<string>,
        obj: Partial<any>
    ): Partial<any> => {
        return keys.reduce<Partial<any>>((acc, key) => {
            if (key in (obj ?? {})) {
                acc[key as any] = (obj as any)[key];
            }
            return acc;
        }, {});
    };

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
                {!start ? <Slider 
                    sliderWidth={250}
                    sliderHeight={5}
                    knobHeight={16}
                    knobWidth={16}
                    value={(field[0]?.values?.["maxSpeed"] ?? 0) / speedScale * 100} 
                    setValue={(v: number) => field[0]?.onChange({ maxSpeed: (v / 100) * speedScale })}
                /> : <div className="w-[290px]"></div>
                }
                {!start && <span className="w-10">
                    {(field[0]?.values?.["maxSpeed"] ?? 0).toFixed(speedScale > 9.9 ? (speedScale > 99.9 ? 0 : 1) : 2)}
                </span>}
                                    

                <CycleImageButton 
                    imageKeys={
                        [
                            { src: cw, key: "left"},
                            { src: ccw, key: "right"},
                            // { src: cwccw, key: "null"},
                        ]
                    }
                    onKeyChange={
                        (key: string) => {
                            field[0]?.onChange({ swingDirection: key })
                            console.log(key);
                        }
                    }

                />



            </button>
            <div className={`flex flex-col ml-10 gap-2 transition-all ${isOpen ? "block" : "hidden"}`}>
                <CommandList command={command} setCommand={setCommand} />
                {field.map((f) => {
                    const fieldKeys = f.fields.map(m => m.key);
                    const relevantValues = getValuesFromKeys(fieldKeys, f.values);
                    const relevantDefaults = getValuesFromKeys(fieldKeys, f.defaults);

                    return (
                        <ConstantsList
                            key={f.header}
                            header={f.header}
                            fields={f.fields}
                            values={relevantValues}
                            isOpenGlobal={isOpenGlobal}
                            onChange={f.onChange}
                            onReset={() => f.onChange(relevantDefaults)}
                            onSetDefault={f.setDefault}
                            defaults={relevantDefaults}
                        />
                    );
                })}
            </div>
        </div>
    );
}
