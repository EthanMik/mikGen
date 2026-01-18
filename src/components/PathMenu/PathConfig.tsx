import { useState, useEffect } from "react";
import { usePath } from "../../hooks/usePath";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";
import { useFormat } from "../../hooks/useFormat";
import { getFormatConstantsConfig, getFormatDirectionConfig, getFormatPathName, getFormatSpeed, globalDefaultsStore } from "../../core/DefaultConstants";
import GroupList from "./GroupList";
import { moveSegment } from "./PathConfigUtils";

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

  const speedScale = getFormatSpeed(format);
  const name = getFormatPathName(format);

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
            onDragOver={(e) => {
              if (e.defaultPrevented) return;
              e.preventDefault();
              setOverIndex(idx);
            }}
            onDrop={(e) => {
              if (e.defaultPrevented) return;
              e.preventDefault();
              moveSegment(setPath, draggingId, idx);
              setDraggingId(null);
              setOverIndex(null);
            }}
          >
            {overIndex === idx && draggingId !== null && c.kind !== "group" && (
              <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
            )}

            {idx > 0 && (c.kind === "group") && (
              <GroupList 
                name="Group 1"
                segmentId={c.id}
                isOpenGlobal={isOpen}
                draggable={true}
                selected={overIndex === idx}
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                setDraggingId={setDraggingId}        
                draggingId={draggingId}      
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
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
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
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
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
                draggable={true}
                onDragStart={() => setDraggingId(c.id)}
                onDragEnd={() => { setDraggingId(null); setOverIndex(null); }}
                onDragEnter={() => setOverIndex(idx)}
                draggingId={draggingId}
              />
            )}

          </div>
        )})}

        <div
          className="w-full relative"
          onDragOver={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            setOverIndex(path.segments.length);
          }}
          onDrop={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            moveSegment(setPath, draggingId, path.segments.length);
            setDraggingId(null);
            setOverIndex(null);
          }}
        >
          {overIndex === path.segments.length && draggingId !== null && (
            <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
          )}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}