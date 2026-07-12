import { memo, useEffect, useMemo, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import clockClose from "../../assets/clock-close.svg";
import clockOpen from "../../assets/clock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import Slider from "../Util/Slider";
import { useFormatDef, fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import type { ConstantField } from "./ConstantRow";
import ConstantsList from "./ConstantsList";
import CycleImageButton, { type CycleImageButtonProps } from "../Util/CycleButton";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { setupDragTransfer } from "./PathConfigUtils";
import { activeSimSegmentStore, computedPathStore, pathTelemetry, simJumpStore } from "../../core/ComputePathSim";
import { roundNum } from "../../core/Util";
import { hoveredSegmentStore } from "../../core/HoverStore";
import {
    updatePathConstants,
    updatePathConstantsByKind,
    updateDefaultConstants,
    type ConstantsRecord,
    type FormatConstants,
    type Format,
} from "../../simulation/FormatDefinition";

type ConstantListField = {
    constantsIdx: number;
    header: string;
    values: ConstantsRecord;
    fields: ConstantField[];
    defaults: ConstantsRecord;
    onChange: (partial: Partial<ConstantsRecord>) => void;
    setDefault: (partial: Partial<ConstantsRecord>) => void;
    onApply: (partial: Partial<ConstantsRecord>) => void;
}

type MotionListProps = {
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

const MotionList = memo(function MotionList({
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
    const segment = fileFormatStore.useSelector(s => s.path.segments.find(seg => seg.id === segmentId))!;
    const formatDef = useFormatDef();
    const isActiveSimSegment = activeSimSegmentStore.useSelector(s => s === index);

    const segDef = formatDef.segments[segment?.kind];
    const name = segDef?.name ?? "";

    const sliderDef = segDef?.slider;
    const sliderKey = sliderDef ? String(sliderDef.key) : "";
    const sliderConstantsIdx = sliderDef?.constantsIdx ?? 0;
    const speedScale = sliderDef?.bounds[1] ?? 1;
    const selected = segment?.selected;

    const [isEyeOpen, setEyeOpen] = useState(true);
    const [isTelemetryOpen, setTelemetryOpen] = useState(false);
    const [isOpen, setOpen] = useState(false);

    const normalSelect = () => {
        updatePath(prev => ({
            ...prev,
            segments: prev.segments.map(s =>
                s.id === segmentId ? { ...s, selected: true } : { ...s, selected: false }
            ),
        }));
    };

    const ctrlSelect = () => {
        updatePath(prev => {
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
        updatePath(prev => {
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
        if (evt.button === 0) {
            if (selected) setOpen(prev => !prev);
            normalSelect();
            return;
        }
    };

    useEffect(() => { setOpen(isOpenGlobal); }, [isOpenGlobal]);
    useEffect(() => { if (isTelemetryOpenGlobal !== undefined) setTelemetryOpen(isTelemetryOpenGlobal); }, [isTelemetryOpenGlobal]);

    const handleEyeOnClick = () => {
        updatePath(prev => {
            const affected = prev.segments.filter(s => s.id === segmentId || s.selected);
            const anyVisible = affected.some(s => s.visible);
            return {
                ...prev,
                segments: prev.segments.map(s =>
                    s.id === segmentId || s.selected ? { ...s, visible: anyVisible ? false : true } : s
                ),
            };
        });
        saveSnapshot();
    }

    useEffect(() => { setEyeOpen(segment?.visible); }, [segment?.visible]);

    const getValuesFromKeys = (keys: string[], obj: ConstantsRecord): ConstantsRecord => {
        const result: ConstantsRecord = {};
        for (const key of keys) {
            if (key in obj) result[key] = obj[key];
        }
        return result;
    };

    const telemetrySlice = pathTelemetry.useSelector(s => isTelemetryOpen ? s[index] : undefined);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const computedPath = computedPathStore.getState();
        const startT = computedPath.segmentTrajectorys[index]?.[0]?.t ?? 0;
        const percent = computedPath.totalTime > 0 ? (startT / computedPath.totalTime) * 100 : 0;
        simJumpStore.setState(percent);
    };

    const field = useMemo<ConstantListField[]>(() => {
        if (!segment || !segDef) return [];
        const segRecord = segment as unknown as ConstantsRecord;
        return (segDef.numberInputs ?? []).map(group => {
            const constValues = segment.constants[group.constantsIdx] as unknown as ConstantsRecord;
            const isSegKey = (key: string) =>
                key in segment && typeof segRecord[key] === 'number' && !(key in constValues);
            const splitPatch = (partial: Partial<ConstantsRecord>) => {
                const segPatch: Record<string, unknown> = {};
                const constPatch: Partial<FormatConstants[Format]> = {};
                for (const [k, v] of Object.entries(partial)) {
                    if (isSegKey(k)) segPatch[k] = v;
                    else (constPatch as Record<string, unknown>)[k] = v;
                }
                return { segPatch, constPatch };
            };
            const applySegPatch = (segPatch: Record<string, unknown>, allOfKind = false) =>
                updatePath(prev => ({
                    ...prev,
                    segments: prev.segments.map(s =>
                        (allOfKind ? s.kind === segment.kind : s.id === segmentId) ? { ...s, ...segPatch } : s
                    ),
                }));
            return {
                constantsIdx: group.constantsIdx,
                header: group.headerName,
                values: { ...segRecord, ...constValues },
                fields: group.fields.map(f => ({ key: String(f.key), label: f.label, units: f.units, input: f.input })),
                defaults: {
                    ...segRecord,
                    ...(formatDef.segments[segment.kind]?.defaults?.[group.constantsIdx] ?? formatDef.constants[0]) as unknown as ConstantsRecord,
                },
                onChange: (partial: Partial<ConstantsRecord>) => {
                    const { segPatch, constPatch } = splitPatch(partial);
                    if (Object.keys(segPatch).length > 0) applySegPatch(segPatch);
                    if (Object.keys(constPatch).length > 0) updatePathConstants(updatePath, segmentId, group.constantsIdx, constPatch);
                },
                setDefault: (partial: Partial<ConstantsRecord>) => {
                    const constOnly = Object.fromEntries(Object.entries(partial).filter(([k]) => !isSegKey(k)));
                    if (Object.keys(constOnly).length > 0) fileFormatStore.setState(prev => ({
                        ...prev,
                        formatDef: updateDefaultConstants(prev.formatDef, segment.kind, group.constantsIdx, constOnly as Partial<FormatConstants[Format]>),
                    }));
                },
                onApply: (partial: Partial<ConstantsRecord>) => {
                    const { segPatch, constPatch } = splitPatch(partial);
                    if (Object.keys(segPatch).length > 0) applySegPatch(segPatch, true);
                    if (Object.keys(constPatch).length > 0) updatePathConstantsByKind(updatePath, segment.kind, group.constantsIdx, constPatch);
                },
            };
        });
    }, [segment, segDef, segmentId, formatDef]);

    const fieldSections = useMemo(() => field.map(f => {
        const fieldKeys = f.fields.map(m => m.key);
        const relevantValues = getValuesFromKeys(fieldKeys, f.values);
        const relevantDefaults = getValuesFromKeys(fieldKeys, f.defaults);
        return {
            header: f.header,
            fields: f.fields,
            values: relevantValues,
            defaults: relevantDefaults,
            onChange: f.onChange,
            onApply: f.onApply,
            onReset: () => { f.onChange(relevantDefaults); saveSnapshot(); },
            onSetDefault: (constants: Partial<ConstantsRecord>) => { f.setDefault(constants); saveSnapshot(); },
        };
    }), [field]);

    const directionField = useMemo<CycleImageButtonProps[]>(() => {
        if (!segment || !segDef) return [];
        return (segDef.cycleButtons ?? []).map(btn => ({
            imageKeys: btn.keyValues.map(kv => ({ src: kv.srcImg, key: String(kv.value) })) as CycleImageButtonProps["imageKeys"],
            label: String(btn.key),
            value: btn.poseValue
                ? btn.poseValue(segment.pose)
                : String((segment.constants[btn.constantsIdx] as unknown as ConstantsRecord)[String(btn.key)]),
            onKeyChange: (newKey: string | null) => {
                const match = btn.keyValues.find(kv => String(kv.value) === newKey);
                if (match !== undefined) {
                    if (!btn.poseValue) updatePathConstants(updatePath, segmentId, btn.constantsIdx, { [String(btn.key)]: match.value } as Partial<FormatConstants[Format]>);
                    const posePartial = btn.poseEffect?.(match.value as never);
                    if (posePartial) {
                        updatePath(prev => ({
                            ...prev,
                            segments: prev.segments.map(s =>
                                s.id === segmentId ? { ...s, pose: { ...s.pose, ...posePartial } } : s
                            ),
                        }));
                    }
                }
            },
        }));
    }, [segment, segDef, segmentId]);

    if (!segment) return null;

    const sliderField = field.find(f => f.constantsIdx === sliderConstantsIdx) ?? field[0];
    const sliderSegmentRaw = sliderKey in segment ? (segment as Record<string, unknown>)[sliderKey] : undefined;
    const isSegmentKey = typeof sliderSegmentRaw === 'number';
    const sliderValue = isSegmentKey ? sliderSegmentRaw : sliderField?.values?.[sliderKey];
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
                onMouseEnter={() => hoveredSegmentStore.setState(segmentId)}
                onMouseLeave={() => hoveredSegmentStore.setState(null)}
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
                <div className={`absolute left-0 top-[20%] h-[60%] w-[3px] rounded-full bg-lightgray transition-opacity duration-150 ${isActiveSimSegment ? "opacity-100" : "opacity-0"}`} />

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

                <span className="shrink-0 text-left text-[16px] truncate max-w-[160px]">{name}</span>

                {sliderDef !== undefined && (
                    <div onClick={(e) => e.stopPropagation()} className="flex-1 min-w-0 flex items-center gap-3">
                        <Slider
                            sliderHeight={5}
                            knobHeight={16}
                            knobWidth={16}
                            value={sliderNum / speedScale * 100}
                            step={sliderDef.roundTo !== undefined ? (sliderDef.roundTo / speedScale) * 100 : undefined}
                            setValue={(v: number) => {
                                const newValue = (v / 100) * speedScale;
                                if (isSegmentKey) {
                                    updatePath(prev => ({
                                        ...prev,
                                        segments: prev.segments.map(s =>
                                            s.id === segmentId ? { ...s, [sliderKey]: newValue } : s
                                        ),
                                    }));
                                } else {
                                    sliderField?.onChange({ [sliderKey]: newValue });
                                }
                            }}
                            OnChangeEnd={() => { saveSnapshot(); }}
                        />
                        <span className="shrink-0 relative tabular-nums">
                            <span className="invisible">{speedScale.toFixed(speedDecimals)}</span>
                            <span className="absolute inset-0 text-left">{sliderNum.toFixed(speedDecimals)}</span>
                        </span>
                    </div>
                )}

                {directionField.length > 0 && (
                    <div onClick={(e) => e.stopPropagation()} className="ml-auto flex flex-row items-center gap-2.5">
                        {directionField.map((f) => (
                            <CycleImageButton
                                key={f.label}
                                label={f.label}
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

                <div className={`flex flex-col gap-1 ${isOpen ? "" : "hidden"}`}>
                    {fieldSections.map((f) => (
                        <ConstantsList
                            key={f.header}
                            header={f.header}
                            fields={f.fields}
                            values={f.values}
                            isOpenGlobal={false}
                            onChange={f.onChange}
                            onReset={f.onReset}
                            onSetDefault={f.onSetDefault}
                            onApply={f.onApply}
                            defaults={f.defaults}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

export default MotionList;
