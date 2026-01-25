import { useState, useEffect } from "react";
import { usePath } from "../../hooks/usePath";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";
import { useFormat } from "../../hooks/useFormat";
import { getFormatConstantsConfig, getFormatDirectionConfig, getFormatPathName, getFormatSpeed, globalDefaultsStore } from "../../core/DefaultConstants";
import GroupList, { type GroupDropZone } from "./GroupList";
import { moveMultipleSegments } from "./PathConfigUtils";

export default function PathConfig() {
  const [ path, setPath ] = usePath();
  const [ draggingIds, setDraggingIds ] = useState<string[]>([]);
  const [ overIndex, setOverIndex ] = useState<number | null>(null);
  const [ isOpen, setOpen ] = useState(false);
  const [ format,  ] = useFormat();

  // Track which group's header drop zone is active, and what zone
  const [ activeGroupDropZone, setActiveGroupDropZone ] = useState<{
    groupId: string;
    zone: GroupDropZone;
  } | null>(null);

  const [ , forceUpdate ] = useState({});
  useEffect(() => {
    const unsubscribe = globalDefaultsStore.subscribe(() => {
        forceUpdate({});
    });
    return () => unsubscribe();
  }, []);

  // Clear group drop zone when dragging ends
  useEffect(() => {
    if (draggingIds.length === 0) {
      setActiveGroupDropZone(null);
    }
  }, [draggingIds]);

  // Helper to start dragging - includes all selected segments if the dragged item is selected
  const startDragging = (segmentId: string) => {
    const segment = path.segments.find(s => s.id === segmentId);
    if (segment?.selected) {
      // Get all selected segments (excluding start segment at index 0)
      const selectedIds = path.segments
        .filter((s, idx) => s.selected && idx > 0)
        .map(s => s.id);
      setDraggingIds(selectedIds.length > 0 ? selectedIds : [segmentId]);
    } else {
      setDraggingIds([segmentId]);
    }
  };

  const stopDragging = () => {
    setDraggingIds([]);
    setOverIndex(null);
    setActiveGroupDropZone(null);
  };

  const speedScale = getFormatSpeed(format);
  const name = getFormatPathName(format);

  const handleGroupDropZoneChange = (groupId: string) => (zone: GroupDropZone) => {
    if (zone === null) {
      setActiveGroupDropZone(null);
    } else {
      setActiveGroupDropZone({ groupId, zone });
      // Clear the parent overIndex when we have an active group zone
      setOverIndex(null);
    }
  };

  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader name={name} isOpen={isOpen} setOpen={setOpen} />

      <div
        className="mt-[10px] flex-1 min-h-2 overflow-y-auto
        flex-col items-center overflow-x-hidden space-y-2 relative"
        onDrop={(e) => {
          // Container-level drop handler - uses current state to determine drop position
          // This ensures the drop happens where the indicator line is showing
          if (draggingIds.length === 0) return;
          if (overIndex !== null && overIndex > 0) {
            e.preventDefault();
            moveMultipleSegments(setPath, draggingIds, overIndex);
            stopDragging();
          }
        }}
        onDragOver={(e) => {
          // Allow drops on container
          if (overIndex !== null) {
            e.preventDefault();
          }
        }}
      >
        {path.segments.map((c, idx) => {

          const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
          const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);

          // Check if this is a group and if we should skip showing the normal drop indicator
          const isGroup = c.kind === "group";
          const groupDropZone = isGroup && activeGroupDropZone?.groupId === c.id
            ? activeGroupDropZone.zone
            : null;

          // Don't show the normal overIndex indicator for groups (they handle their own)
          // Also don't show indicator at position 0 (before start segment)
          const showNormalDropIndicator = overIndex === idx &&
            draggingIds.length > 0 &&
            !isGroup &&
            idx > 0;

          return (
          <div
            key={c.id}
            className="w-full relative"
            onDragOver={(e) => {
              if (e.defaultPrevented) return;
              // Don't set overIndex if a group has an active drop zone
              if (activeGroupDropZone !== null) return;
              e.preventDefault();
              setOverIndex(idx);
            }}
          >
            {/* Invisible drop zone extending into the gap above */}
            {idx > 0 && (
              <div
                className="absolute -top-2 left-0 w-full h-2 z-20"
                onDragOver={(e) => {
                  if (activeGroupDropZone !== null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setOverIndex(idx);
                }}
              />
            )}

            {showNormalDropIndicator && (
              <div className="absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
            )}

            {idx > 0 && isGroup && (
              <GroupList
                name={c.constants as string}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => startDragging(c.id)}
                onDragEnd={stopDragging}
                onDragEnter={() => setOverIndex(idx)}
                setDraggingIds={setDraggingIds}
                draggingIds={draggingIds}
                headerDropZone={groupDropZone}
                onHeaderDropZoneChange={handleGroupDropZoneChange(c.id)}
              />
            )}

            {/* DRIVE */}
            {idx > 0 && ( (c.kind === "pointDrive" || c.kind === "poseDrive") && c.groupId == undefined ) && (
              <MotionList
                name="Drive"
                speedScale={speedScale}
                field={constantsFields}
                directionField={directionFields}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => startDragging(c.id)}
                onDragEnd={stopDragging}
                onDragEnter={() => setOverIndex(idx)}
                draggingIds={draggingIds}
              />
            )}

            {/* TURN */}
            {idx > 0 && ( (c.kind === "angleTurn" || c.kind === "pointTurn") && c.groupId == undefined ) && (
              <MotionList
                name="Turn"
                speedScale={speedScale}
                field={constantsFields}
                directionField={directionFields}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => startDragging(c.id)}
                onDragEnd={stopDragging}
                onDragEnter={() => setOverIndex(idx)}
                draggingIds={draggingIds}
              />
            )}

            {/* SWING */}
            {idx > 0 && ( (c.kind === "pointSwing" || c.kind === "angleSwing") && c.groupId == undefined ) && (
              <MotionList
                name="Swing"
                speedScale={speedScale}
                field={constantsFields}
                directionField={directionFields}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => startDragging(c.id)}
                onDragEnd={stopDragging}
                onDragEnter={() => setOverIndex(idx)}
                draggingIds={draggingIds}
              />
            )}

            {/* START SEGMENT */}
            {idx === 0 && (
              <MotionList
                name="Start"
                speedScale={speedScale}
                field={[]}
                directionField={[]}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                start={true}
                draggable={false}
                draggingIds={draggingIds}
              />
            )}

          </div>
        )})}

        <div
          className="w-full relative h-4"
          onDragOver={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            setOverIndex(path.segments.length);
          }}
          onDrop={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            moveMultipleSegments(setPath, draggingIds, path.segments.length);
            stopDragging();
          }}
        >
          {overIndex === path.segments.length && draggingIds.length > 0 && (
            <div className="absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
          )}
        </div>
      </div>
    </div>
  );
}