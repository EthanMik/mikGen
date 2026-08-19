import { memo, useEffect, useMemo, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import clockClose from "../../assets/clock-close.svg";
import clockOpen from "../../assets/clock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import play from "../../assets/play.svg";
import Slider from "../Util/Slider";
import { useFormatDef, fileFormatStore, selectSegmentById, updatePath } from "../../hooks/useFileFormat";
import ConstantsList from "./ConstantsList";
import CycleImageButton from "../Util/CycleButton";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import type { SegmentReorder } from "./useSegmentReorder";
import { activeSimSegmentStore, computedPathStore, pathTelemetry, simJumpStore } from "../../core/ComputePathSim";
import { roundNum } from "../../core/Util";
import { hoveredSegmentStore } from "../../core/HoverStore";
import { copiedSegmentsStore } from "../../core/CopyStore";
import { cycle, pressAction, selectSegment, toggleSegmentVisibility, writeFields } from "./SegmentEdits";
import { buildSegmentView, sliderPercent, sliderStep, sliderValueAt } from "./SegmentView";
import ControlsList from "./ControlsList";
import Tooltip from "../Util/Tooltip";

type SegmentListProps = {
    segmentId: string;
    index: number;
    isOpenGlobal: boolean;
    isTelemetryOpenGlobal: boolean;
    /** Set while this row is one of the rows being dragged, so it fades out of the list. */
    dragging: boolean;
    reorder: SegmentReorder;
}

const SegmentList = memo(function SegmentList({
    segmentId,
    index,
    isOpenGlobal,
    isTelemetryOpenGlobal,
    dragging,
    reorder,
}: SegmentListProps) {
    const segment = fileFormatStore.useSelector(s => selectSegmentById(s, segmentId));
    const formatDef = useFormatDef();
    const isActiveSimSegment = activeSimSegmentStore.useSelector(s => s === index);

    const [isTelemetryOpen, setTelemetryOpen] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [copyShrink, setCopyShrink] = useState(false);

    // A copy hands over a fresh id array, so the row shrinks for one beat and transitions back
    const copiedIds = copiedSegmentsStore.useStore();

    useEffect(() => {
        if (!copiedIds.includes(segmentId)) return;
        setCopyShrink(true);
        const timeout = setTimeout(() => setCopyShrink(false), 120);
        return () => clearTimeout(timeout);
    }, [copiedIds, segmentId]);

    useEffect(() => { setOpen(isOpenGlobal); }, [isOpenGlobal]);
    useEffect(() => { setTelemetryOpen(isTelemetryOpenGlobal); }, [isTelemetryOpenGlobal]);

    const telemetrySlice = pathTelemetry.useSelector(s => isTelemetryOpen ? s[index] : undefined);

    // Everything the row draws comes from here; nothing below reaches into formatDef itself
    const view = useMemo(
        () => segment && buildSegmentView(formatDef, segment),
        [formatDef, segment],
    );

    if (!segment || !view) return null;

    const selected = segment.selected;

    const handleOnClick = (evt: React.PointerEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        // The click still fires after a reorder drag, and it would re-select the row under the
        // cursor rather than the one that was moved
        if (reorder.wasDragged()) return;
        if (evt.button !== 0) return;
        if (evt.ctrlKey) return updatePath(prev => selectSegment(prev, segmentId, "toggle"));
        if (evt.shiftKey) return updatePath(prev => selectSegment(prev, segmentId, "range"));
        if (selected) setOpen(prev => !prev);
        updatePath(prev => selectSegment(prev, segmentId, "exclusive"));
    };

    const handleEyeOnClick = () => {
        updatePath(prev => toggleSegmentVisibility(prev, segmentId));
        saveSnapshot();
    };

    /** Right click scrubs the simulation to where this segment starts. */
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const computedPath = computedPathStore.getState();
        const startT = computedPath.segmentTrajectorys[index]?.[0]?.t ?? 0;
        const percent = computedPath.totalTime > 0 ? ((startT + computedPath.dt) / computedPath.totalTime) * 100 : 0;
        simJumpStore.setState(percent);
    };

    const slider = view.slider;

    return (
        <div
            className="relative flex flex-col gap-0.5 mt-[1px] pl-4"
            onClick={() => { if (selected) setOpen(!isOpen); }}
        >
            <div className={`absolute left-0 top-0 h-[35px] brightness-80 transition-opacity duration-200 flex items-center pointer-events-none ${isActiveSimSegment ? "opacity-100" : "opacity-0"}`}>
                <img className="w-2" src={play} />
            </div>

            <button
                onPointerDown={(e) => reorder.onPointerDown(e, segmentId)}
                onPointerMove={(e) => reorder.onPointerMove(e)}
                onPointerUp={(e) => reorder.onPointerUp(e)}
                onPointerCancel={(e) => reorder.onPointerCancel(e)}
                onClick={handleOnClick}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => hoveredSegmentStore.setState(segmentId)}
                onMouseLeave={() => hoveredSegmentStore.setState(null)}
                style={{
                    width: "450px",
                    // Vertical panning stays with the browser so an ordinary swipe still scrolls the
                    // list; the reorder gesture revokes it only once a long press has armed a drag
                    touchAction: "pan-y",
                    WebkitTouchCallout: "none",
                }}
                className={`select-none ${selected ? "bg-medlightgray" : ""}
                    relative flex flex-row justify-start items-center
                    h-[35px] gap-[12px]
                    bg-medgray
                    hover:brightness-92
                    rounded-md pl-4 pr-4
                    transition-all duration-100
                    ${copyShrink ? "scale-97" : "active:scale-[0.995]"}
                    ${isOpen ? "border-2 border-[#535252]" : "border-2 border-transparent"}
                    ${dragging ? "opacity-10" : ""}
                `}
            >
                <div
                    className={`absolute -left-[2px] -inset-y-0.5 w-[5px] h-7.5 self-center rounded-md ${selected ? "brightness-150" : ""}`}
                    style={{ backgroundColor: view.accentColor }}
                />

                <button
                    className="cursor-pointer shrink-0"
                    onClick={(e) => { e.stopPropagation(); setOpen(!isOpen); }}
                >
                    <img className={`w-[15px] h-[15px]  transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} src={downArrow} />
                </button>

                <button className="cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); handleEyeOnClick(); }}>
                    <img className="w-[20px] h-[20px]" src={segment.visible ? eyeOpen : eyeClosed} />
                </button>

                <button className="cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); setTelemetryOpen(!isTelemetryOpen); }}>
                    <img className="w-[20px] h-[20px]" src={isTelemetryOpen ? clockClose : clockOpen} />
                </button>

                <span className="shrink-0 text-left text-[16px] truncate max-w-[160px]">{view.name}</span>

                {slider !== null && (
                    <div onClick={(e) => e.stopPropagation()} className="flex-1 min-w-0 flex items-center gap-3">
                        <Slider
                            sliderHeight={5}
                            knobHeight={16}
                            knobWidth={16}
                            value={sliderPercent(slider)}
                            step={sliderStep(slider)}
                            setValue={(percent: number) => updatePath(prev => writeFields(
                                prev, { segmentId }, [{ source: slider.source, value: sliderValueAt(slider, percent) }],
                            ))}
                            OnChangeEnd={() => { saveSnapshot(); }}
                        />
                        <span className="shrink-0 relative tabular-nums">
                            <span className="invisible">{slider.max.toFixed(slider.decimals)}</span>
                            <span className="absolute inset-0 text-left">{slider.value.toFixed(slider.decimals)}</span>
                        </span>
                    </div>
                )}

                {(view.cycleButtons.length > 0 || view.actions.length > 0) && (
                    <div onClick={(e) => e.stopPropagation()} className="ml-auto flex flex-row items-center gap-2.5">
                        {view.cycleButtons.map((button) => (
                            <CycleImageButton
                                key={button.label}
                                label={button.label}
                                imageKeys={button.imageKeys}
                                value={button.value}
                                onKeyChange={(key: string | null) => {
                                    updatePath(prev => cycle(prev, segmentId, button, key));
                                    saveSnapshot();
                                }}
                            />
                        ))}
                        {view.actions.map((action) => (
                            <Tooltip key={action.label} label={action.label}>
                                <button
                                    className="cursor-pointer shrink-0 flex items-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updatePath(prev => pressAction(prev, segmentId, action.def));
                                        saveSnapshot();
                                    }}
                                >
                                    <img className="w-[20px] h-[20px]" src={action.srcImg} />
                                </button>
                            </Tooltip>
                        ))}
                    </div>
                )}
            </button>

            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative flex flex-col gap-0.5 ${(!isTelemetryOpen || telemetrySlice === undefined) && !isOpen ? "hidden" : ""
                    }`}
            >
                {isTelemetryOpen && telemetrySlice !== undefined && (
                    <div className="flex ml-5 gap-2 text-left text-[14px]">
                        <span>Time: {roundNum(telemetrySlice.totalTime)}<span className="text-[8px] text-lightgray align-super leading-none"> s</span></span>
                        <span>Distance: {roundNum(telemetrySlice.totalDistance)}<span className="text-[8px] text-lightgray align-super leading-none"> {telemetrySlice.units}</span></span>
                        <span>Traveled: {roundNum(telemetrySlice.progressRaw)}<span className="text-[8px] text-lightgray align-super leading-none"> {telemetrySlice.units}</span>  {roundNum(telemetrySlice.progressPercent)}<span className="text-[10px] text-lightgray align-super leading-none"> %</span></span>
                    </div>
                )}

                <div className={`flex flex-col ml-9 gap-0.5 ${isOpen ? "" : "hidden"}`}>
                    <div className="flex mt-0.5">
                        <ControlsList segmentId={segmentId} />
                    </div>

                    <div className="relative flex flex-col gap-0.5">
                        <div className="absolute left-[-16px] top-1 bottom-1 w-[4px] rounded-full bg-medlightgray" />

                        {view.groups.map((group) => (
                            <ConstantsList
                                key={group.header}
                                segmentId={segmentId}
                                kind={view.kind}
                                group={group}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SegmentList;
