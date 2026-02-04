import { useEffect, useRef, useState } from "react";
import plus from "../../assets/plus.svg"
import { usePath } from "../../hooks/usePath";
import FieldMacros from "../../macros/FieldMacros";
import { useFormat } from "../../hooks/useFormat";
import { getSegmentName, segmentAllowed } from "../../core/DefaultConstants";

export default function AddSegmentButton() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [ , setPath] = usePath();
    const [ format,  ] = useFormat();

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
        addDistanceSegment,
        addSegmentGroup,
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
                <div className="absolute shadow-xs mt-1 shadow-black right-0 top-full w-62 z-40
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2">
                        <div className="flex flex-col">

                            {/* Drive Segments */}


                            { segmentAllowed(format, "pointDrive") &&
                                <button
                                onClick={() => addPointDriveSegment(format, { x: 0, y: 0 }, setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{getSegmentName(format, "pointDrive")}</span>
                                    <span className="text-lightgray text-[14px]">LMB</span>
                                </button>
                            }

                            { segmentAllowed(format, "poseDrive") &&
                                <button
                                onClick={() => addPoseDriveSegment(format, { x: 0, y: 0, angle: 0 }, setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{getSegmentName(format, "poseDrive")}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+LMB</span>
                                </button>
                            }

                            {/* { segmentAllowed(format, "distanceDrive") &&
                                <button
                                    onClick={() => addDistanceSegment(format, { x: 0, y: 0, angle: 0 }, setPath)}
                                    className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{getSegmentName(format, "distanceDrive")}</span>
                                    <span className="text-lightgray text-[14px]">Alt+LMB</span>
                                </button>
                            } */}

                            {/* Turn Segments */}
                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>

                            { segmentAllowed(format, "pointTurn") &&
                                <button
                                    onClick={() => addPointTurnSegment(format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{getSegmentName(format, "pointTurn")}</span>
                                    <span className="text-lightgray text-[14px]">RMB</span>
                                </button>
                            }

                            { segmentAllowed(format, "angleTurn") &&
                                <button
                                    onClick={() => addAngleTurnSegment(format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{getSegmentName(format, "angleTurn")}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+RMB</span>
                                </button>
                            }



                            {/* Swing Segments */}
                            { segmentAllowed(format, "pointSwing") && 
                                <>
                                    <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>
                                    <button 
                                        onClick={() => addPointSwingSegment(format, setPath)} 
                                        className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                        <span className="text-[16px]">{getSegmentName(format, "pointSwing")}</span>
                                        <span className="text-lightgray text-[14px]">Alt+RMB</span>
                                    </button>
                                </>
                            }

                            { segmentAllowed(format, "angleSwing") &&
                                <button
                                    onClick={() => addAngleSwingSegment(format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{getSegmentName(format, "angleSwing")}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+Alt+RMB</span>
                                </button>
                            }                                       

                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>
                            <button 
                                onClick={() => addSegmentGroup(setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Segment Group</span>
                                <span className="text-lightgray text-[14px]"></span>
                            </button>

                        </div>
        
                    </div>
                </div>
            )}
        </div>
    )
}