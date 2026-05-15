import { useEffect, useRef, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import clockClose from "../../assets/clock-close.svg";
import clockOpen from "../../assets/clock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import Slider from "../Util/Slider";
import { usePath, useFormatDef } from "../../hooks/useFileFormat";
import type { ConstantField } from "./ConstantRow";
import ConstantsList from "./ConstantsList";
import CycleImageButton, { type CycleImageButtonProps } from "../Util/CycleButton";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { setupDragTransfer } from "./PathConfigUtils";
import { activeSimSegmentStore, computedPathStore, pathTelemetry, simJumpStore } from "../../core/ComputePathSim";
import { roundNum } from "../../core/Util";
import type { ConstantsRecord } from "../../simulation/FormatDefinition";
import type { Segment } from "../../core/Types/Segment";

export type ConstantListField = {
    header: string;
    values: ConstantsRecord;
    fields: ConstantField[];
    defaults: ConstantsRecord;
    onChange: (partial: Partial<ConstantsRecord>) => void;
    setDefault: (partial: Partial<ConstantsRecord>) => void;
    onApply: (partial: Partial<ConstantsRecord>) => void;
}

type MotionListProps = {
    name: string;
    field: ConstantListField[] | undefined;
    directionField: CycleImageButtonProps[] | undefined;
    segmentId: string;
    index: number;
    isOpenGlobal: boolean;
    isTelemetryOpenGlobal?: boolean;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnter?: () => void;
    draggingIds?: string[];
    shrink?: boolean;
}

export default function MotionList({
    name,
    field,
    directionField,
    segmentId,
    index,
    isOpenGlobal,
    isTelemetryOpenGlobal,
    draggable = false,
    onDragStart,
    onDragEnd,
    onDragEnter,
    draggingIds = [],
    shrink = false,
}: MotionListProps) {
    const [path, setPath] = usePath();
    const formatDef = useFormatDef();

    const sliderKey = String(formatDef.slider.key);
    const speedScale = formatDef.kMaxSpeed;

    const segment = path.segments.find(s => s.id === segmentId)!;
    const selected = segment?.selected;
    const activeSimSegment = activeSimSegmentStore.useStore();

    const [isEyeOpen, setEyeOpen] = useState(true);
    const [isTelemetryOpen, setTelemetryOpen] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const pathRef = useRef(path);
    pathRef.current = path;

    const normalSelect = () => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(s =>
                s.id === segmentId ? { ...s, selected: true } : { ...s, selected: false }
            ),
        }));
    };

    const ctrlSelect = () => {
        setPath(prev => {
            const willSelect = !prev.segments.find(s => s.id === segmentId)?.selected;
            return {
                ...prev,
                segments: prev.segments.map(s =>
                    s.id === segmentId ? { ...s, selected: willSelect } : s
                ),
            };
        });
    };

    const shiftSelect = () => {
        setPath(prev => {
            const segments = prev.segments;
            const clickedIdx = segments.findIndex(s => s.id === segmentId);
            if (clickedIdx === -1) return prev;

            let anchorIdx = -1;
            for (let i = segments.length - 1; i >= 0; i--) {
                if (segments[i].selected) { anchorIdx = i; break; }
            }
            if (anchorIdx === -1) anchorIdx = clickedIdx;

            const rangeStart = Math.min(anchorIdx, clickedIdx);
            const rangeEnd = Math.max(anchorIdx, clickedIdx);

            return {
                ...prev,
                segments: segments.map((s, i) => ({ ...s, selected: i >= rangeStart && i <= rangeEnd })),
            };
        });
    };

    const handleOnClick = (evt: React.PointerEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        if (evt.button === 0 && evt.ctrlKey) { ctrlSelect(); return; }
        if (evt.button === 0 && evt.shiftKey) { shiftSelect(); return; }
        if (evt.button === 0) { normalSelect(); return; }
    };

    const startHover = () => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(s =>
                s.id === segmentId ? { ...s, hovered: true } : { ...s, hovered: false }
            ),
        }));
    };

    const endHover = () => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(s => ({ ...s, hovered: false })),
        }));
    };

    useEffect(() => { setOpen(isOpenGlobal); }, [isOpenGlobal]);
    useEffect(() => { if (isTelemetryOpenGlobal !== undefined) setTelemetryOpen(isTelemetryOpenGlobal); }, [isTelemetryOpenGlobal]);

    const toggleSegment = (patch: (s: Segment) => Segment) => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(s => (s.id === segmentId ? patch(s) : s)),
        }));
        saveSnapshot();
    };

    const handleEyeOnClick = () => {
        toggleSegment(s => ({ ...s, visible: !s.visible }));
    };

    useEffect(() => { setEyeOpen(segment.visible); }, [segment.visible]);

    const getValuesFromKeys = (keys: string[], obj: ConstantsRecord): ConstantsRecord => {
        const result: ConstantsRecord = {};
        for (const key of keys) {
            if (key in obj) result[key] = obj[key];
        }
        return result;
    };

    const telemetrySlice = pathTelemetry.getState()?.[index];

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const computedPath = computedPathStore.getState();
        const startT = computedPath.segmentTrajectorys[index]?.[0]?.t ?? 0;
        const percent = computedPath.totalTime > 0 ? (startT / computedPath.totalTime) * 100 : 0;
        simJumpStore.setState(percent);
    };

    const sliderValue = field?.[0]?.values?.[sliderKey];
    const sliderNum = typeof sliderValue === 'number' ? sliderValue : 0;
    const speedDecimals = speedScale > 99.9 ? 0 : speedScale > 9.9 ? 1 : 2;

    return (
        <div
            className={`flex flex-col gap-2 mt-[1px] ${segment.locked ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => { if (selected) setOpen(!isOpen); }}
        >
            <button
                draggable={draggable && !segment.locked}
                onDragStart={(e) => {
                    setupDragTransfer(e, segmentId);
                    if (onDragStart) onDragStart(e);
                }}
                onDragEnd={(e) => { if (onDragEnd) onDragEnd(e); }}
                onDragEnter={() => { if (onDragEnter) onDragEnter(); }}
                onClick={handleOnClick}
                onContextMenu={handleContextMenu}
                onMouseEnter={startHover}
                onMouseLeave={endHover}
                style={{ width: `${!shrink ? 450 : 400}px` }}
                className={`${selected ? "bg-medlightgray" : ""}
                    relative flex flex-row justify-start items-center
                    h-[35px] gap-[12px]
                    bg-medgray
                    hover:brightness-92
                    rounded-lg pl-4 pr-4
                    transition-all duration-100
                    active:scale-[0.995]
                    ${isOpen && !selected ? "border-2 border-medlightgray" : "border-2 border-transparent"}
                    ${draggingIds.includes(segmentId) ? "opacity-10" : ""}
                `}
            >
                <div className={`absolute left-0 top-[20%] h-[60%] w-[3px] rounded-full bg-lightgray transition-opacity duration-150 ${activeSimSegment === index ? "opacity-100" : "opacity-0"}`} />

                <button
                    className="cursor-pointer shrink-0"
                    onClick={(e) => { e.stopPropagation(); setOpen(!isOpen); }}
                >
                    <img className={`w-[15px] h-[15px] transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} src={downArrow} />
                </button>

                <button className="cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); handleEyeOnClick(); }}>
                    <img className="w-[20px] h-[20px]" src={isEyeOpen ? eyeOpen : eyeClosed} />
                </button>

                <button className="cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); setTelemetryOpen(!isTelemetryOpen); }}>
                    <img className="w-[20px] h-[20px]" src={isTelemetryOpen ? clockClose : clockOpen} />
                </button>

                <span className="shrink-0 text-left truncate max-w-[130px]">{name}</span>

                {segment.kind !== "start" && field !== undefined && (
                    <div onClick={(e) => e.stopPropagation()} className="flex-1 min-w-0 flex items-center gap-3">
                        <Slider
                            sliderHeight={5}
                            knobHeight={16}
                            knobWidth={16}
                            value={sliderNum / speedScale * 100}
                            setValue={(v: number) => field[0]?.onChange({ [sliderKey]: (v / 100) * speedScale })}
                            OnChangeEnd={() => { saveSnapshot(); }}
                        />
                        <span className="shrink-0 relative tabular-nums">
                            <span className="invisible">{speedScale.toFixed(speedDecimals)}</span>
                            <span className="absolute inset-0 text-left">{sliderNum.toFixed(speedDecimals)}</span>
                        </span>
                    </div>
                )}

                {directionField !== undefined && directionField.length !== 0 && (
                    <div onClick={(e) => e.stopPropagation()} className="ml-auto flex flex-row items-center gap-2.5">
                        {directionField.map((f, i) => (
                            <CycleImageButton
                                key={i}
                                imageKeys={f.imageKeys}
                                onKeyChange={(key: string | null) => {
                                    f.onKeyChange(key);
                                    saveSnapshot();
                                }}
                                value={f.value}
                            />
                        ))}
                    </div>
                )}
            </button>

            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative flex flex-col ml-9 gap-2 ${
                    (!isTelemetryOpen || telemetrySlice === undefined) && !isOpen ? "hidden" : ""
                }`}
            >
                <div className="absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" />

                {isTelemetryOpen && telemetrySlice !== undefined && (
                    <div className="flex pl-1.5 gap-2 text-left">
                        <span>Time: {roundNum(telemetrySlice.totalTime)}<span className="text-[8px] text-lightgray align-super leading-none"> s</span></span>
                        <span>Distance: {roundNum(telemetrySlice.totalDistance)}<span className="text-[8px] text-lightgray align-super leading-none"> {telemetrySlice.units}</span></span>
                        <span>Traveled: {roundNum(telemetrySlice.progressRaw)}<span className="text-[8px] text-lightgray align-super leading-none"> {telemetrySlice.units}</span>  {roundNum(telemetrySlice.progressPercent)}<span className="text-[10px] text-lightgray align-super leading-none"> %</span></span>
                    </div>
                )}

                {isOpen && field !== undefined && field.map((f) => {
                    const fieldKeys = f.fields.map(m => m.key);
                    const relevantValues = getValuesFromKeys(fieldKeys, f.values);
                    const relevantDefaults = getValuesFromKeys(fieldKeys, f.defaults);

                    return (
                        <ConstantsList
                            key={f.header}
                            header={f.header}
                            fields={f.fields}
                            values={relevantValues}
                            isOpenGlobal={false}
                            onChange={f.onChange}
                            onReset={() => {
                                f.onChange(relevantDefaults);
                                saveSnapshot();
                            }}
                            onSetDefault={(constants) => {
                                f.setDefault(constants);
                                saveSnapshot();
                            }}
                            onApply={f.onApply}
                            defaults={relevantDefaults}
                        />
                    );
                })}
            </div>
        </div>
    );
}
