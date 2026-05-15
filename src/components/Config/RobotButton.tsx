import { useEffect, useRef, useState } from "react";
import Checkbox from "../Util/Checkbox";
import NumberInput from "../Util/NumberInput";
import { useFormat, mergeRobot, fileFormatStore, type Format } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { FORMAT_REGISTRY, getDefaultConstants, type FormatDef } from "../../simulation/FormatDefinition";
import Separator from "../Util/Separator";

export default function RobotButton() {
    const [format,] = useFormat();
    const [isOpen, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const prevFormatRef = useRef<Format>(format);

    const robot = fileFormatStore.useSelector(s => s.robot);

    // const updateOmnis = (omni: boolean) => {
    //     mergeRobot({ isOmni: omni });
    // }

    const updateWidth = (width: number | null) => {
        if (width !== null) {
            mergeRobot({ width: width });
        }
    }

    const updateHeight = (height: number | null) => {
        if (height !== null) {
            mergeRobot({ height: height });
        }
    }

    const updateSpeed = (speed: number | null) => {
        if (speed !== null) {
            mergeRobot({ speed: speed });
        }
    }

    const updateLateralTau = (v: number | null) => {
        if (v !== null) mergeRobot({ lateralTau: v });
    }

    const updateAngularTau = (v: number | null) => {
        if (v !== null) mergeRobot({ angularTau: v });
    }

    const updateCogOffsetX = (v: number | null) => {
        if (v !== null) mergeRobot({ cogOffsetX: v });
    }

    const updateCogOffsetY = (v: number | null) => {
        if (v !== null) mergeRobot({ cogOffsetY: v });
    }

    const updateExpansionFront = (v: number | null) => { if (v !== null) mergeRobot({ expansionFront: v }); }
    const updateExpansionLeft = (v: number | null) => { if (v !== null) mergeRobot({ expansionLeft: v }); }
    const updateExpansionRight = (v: number | null) => { if (v !== null) mergeRobot({ expansionRight: v }); }
    const updateExpansionRear = (v: number | null) => { if (v !== null) mergeRobot({ expansionRear: v }); }

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


    const changeFormat = (newFormat: Format) => {
        const changed = prevFormatRef.current !== newFormat;
        fileFormatStore.setState(prev => ({
            ...prev,
            format: newFormat,
            formatDef: FORMAT_REGISTRY[newFormat] as FormatDef<Format>,
            path: {
                ...prev.path,
                segments: prev.path.segments.map(s => ({
                    ...s,
                    format: newFormat,
                    constants: getDefaultConstants(undefined, newFormat, s.kind),
                })),
            },
        }));
        if (changed) saveSnapshot();
        prevFormatRef.current = newFormat;
    };

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
                                addToHistory={() => saveSnapshot()}
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
                                addToHistory={() => saveSnapshot()}
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
                                addToHistory={() => saveSnapshot()}
                            />
                        </div>

                        <div className="mt-0.5 flex flex-col gap-2">
                            <Separator name={"Time Constant (Accel)"} />
                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Drive</span>
                                <NumberInput
                                    width={60}
                                    height={35}
                                    fontSize={16}
                                    bounds={[0, 2]}
                                    stepSize={0.05}
                                    roundTo={2}
                                    units="s"
                                    value={robot.lateralTau}
                                    setValue={updateLateralTau}
                                    addToHistory={() => saveSnapshot()}
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <span className="text-[16px]">Turn</span>
                                <NumberInput
                                    width={60}
                                    height={35}
                                    fontSize={16}
                                    bounds={[0, 2]}
                                    stepSize={0.05}
                                    roundTo={2}
                                    units="s"
                                    value={robot.angularTau}
                                    setValue={updateAngularTau}
                                    addToHistory={() => saveSnapshot()}
                                />
                            </div>
                        </div>

                        <div className="mt-0.5 flex flex-col gap-2">
                            <Separator name={"Expansion"} />
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
                                            addToHistory={() => saveSnapshot()}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-0.5 flex flex-col gap-2">
                            <Separator name={"CoG Offset"} />
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
                                    addToHistory={() => saveSnapshot()}
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
                                    addToHistory={() => saveSnapshot()}
                                />
                            </div>
                        </div>

                        {/* <div className="mt-0.5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-400 whitespace-nowrap">Lateral Friction</span>
                                    <div className="flex-1 border-t border-gray-500/40"></div>
                                </div>
                                <div className="flex flex-row items-center justify-between h-[35px]">
                                    <span className="text-[16px]">All Omnis</span>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <Checkbox checked={robot.isOmni} setChecked={(checked: boolean) => {
                                            updateOmnis(checked);
                                            saveSnapshot();
                                        }} />
                                    </label>
                                </div>
                            </div> */}

                        {(format === "mikLib" || format === "Holonomic") && <div className="mt-0.5 flex flex-col gap-2">
                            <Separator name={"Robot Type"} />
                            <div className="flex flex-row items-center justify-between h-[35px]">
                                <span className="text-[16px]">Holonomic</span>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <Checkbox checked={format === "Holonomic"} setChecked={(checked: boolean) => {
                                        changeFormat(checked ? "Holonomic" : "mikLib");
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