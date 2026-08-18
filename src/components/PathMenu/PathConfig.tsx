import { useRef, useState } from "react";
import { fileFormatStore, useFormat, updatePath } from "../../hooks/useFileFormat";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";
import { FORMAT_REGISTRY } from "../../simulation/FormatDefinition";
import { ROW_INDEX_ATTR, useSegmentReorder } from "./useSegmentReorder";

export default function PathConfig() {
    const segmentIds = fileFormatStore.useSelector(
        s => s.path.segments.map(seg => seg.id),
        (a, b) => a.length === b.length && a.every((id, i) => id === b[i])
    );
    const pathName = fileFormatStore.useSelector(s => s.path.name);
    const [isOpen, setOpen] = useState(false);
    const [isTelemetryOpen, setTelemetryOpen] = useState(false);
    const [format] = useFormat();

    const listRef = useRef<HTMLDivElement>(null);
    const { draggingIds, overIndex, wasDragged, rowHandlers } = useSegmentReorder(listRef);

    const name = pathName || FORMAT_REGISTRY[format].formatPathName;

    return (
        <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-4 flex flex-col">
            <PathConfigHeader name={name} isOpen={isOpen} setOpen={setOpen} isTelemetryOpen={isTelemetryOpen} onTelemetryToggle={() => setTelemetryOpen(p => !p)} onRename={n => updatePath(prev => ({ ...prev, name: n }))} />

            <div
                ref={listRef}
                className="mt-2 -ml-2 flex-1 min-h-2 overflow-y-auto scrollbar-thin
                flex-col items-center overflow-x-hidden space-y-0.5 relative"
            >
                {segmentIds.map((id, idx) => {
                    const showDropIndicator = overIndex === idx && draggingIds.length > 0 && idx > 0;

                    return (
                        // The drop index is measured off these wrappers, so the marker has to stay
                        <div key={id} {...{ [ROW_INDEX_ATTR]: id }} className="w-full relative">
                            {showDropIndicator && (
                                <div className="absolute -top-1 left-[20px] w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
                            )}

                            <MotionList
                                segmentId={id}
                                index={idx}
                                isOpenGlobal={isOpen}
                                isTelemetryOpenGlobal={isTelemetryOpen}
                                reorderable={true}
                                rowHandlers={rowHandlers}
                                wasDragged={wasDragged}
                                draggingIds={draggingIds}
                            />
                        </div>
                    );
                })}

                {/* Drop slot for the end of the list; the indicator sits above it */}
                <div className="w-full relative h-4">
                    {overIndex === segmentIds.length && draggingIds.length > 0 && (
                        <div className="absolute -top-1 left-[15px] w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
                    )}
                </div>
            </div>
        </div>
    );
}
