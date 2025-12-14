import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import UserInput from "../Util/UserInput";
import { clamp } from "../../core/Util";
import { robotConstants, robotConstantsStore } from "../../core/Robot";
import Checkbox from "../Util/Checkbox";

export default function RobotButton() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const robot =  useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.get);
    const [ holonomic, setHolonomic ] = useState(false);

    const updateWidth = (width: number | null) => {
        if (width !== null) robotConstantsStore.set({ width: width });   
    }

    const updateHeight = (height: number | null) => {
        if (height !== null) robotConstantsStore.set({ height: height });
    }
    
    const updateSpeed = (speed: number | null) => {
        if (speed !== null) robotConstantsStore.set({ speed: speed });
    }

    const updateAccel = (accel: number | null) => {
        if (accel !== null) robotConstantsStore.set({ accel: accel });
    }

    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }

    const close = (evt: React.KeyboardEvent) => {
        if (evt.key === "Escape") {
            setOpen(false);
        }
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

            <button onClick={handleToggleMenu} className="px-3 py-1 cursor-pointer">
                <span className="text-[20px]">
                    Robot
                </span>
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-50 z-40
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-2 pl-3 pr-3 mb-2 gap-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Width:</span>
                                <div className="w-25">
                                    <UserInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 30]} 
                                        value={robot.width} 
                                        setValue={updateWidth} 
                                    />
                                    <span className="pl-2 w-12 text-lightgray text-[14px]">in </span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Height:</span>
                                <div className="w-25">
                                    <UserInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 30]} 
                                        value={robot.height} 
                                        setValue={updateHeight} 
                                    />
                                    <span className="pl-2 text-lightgray text-[14px]">in</span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Speed:</span>
                                <div className="w-25">
                                    <UserInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 100]} 
                                        value={robot.speed} 
                                        setValue={updateSpeed} 
                                    />
                                    <span className="pl-2 text-lightgray text-[14px]">ft/s</span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Accel:</span>
                                <div className="w-25">
                                    <UserInput 
                                        width={60} 
                                        height={35}
                                        fontSize={16} 
                                        bounds={[0, 100]} 
                                        value={robot.accel} 
                                        setValue={updateAccel} 
                                    />
                                    <span className="pl-2 text-lightgray text-[14px]">ft/s²</span>
                                </div>
                            </div>

                            <div className="mt-0.5 pt-2 border-t border-gray-500/40 flex flex-row items-center justify-between h-[35px]">
                            <span className="text-[16px]">Holonomic:</span>

                            <div className="w-25 flex items-center justify-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox checked={holonomic} setChecked={setHolonomic} />
                                </label>
                            </div>
                            </div>

                        </div>
        
                    </div>
                </div>
            )}
        </div>
    )
}