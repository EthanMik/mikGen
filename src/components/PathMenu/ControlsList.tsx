import { memo } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import trash from "../../assets/trash.svg";
import { fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import { segmentControls } from "../../core/Types/Bezier";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { controlAttributes } from "../Field/FieldColors";
import { selectControlInPath, type ControlSelectMode } from "../Field/FieldUtils";
import Tooltip from "../Util/Tooltip";

type ControlsListProps = {
    segmentId: string;
    width?: number;
}

const ControlsList = memo(function ControlsList({ segmentId, width = 429 }: ControlsListProps) {
    const segment = fileFormatStore.useSelector(s => s.path.segments.find(seg => seg.id === segmentId));
    const controls = segment ? segmentControls(segment) : [];

    const select = (controlIdx: number, mode: ControlSelectMode) => {
        updatePath(prev => selectControlInPath(prev, segmentId, controlIdx, mode));
    };

    const handleOnClick = (evt: React.MouseEvent<HTMLButtonElement>, controlIdx: number) => {
        evt.stopPropagation();
        if (evt.ctrlKey) return select(controlIdx, "toggle");
        if (evt.shiftKey) return select(controlIdx, "range");
        select(controlIdx, "exclusive");
    };

    const toggleVisible = (controlIdx: number) => {
        updatePath(prev => ({
            ...prev,
            segments: prev.segments.map(s => s.id !== segmentId ? s : {
                ...s,
                controls: segmentControls(s).map((c, i) => i === controlIdx ? { ...c, visible: !c.visible } : c),
            }),
        }));
        saveSnapshot();
    };

    /** The curve drops to a lower degree rather than breaking, so a control can always be removed. */
    const deleteControl = (controlIdx: number) => {
        updatePath(prev => ({
            ...prev,
            segments: prev.segments.map(s => s.id !== segmentId ? s : {
                ...s,
                controls: segmentControls(s).filter((_, i) => i !== controlIdx),
            }),
        }));
        saveSnapshot();
    };

    if (controls.length === 0) return null;

    return (
        <div className="flex flex-col gap-0.5 -ml-4">
            {controls.map((control, i) => (
                <button
                    key={`control-${i}`}
                    onClick={(e) => handleOnClick(e, i)}
                    style={{ width: `${width}px` }}
                    className={`${control.selected ? "bg-medlightgray" : "bg-medgray"}
                        relative flex flex-row justify-start items-center
                        h-[27px] gap-[12px]
                        hover:brightness-92
                        rounded-sm pl-4 pr-4
                        transition-all duration-100
                        active:scale-[0.995]
                    `}
                >
                    <div
                        className={`absolute left-[0px] -inset-y-0.5 w-[4px] h-5.5 self-center rounded-sm ${control.selected ? "brightness-150" : ""}`}
                        style={{ backgroundColor: controlAttributes()[i]?.baseColor.replace(/,\s*[\d.]+\)$/, ", 1)") }}
                    />

                    <button className="cursor-pointer shrink-0" onClick={(e) => { e.stopPropagation(); toggleVisible(i); }}>
                        <img className="w-[20px] h-[20px]" src={control.visible ? eyeOpen : eyeClosed} />
                    </button>

                    <span className="shrink-0 text-left text-[14px]">Control {i + 1}</span>

                    <div onClick={(e) => e.stopPropagation()} className="ml-auto flex flex-row items-center gap-2.5">
                        <Tooltip label="Delete Control">
                            <button
                                className="cursor-pointer shrink-0 flex items-center"
                                onClick={(e) => { e.stopPropagation(); deleteControl(i); }}
                            >
                                <img className="w-[15px] h-[15px]" src={trash} />
                            </button>
                        </Tooltip>
                    </div>
                </button>
            ))}
        </div>
    );
});

export default ControlsList;
