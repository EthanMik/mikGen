import { useEffect, useRef, useState } from "react";
import plus from "../../assets/plus.svg"
import { usePath } from "../../hooks/usePath";
import { createAngleTurnSegment, type Segment } from "../../core/Types/Segment";
import FieldMacros from "../../macros/FieldMacros";
import { useFormat } from "../../hooks/useFormat";

export default function AddSegmentButton() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [ path, setPath] = usePath();
    const [ format, setFormat ] = useFormat();

    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }

    const {
        addPointDriveSegment,
        addPointTurnSegment,
        addPoseDriveSegment,
        addAngleTurnSegment,
        addAngleSwingSegment,
        addPointSwingSegment,
    } = FieldMacros();


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, []);

    return (
        <div ref={menuRef} className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`}>

            <button onClick={handleToggleMenu} className="px-1 py-1 cursor-pointer">
                <img className="block w-[16px] h-[16px] hover:bg-medgray_hover"
                    src={plus}
                />
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black right-0 top-full w-40 z-40
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2">
                        <div className="flex flex-col">

                            {/* Drive Segments */}
                            <div className="flex pl-2 mt-1 py-0.5 mb-1 bg-medgray rounded-sm">
                                <span className="text-[16px]">Drive Segment:</span>
                            </div>

                            {/* <button className="flex pr-1 pl-2 py-0.5 justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Distance</span>
                                <span className="text-lightgray text-[14px]">ctrl+1</span>
                            </button> */}

                            <button 
                                onClick={() => addPointDriveSegment(format, { x: 0, y: 0 }, setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Point</span>
                                <span className="text-lightgray text-[14px]">LMB</span>
                            </button>

                            <button 
                                onClick={() => addPoseDriveSegment(format, { x: 0, y: 0, angle: 0 }, setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Pose</span>
                                <span className="text-lightgray text-[14px]">Ctrl+LMB</span>
                            </button>

                            {/* <button className="flex pr-1 pl-2 py-0.5 justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Path</span>
                                <span className="text-lightgray text-[14px]">ctrl+4</span>
                            </button> */}

                            {/* Turn Segments */}
                            <div 
                                className="flex pl-2 py-0.5 mt-2 mb-1 bg-medgray rounded-sm">
                                <span className="text-[16px]">Turn Segment:</span>
                            </div>

                            <button
                                onClick={() => addAngleTurnSegment(format, setPath)}
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                <span className="text-[16px]">Angle</span>
                                <span className="text-lightgray text-[14px]">RMB</span>
                            </button>

                            <button
                                onClick={() => addPointTurnSegment(format, setPath)} 
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Point</span>
                                <span className="text-lightgray text-[14px]">Ctrl+RMB</span>
                            </button>

                            {/* Swing Segments */}
                            <div 
                                className="flex pl-2 py-0.5 mt-2 mb-1 bg-medgray rounded-sm">
                                <span className="text-[16px]">Swing Segment:</span>
                            </div>

                            <button
                                onClick={() => addAngleSwingSegment(format, setPath)}
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                <span className="text-[16px]">Angle</span>
                                <span className="text-lightgray text-[14px]">Alt+RMB</span>
                            </button>

                            <button 
                                onClick={() => addPointSwingSegment(format, setPath)} 
                                className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Point</span>
                                <span className="text-lightgray text-[14px]">Ctrl+Alt+RMB</span>
                            </button>
                        </div>
        
                    </div>
                </div>
            )}
        </div>
    )
}