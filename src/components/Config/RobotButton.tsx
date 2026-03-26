import { useEffect, useRef, useState } from "react";
import Checkbox from "../Util/Checkbox";
import NumberInput from "../Util/NumberInput";
import { robotConstantsStore } from "../../core/Robot";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";
import { useFormat } from "../../hooks/useFormat";

export default function RobotButton() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const [ format ] = useFormat();

    const robot =  robotConstantsStore.useStore();
    
    const updateOmnis = (omni: boolean) => {
        robotConstantsStore.merge({ isOmni: omni });
    }
    
    const updateMecnum = (mecnum: boolean) => {
        robotConstantsStore.merge({ isMecnum: mecnum });
    }

    const updateWidth = (width: number | null) => {
        if (width !== null) {
            robotConstantsStore.merge({ width: width });   
        }
    }
    
    const updateHeight = (height: number | null) => {
        if (height !== null) {
            robotConstantsStore.merge({ height: height });
        }
    }
    
    const updateSpeed = (speed: number | null) => {
        if (speed !== null) {
            robotConstantsStore.merge({ speed: speed });
        }
    }
    
    const updateAccel = (accel: number | null) => {
        if (accel !== null) {
            robotConstantsStore.merge({ accel: accel });
        }
    }

    const updateCogOffsetX = (v: number | null) => {
        if (v !== null) robotConstantsStore.merge({ cogOffsetX: v });
    }

    const updateCogOffsetY = (v: number | null) => {
        if (v !== null) robotConstantsStore.merge({ cogOffsetY: v });
    }

    const updateExpansionFront  = (v: number | null) => { if (v !== null) robotConstantsStore.merge({ expansionFront: v }); }
    const updateExpansionLeft   = (v: number | null) => { if (v !== null) robotConstantsStore.merge({ expansionLeft: v }); }
    const updateExpansionRight  = (v: number | null) => { if (v !== null) robotConstantsStore.merge({ expansionRight: v }); }
    const updateExpansionRear   = (v: number | null) => { if (v !== null) robotConstantsStore.merge({ expansionRear: v }); }

    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        const handleClose = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleClose)
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleClose)
        }
    }, []);

    return (
        <div ref={menuRef} className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`}>

            <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
                <span className="text-[20px]">
                    Robot
                </span>
            </button>

            <div className={`absolute shadow-xs mt-1 shadow-black left-0 top-full w-43 z-40
                    rounded-sm bg-medgray_hover min-h-2 max-h-47 overflow-y-auto scrollbar-thin ${isOpen ? "" : "hidden"}`}>
                    <div className="flex flex-col mt-3 pl-3 pr-4 mb-1 gap-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between">
                            <span className="text-[16px]">Width</span>
                                    <NumberInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 30]}
                                        stepSize={1}
                                        roundTo={1} 
                                        units="in"
                                        value={robot.width} 
                                        setValue={updateWidth} 
                                        addToHistory={(width: number) => AddToUndoHistory({robot: {...robot, width: width}})}
                                    />
                            </div>

                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Height</span>
                                    <NumberInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 30]} 
                                        stepSize={1}
                                        roundTo={1}
                                        units="in"
                                        value={robot.height} 
                                        setValue={updateHeight} 
                                        addToHistory={(height: number) => AddToUndoHistory({robot: {...robot, height: height}})}
                                    />
                            </div>

                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Speed</span>
                                    <NumberInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 100]} 
                                        stepSize={.5}
                                        roundTo={2}
                                        units="ft/s"
                                        value={robot.speed} 
                                        setValue={updateSpeed} 
                                        addToHistory={(speed: number) => AddToUndoHistory( { robot: { ...robot, speed: speed}} )}
                                    />
                            </div>

                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Accel</span>
                                    <NumberInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 100]} 
                                        stepSize={1}
                                        roundTo={2}
                                        units="ft/s²"
                                        value={robot.accel} 
                                        setValue={updateAccel} 
                                        addToHistory={(accel: number) => AddToUndoHistory( {robot: { ...robot, accel: accel }} )}
                                    />
                            </div>

                            <div className="mt-0.5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-400 whitespace-nowrap">CoG Offset</span>
                                    <div className="flex-1 border-t border-gray-500/40"></div>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <span className="text-[16px]">Lateral</span>
                                    <NumberInput
                                        width={60}
                                        height={35}
                                        fontSize={16}
                                        bounds={[-15, 15]}
                                        stepSize={0.5}
                                        roundTo={2}
                                        units="in"
                                        value={robot.cogOffsetX}
                                        setValue={updateCogOffsetX}
                                        addToHistory={(v: number) => AddToUndoHistory({ robot: { ...robot, cogOffsetX: v } })}
                                    />
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <span className="text-[16px]">Forward</span>
                                    <NumberInput
                                        width={60}
                                        height={35}
                                        fontSize={16}
                                        bounds={[-15, 15]}
                                        stepSize={0.5}
                                        roundTo={2}
                                        units="in"
                                        value={robot.cogOffsetY}
                                        setValue={updateCogOffsetY}
                                        addToHistory={(v: number) => AddToUndoHistory({ robot: { ...robot, cogOffsetY: v } })}
                                    />
                                </div>
                            </div>

                            <div className="mt-0.5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-400 whitespace-nowrap">Expansion</span>
                                    <div className="flex-1 border-t border-gray-500/40"></div>
                                </div>
                                {(["Front", "Left", "Right", "Rear"] as const).map((side) => {
                                    const key = `expansion${side}` as "expansionFront" | "expansionLeft" | "expansionRight" | "expansionRear";
                                    const updater = { Front: updateExpansionFront, Left: updateExpansionLeft, Right: updateExpansionRight, Rear: updateExpansionRear }[side];
                                    return (
                                        <div key={side} className="flex flex-row items-center justify-between">
                                            <span className="text-[16px]">{side}</span>
                                            <NumberInput
                                                width={60}
                                                height={35}
                                                fontSize={16}
                                                bounds={[0, 30]}
                                                stepSize={0.5}
                                                roundTo={2}
                                                units="in"
                                                value={robot[key]}
                                                setValue={updater}
                                                addToHistory={(v: number) => AddToUndoHistory({ robot: { ...robot, [key]: v } })}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-0.5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-400 whitespace-nowrap">Lateral Friction</span>
                                    <div className="flex-1 border-t border-gray-500/40"></div>
                                </div>
                                <div className="flex flex-row items-center justify-between h-[35px]">
                                    <span className="text-[16px]">All Omnis</span>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <Checkbox checked={robot.isOmni} setChecked={(checked: boolean) => {
                                            updateOmnis(checked);
                                            AddToUndoHistory({robot: {...robot, isOmni: checked}});
                                        }} />
                                    </label>
                                </div>
                            </div>

                            {format === "ReveilLib" &&  <div className="mt-0.5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-400 whitespace-nowrap">Robot Type</span>
                                    <div className="flex-1 border-t border-gray-500/40"></div>
                                </div>
                                <div className="flex flex-row items-center justify-between h-[35px]">
                                    <span className="text-[16px]">Mecnum</span>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <Checkbox checked={robot.isMecnum} setChecked={(checked: boolean) => {
                                            updateMecnum(checked);
                                            AddToUndoHistory({robot: {...robot, isMecnum: checked}});
                                        }} />
                                    </label>
                                </div>
                            </div>}

                        </div>
        
                    </div>
                </div>
        </div>
    )
}