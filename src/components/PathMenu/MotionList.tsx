/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import lockClose from "../../assets/lock-close.svg";
import lockOpen from "../../assets/lock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import Slider from "../Util/Slider";
import { usePath } from "../../hooks/usePath";
import CommandList from "./CommandList";
import { createCommand, type Command } from "../../core/Types/Command";
import type { ConstantField } from "./ConstantRow";
import ConstantsList from "./ConstantsList";
import CycleImageButton, { type CycleImageButtonProps } from "../Util/CycleButton";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";
import { globalDefaultsStore } from "../../core/DefaultConstants";
import { useFormat } from "../../hooks/useFormat";


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
    directionField: CycleImageButtonProps[],
    segmentId: string,
    isOpenGlobal: boolean,
    start?: boolean,
}

export default function MotionList({
    name, 
    speedScale,
    field,
    directionField,
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
    const [ format ] = useFormat();

    const pathRef = useRef(path);
    pathRef.current = path

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

    const toggleSegment = (patch: (s: any) => any) => {
        setPath(prev => {
            
            const next = {
                ...prev,
                segments: prev.segments.map(s => (s.id === segmentId ? patch(s) : s)),
            };
            
            AddToUndoHistory({ path: next });
            return next;
        });
    };

    const handleEyeOnClick = () => {
        toggleSegment(s => ({ ...s, visible: !s.visible }));
    };

    const handleLockOnClick = () => {
        toggleSegment(s => ({ ...s, locked: !s.locked }));
    };

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

    const updateUndoRef = useRef(false);

    useEffect(() => {
        if (updateUndoRef.current) {
            AddToUndoHistory({ path: path });
            updateUndoRef.current = false;
        }
    }, [path])

    return (
        <div className={`flex flex-col gap-2 mt-[1px]`}>
            <button
            onClick={handleOnClick}
            onMouseEnter={StartHover}
            onMouseLeave={EndHover}
            className={`${selected ? "bg-medlightgray" : ""} 
                flex flex-row justify-start items-center
                w-[450px] h-[35px] gap-[12px] outline-1
                hover:bg-medgray_hover
                rounded-lg pl-4 pr-4
                transition-all duration-100
                active:scale-[0.995]
                active:bg-medgray_hover/70
                ${isOpen ? ( !selected ? "outline-medlightgray scale-[0.995]" : "outline-transparent") : "outline-transparent"}
            `}
            >
            <button
                className="cursor-pointer shrink-0"
                onClick={() => setOpen(!isOpen)}
            >
                {!isOpen ? (
                <img className="w-[15px] h-[15px] rotate-270" src={downArrow} />
                ) : (
                <img className="w-[15px] h-[15px]" src={downArrow} />
                )}
            </button>

            <button className="cursor-pointer shrink-0" onClick={handleEyeOnClick}>
                <img className="w-[20px] h-[20px]" src={isEyeOpen ? eyeOpen : eyeClosed} />
            </button>

            <button className="cursor-pointer shrink-0" onClick={handleLockOnClick}>
                <img className="w-[20px] h-[20px]" src={isLocked ? lockClose : lockOpen} />
            </button>

            <span className="w-[50px] items-center shrink-0 text-left truncate">{name}</span>
            
            {!start ? (
                <Slider
                    sliderWidth={210}
                    sliderHeight={5}
                    knobHeight={16}
                    knobWidth={16}
                    value={(field[0]?.values?.["maxSpeed"] ?? 0) / speedScale * 100}
                    
                    setValue={(v: number) => field[0]?.onChange({ maxSpeed: (v / 100) * speedScale })}
                    
                    OnChangeEnd={(sliderValue: number) => {
                        const currentPath = pathRef.current;
                        const realValue = (sliderValue / 100) * speedScale;

                        AddToUndoHistory({
                            path: {
                            ...currentPath,
                            segments: currentPath.segments.map((s) => 
                                s.id === segmentId 
                                ? { ...s, constants: { ...s.constants, maxSpeed: realValue } } 
                                : s
                            ),
                            }
                        });
                    }}
                />
            ) : (
                <div className="w-[230px]" />
            )}


            {!start && (
                <span className="w-6 shrink-0 text-left tabular-nums pl-1">
                {(field[0]?.values?.["maxSpeed"] ?? 0).toFixed(speedScale > 9.9 ? (speedScale > 99.9 ? 0 : 1) : 2)}
                </span>
            )}
            {directionField.length !== 0 && <div className="w-max flex flex-row items-center justify-end gap-2.5 pl-[12px]">
                {directionField.map((f, i) => (
                    <CycleImageButton
                        key={i}
                        imageKeys={f.imageKeys}
                        onKeyChange={(key: string | null) => {
                            updateUndoRef.current = true;
                            f.onKeyChange(key);
                        }}
                        value={f.value}
                    />
                ))}

            </div>}
            </button>
                <div
                className={`relative flex flex-col ml-9 gap-2 transition-all ${
                    isOpen ? "block" : "hidden"
                }`}
                >
                <div className="absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" />

                <CommandList command={command} setCommand={setCommand} />
                {field.map((f) => {
                    const fieldKeys = f.fields.map((m) => m.key);
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
                        onReset={() => {
                            AddToUndoHistory({path: path})
                            f.onChange(relevantDefaults)
                        }}
                        onSetDefault={(constants: Partial<any>) => {
                            AddToUndoHistory({
                            defaults: {
                                [format]: structuredClone(globalDefaultsStore.getState()[format]),
                            } as any,
                            });
                            f.setDefault(constants);
                        }}
                        defaults={relevantDefaults}
                    />
                    );
                })}
                </div>
        </div>
    );
}
