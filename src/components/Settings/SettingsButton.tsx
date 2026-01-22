import { useEffect, useRef, useState } from "react";
import Checkbox from "../Util/Checkbox";
import { useSettings } from "../../hooks/useSettings";

export default function SettingsButton() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const [ settings, setSettings ] = useSettings();

    const ghostRobots = settings.ghostRobots;
    const setGhostRobots = (state: boolean) => {
        setSettings(prev => ({
            ...prev,
            ghostRobots: state
        }))
    }

    const robotPosition = settings.robotPosition;
    const setRobotPosition = (state: boolean) => {
        setSettings(prev => ({
            ...prev,
            robotPosition: state
        }))
    }

    const precisePath = settings.precisePath;
    const setPrecisePath = (state: boolean) => {
        setSettings(prev => ({
            ...prev,
            precisePath: state
        }))
    }


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
                    Settings
                </span>
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-45 z-40
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-3 pl-3 pr-3 mb-3 gap-3">
                        <div className="flex flex-row gap-2">
                            {/* <div className="mt-0.5 pt-2 border-t border-gray-500/40 flex flex-row items-center justify-between h-[35px]"> */}
                            <span className="whitespace-nowrap text-[16px]">Robot Outlines</span>

                            <div className="w-25 flex items-center justify-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox checked={ghostRobots} setChecked={setGhostRobots} />
                                </label>
                            </div>

                        </div>
                        <div className="flex flex-row gap-2">

                            <span className="whitespace-nowrap text-[16px]">Robot Position</span>

                            <div className="w-25 flex items-center justify-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox checked={robotPosition} setChecked={setRobotPosition} />
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">

                            <span className="whitespace-nowrap text-[16px]">Precise Path</span>

                            <div className="w-25 flex items-center justify-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox checked={precisePath} setChecked={setPrecisePath} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}