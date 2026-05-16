import { useEffect, useRef, useState } from "react";
import plus from "../../assets/plus.svg"
import FieldMacros from "../../macros/FieldMacros";
import { usePath, useFormat, fileFormatStore } from "../../hooks/useFileFormat";
import Separator from "../Util/Separator";

export default function AddSegmentButton() {
    const [isOpen, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [, setPath] = usePath();
    const [format,] = useFormat();
    const formatDef = fileFormatStore.useSelector(s => s.formatDef);

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
        addStartSegment,
        addStrafeSegment,
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


                            {formatDef.segments["pointDrive"] && !formatDef.segments["pointDrive"].castTo &&
                                <button
                                    onClick={() => addPointDriveSegment(null, format, { x: 0, y: 0 }, setPath)}
                                    className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["pointDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">LMB</span>
                                </button>
                            }

                            {formatDef.segments["poseDrive"] && !formatDef.segments["poseDrive"].castTo &&
                                <button
                                    onClick={() => addPoseDriveSegment(null, format, { x: 0, y: 0, angle: 0 }, setPath)}
                                    className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["poseDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+LMB</span>
                                </button>
                            }

                            <Separator name="" />


                            {formatDef.segments["distanceDrive"] && !formatDef.segments["distanceDrive"].castTo &&
                                <button
                                    onClick={() => addDistanceSegment(null, format, { x: 0, y: 0, angle: null }, setPath)}
                                    className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["distanceDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">Alt+LMB</span>
                                </button>
                            }

                            {formatDef.segments["strafeDrive"] && !formatDef.segments["strafeDrive"].castTo &&
                                <button
                                    onClick={() => addStrafeSegment(null, format, { x: 0, y: 0, angle: null }, setPath)}
                                    className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["strafeDrive"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+Alt+LMB</span>
                                </button>
                            }

                            {/* Turn Segments */}
                            <Separator name="" />

                            {formatDef.segments["pointTurn"] && !formatDef.segments["pointTurn"].castTo &&
                                <button
                                    onClick={() => addPointTurnSegment(null, format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                    <span className="text-[16px]">{formatDef.segments["pointTurn"].name}</span>
                                    <span className="text-lightgray text-[14px]">RMB</span>
                                </button>
                            }

                            {formatDef.segments["angleTurn"] && !formatDef.segments["angleTurn"].castTo &&
                                <button
                                    onClick={() => addAngleTurnSegment(null, format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{formatDef.segments["angleTurn"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+RMB</span>
                                </button>
                            }

                            <Separator name="" />

                            {/* Swing Segments */}
                            {formatDef.segments["pointSwing"] && !formatDef.segments["pointSwing"].castTo &&
                                <>
                                    <button
                                        onClick={() => addPointSwingSegment(null, format, setPath)}
                                        className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
                                        <span className="text-[16px]">{formatDef.segments["pointSwing"].name}</span>
                                        <span className="text-lightgray text-[14px]">Alt+RMB</span>
                                    </button>
                                </>
                            }

                            {formatDef.segments["angleSwing"] && !formatDef.segments["angleSwing"].castTo &&
                                <button
                                    onClick={() => addAngleSwingSegment(null, format, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{formatDef.segments["angleSwing"].name}</span>
                                    <span className="text-lightgray text-[14px]">Ctrl+Alt+RMB</span>
                                </button>
                            }

                            <Separator name="" />

                            {formatDef.segments["start"] && !formatDef.segments["start"].castTo &&
                                <button
                                    onClick={() => addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath)}
                                    className="flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">

                                    <span className="text-[16px]">{formatDef.segments["start"].name}</span>
                                    <span className="text-lightgray text-[14px]"></span>
                                </button>
                            }

                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}