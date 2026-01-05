/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { usePath } from "../../hooks/usePath";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";
import { useFormat } from "../../hooks/useFormat";
import { getFormatConstantsConfig } from "../../core/Constants";
import { mikDefaultsStore } from "../../core/mikLibSim/MikConstants";

export default function PathConfig() {
  const [ path, setPath ] = usePath();
  const [ isOpen, setOpen ] = useState(false);
  const [ format, setFormat ] = useFormat();

  let speedScale = 1;
  if (format === "mikLib" || format === "JAR-Template") speedScale = 12;
  if (format === "LemLib") speedScale = 127;
  // ReveilLib speed scale is 1;
  
  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader isOpen={isOpen} setOpen={setOpen} />

      <div className="mt-[10px] flex-1 min-h-2 overflow-y-auto 
       flex-col items-center overflow-x-hidden space-y-2">
        {path.segments.map((c, idx) => (
          <>
            
            {/* DRIVE */}
            {idx > 0 && (c.kind === "pointDrive" || c.kind === "poseDrive") && (
              <MotionList
                name="Drive"
                speedScale={speedScale}
                field={getFormatConstantsConfig(format, path, setPath, c.id)}
                segmentId={c.id}
                isOpenGlobal={isOpen}
              />
            )}

            {/* TURN */}
            {idx > 0 && (c.kind === "angleTurn" || c.kind === "pointTurn") && (
              <MotionList
                name="Turn"
                speedScale={speedScale}
                field={getFormatConstantsConfig(format, path, setPath, c.id)}
                segmentId={c.id}
                isOpenGlobal={isOpen}
              />
            )}

            {/* SWING */}
            {idx > 0 && (c.kind === "pointSwing" || c.kind === "angleSwing") && (
              <MotionList
                name="Swing"
                speedScale={speedScale}
                field={getFormatConstantsConfig(format, path, setPath, c.id)}
                segmentId={c.id}
                isOpenGlobal={isOpen}
              />
            )}

            {/* START SEGMENT */}
            {idx === 0 && (
              <MotionList
                name="Start"
                speedScale={speedScale}
                field={[]}
                segmentId={c.id}
                isOpenGlobal={isOpen}
                start={true}
              />
            )}
            
          </>
        ))} 

      </div>
    </div>
  );
}