import { useState } from "react";
import { usePath } from "../../hooks/usePath";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";
import { kOdomDrivePID, kturnPID } from "../../core/mikLibSim/Constants";

export default function PathConfig() {
  const [ path, setPath ] = usePath();
  const [ isOpen, setOpen ] = useState(false);

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
                segmentId={c.id}
                isOpenGlobal={isOpen}
                defaultSpeed={!kOdomDrivePID.maxSpeed ? 0 : kOdomDrivePID.maxSpeed * 100}
              />
            )}

            {/* TURN */}
            {idx > 0 && (c.kind === "angleTurn" || c.kind === "pointTurn") && (
              <MotionList
                name="Turn"
                segmentId={c.id}
                isOpenGlobal={isOpen}
                defaultSpeed={!kturnPID.maxSpeed ? 0 : kturnPID.maxSpeed * 100}
              />
            )}

            {/* START SEGMENT */}
            {idx === 0 && (
              <MotionList
                name="Start"
                segmentId={c.id}
                isOpenGlobal={isOpen}
                defaultSpeed={0}
              />
            )}
            
          </>
        ))}

      </div>
    </div>
  );
}