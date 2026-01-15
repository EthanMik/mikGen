import { useState, useEffect } from "react";
import { usePath } from "../../hooks/usePath";
import MotionList from "./MotionList";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";
import PathConfigHeader from "./PathHeader";
import { useFormat, type Format } from "../../hooks/useFormat";
import { getFormatConstantsConfig, getFormatDirectionConfig, globalDefaultsStore } from "../../core/DefaultConstants";

const getName = (format: Format) => {
  switch (format) {
    case "mikLib": return "mikLib Path";
    case "ReveilLib": return "ReveilLib Path";
    case "JAR-Template": return "JAR-Template Path";
    case "LemLib": return "LemLib Path";
  }
}

const getSpeed = (format: Format): number => {
  switch (format) {
    case "mikLib": return 12;
    case "ReveilLib": return 1;
    case "JAR-Template": return 12;
    case "LemLib": return 127;
  }
}

export default function PathConfig() {
  const [ path, setPath ] = usePath();
  const [ draggingId, setDraggingId ] = useState<string | null>(null);
  const [ overIndex, setOverIndex ] = useState<number | null>(null);
  const [ isOpen, setOpen ] = useState(false);
  const [ format,  ] = useFormat();

  const [ , forceUpdate ] = useState({});
  useEffect(() => {
    const unsubscribe = globalDefaultsStore.subscribe(() => {
        forceUpdate({});
    });
    return () => unsubscribe();
  }, []);

  const speedScale = getSpeed(format);
  const name = getName(format);

  const moveSegment = (fromId: string | null, toIndex: number) => {
    if (!fromId) return;
    setPath(prev => {
      const segments = [...prev.segments];
      const fromIdx = segments.findIndex(s => s.id === fromId);
      if (fromIdx === -1) return prev;

      const [seg] = segments.splice(fromIdx, 1);
      if (toIndex === 0) {
        seg.kind = "start";
        if (seg.pose.x === null) { 
          seg.pose.x = 0;
        }
        if (seg.pose.y === null) {
          seg.pose.y = 0;
        }
        if (seg.pose.angle === null) {
          seg.pose.angle = 0;
        }
      }

      if (toIndex === 0 && seg.kind === "start") {
        seg.kind = "poseDrive";
      }

      let insertIdx = toIndex;
      if (fromIdx < toIndex) insertIdx = toIndex - 1;

      segments.splice(insertIdx, 0, seg);

      const next = { ...prev, segments };
      AddToUndoHistory({ path: next });
      return next;
    });
  };

  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader name={name} isOpen={isOpen} setOpen={setOpen} />

      <div className="mt-[10px] flex-1 min-h-2 overflow-y-auto 
        flex-col items-center overflow-x-hidden space-y-2 relative">
        {path.segments.map((c, idx) => {
          
          const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
          const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);
          
          return (
          <div
            key={c.id}
            className="w-full relative"
            onDragOver={(e) => { e.preventDefault(); setOverIndex(idx); }}
            onDrop={(e) => { e.preventDefault(); moveSegment(draggingId, idx); setDraggingId(null); setOverIndex(null); }}
          >
            {/* insertion line before an item when dragging */}
            {overIndex === idx && draggingId !== null && (
              <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
            )}

            {idx > 0 && (c.kind === undefined) && (
              <div className="w-full h-6 bg-red-600/60 rounded-sm flex items-center justify-center">
                <span className="text-white text-[14px]">Error: Segment kind is undefined</span>
              </div>
            )}
            
            {/* DRIVE */}
            {idx > 0 && (c.kind === "pointDrive" || c.kind === "poseDrive") && (
              <MotionList
                name="Drive"
                speedScale={speedScale}
                field={constantsFields}
                directionField={directionFields}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
              />
            )}

            {/* TURN */}
            {idx > 0 && (c.kind === "angleTurn" || c.kind === "pointTurn") && (
              <MotionList
                name="Turn"
                speedScale={speedScale}
                field={constantsFields}
                directionField={directionFields}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
              />
            )}

            {/* SWING */}
            {idx > 0 && (c.kind === "pointSwing" || c.kind === "angleSwing") && (
              <MotionList
                name="Swing"
                speedScale={speedScale}
                field={constantsFields}
                directionField={directionFields}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
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
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
              />
            )}

          </div>
        )})}

        {overIndex === path.segments.length && draggingId !== null && (
          <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
        )}

      </div>
    </div>
  );
}