import { useEffect, useRef, useState } from "react";
import plus from "../../assets/plus.svg"
import { usePath } from "../../hooks/usePath";
import FieldMacros from "../../macros/FieldMacros";
import { useFormat } from "../../hooks/useFormat";
import { formatDefStore } from "../../simulation/FormatDefinition";

export default function AddSegmentButton() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [ , setPath] = usePath();
    const [ format,  ] = useFormat();
    const formatDef = formatDefStore.useStore();

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


                            { formatDef.segments["pointDrive"]?.exists &&
                                <button
                                onClick={() => addPointDriveSegment(format, { x: 0, y: 0 }, setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["pointDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">LMB</span>
                                </button>
                            }

                            { formatDef.segments["poseDrive"]?.exists &&
                                <button
                                onClick={() => addPoseDriveSegment(format, { x: 0, y: 0, angle: 0 }, setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["poseDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+LMB</span>
                                </button>
                            }

                            { formatDef.segments["distanceDrive"]?.exists &&
                                <button
                                    onClick={() => addDistanceSegment(format, { x: 0, y: 0, angle: 0 }, setPath)}
                                    className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["distanceDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">Alt+LMB</span>
                                </button>
                            }

                            {/* Turn Segments */}
                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>

                            { formatDef.segments["pointTurn"]?.exists &&
                                <button
                                    onClick={() => addPointTurnSegment(format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["pointTurn"].name}</span>
                                    <span className="text-lightgray text-[14px]">RMB</span>
                                </button>
                            }

                            { formatDef.segments["angleTurn"]?.exists &&
                                <button
                                    onClick={() => addAngleTurnSegment(format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{formatDef.segments["angleTurn"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+RMB</span>
                                </button>
                            }



                            {/* Swing Segments */}
                            { formatDef.segments["pointSwing"]?.exists &&
                                <>
                                    <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>
                                    <button
                                        onClick={() => addPointSwingSegment(format, setPath)}
                                        className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                        <span className="text-[16px]">{formatDef.segments["pointSwing"].name}</span>
                                        <span className="text-lightgray text-[14px]">Alt+RMB</span>
                                    </button>
                                </>
                            }

                            { formatDef.segments["angleSwing"]?.exists &&
                                <button
                                    onClick={() => addAngleSwingSegment(format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{formatDef.segments["angleSwing"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+Alt+RMB</span>
                                </button>
                            }                                       
{/* 
                            <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>
                            <button 
                                onClick={() => addSegmentGroup(setPath)}
                                className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                <span className="text-[16px]">Segment Group</span>
                                <span className="text-lightgray text-[14px]"></span>
                            </button> */}

                        </div>
        
                    </div>
                </div>
            )}
        </div>
    )
}