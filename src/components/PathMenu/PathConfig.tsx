import { useState } from "react";
import { fileFormatStore, useFormat, updatePath } from "../../hooks/useFileFormat";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";
import { FORMAT_REGISTRY } from "../../simulation/FormatDefinition";
import { moveMultipleSegments, buildDraggingIds } from "./PathConfigUtils";

export default function PathConfig() {
    const segmentIds = fileFormatStore.useSelector(
        s => s.path.segments.map(seg => seg.id),
        (a, b) => a.length === b.length && a.every((id, i) => id === b[i])
    );
    const pathName = fileFormatStore.useSelector(s => s.path.name);
    const [draggingIds, setDraggingIds] = useState<string[]>([]);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const [isOpen, setOpen] = useState(false);
    const [isTelemetryOpen, setTelemetryOpen] = useState(false);
    const [format] = useFormat();

    const startDragging = (segmentId: string) => {
        setDraggingIds(buildDraggingIds(fileFormatStore.getState().path.segments, segmentId));
    };

    const stopDragging = () => {
        setDraggingIds([]);
        setOverIndex(null);
    };

    const name = pathName || FORMAT_REGISTRY[format].formatPathName;

    return (
        <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
            <PathConfigHeader name={name} isOpen={isOpen} setOpen={setOpen} isTelemetryOpen={isTelemetryOpen} onTelemetryToggle={() => setTelemetryOpen(p => !p)} onRename={n => updatePath(prev => ({ ...prev, name: n }))} />

            <div
                className="mt-[10px] flex-1 min-h-2 overflow-y-auto scrollbar-thin
                flex-col items-center overflow-x-hidden space-y-0.5 relative"
                onDrop={(e) => {
                    if (draggingIds.length === 0) return;
                    if (overIndex !== null && overIndex > 0) {
                        e.preventDefault();
                        moveMultipleSegments(updatePath, draggingIds, overIndex);
                        stopDragging();
                    }
                }}
                onDragOver={(e) => {
                    if (overIndex !== null) e.preventDefault();
                }}
            >
                {segmentIds.map((id, idx) => {
                    const showDropIndicator = overIndex === idx && draggingIds.length > 0 && idx > 0;

                    return (
                        <div
                            key={id}
                            className="w-full relative"
                            onDragOver={(e) => {
                                if (e.defaultPrevented) return;
                                e.preventDefault();
                                setOverIndex(idx);
                            }}
                        >
                            {idx > 0 && (
                                <div
                                    className="absolute -top-2 left-0 w-full h-2 z-20"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOverIndex(idx);
                                    }}
                                />
                            )}

                            {showDropIndicator && (
                                <div className="absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
                            )}

                            <MotionList
                                segmentId={id}
                                index={idx}
                                isOpenGlobal={isOpen}
                                isTelemetryOpenGlobal={isTelemetryOpen}
                                draggable={true}
                                onDragStart={() => startDragging(id)}
                                onDragEnd={stopDragging}
                                onDragEnter={() => setOverIndex(idx)}
                                draggingIds={draggingIds}
                            />
                        </div>
                    );
                })}

                <div
                    className="w-full relative h-4"
                    onDragOver={(e) => {
                        if (e.defaultPrevented) return;
                        e.preventDefault();
                        setOverIndex(segmentIds.length);
                    }}
                    onDrop={(e) => {
                        if (e.defaultPrevented) return;
                        e.preventDefault();
                        moveMultipleSegments(updatePath, draggingIds, segmentIds.length);
                        stopDragging();
                    }}
                >
                    {overIndex === segmentIds.length && draggingIds.length > 0 && (
                        <div className="absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
                    )}
                </div>
            </div>
        </div>
    );
}
