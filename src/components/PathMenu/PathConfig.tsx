import { usePath } from "../../hooks/usePath";
import MotionList from "./MotionList";
import PathConfigHeader from "./PathHeader";

export default function PathConfig() {
  const [ path, setPath ] = usePath();
  // console.log(path);
  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader />

      <div className="mt-[10px] flex-1 min-h-2 overflow-y-auto 
       flex-col items-center overflow-x-hidden space-y-1">
        {path.segments.map((c, idx) => (
          <>
            {idx > 0 ? <MotionList name="Drive" segmentId={c.id} /> : <div/>}
            {(idx > 0 && c.kind === "angleTurn" || c.kind === "pointTurn") ? <MotionList name="Turn" segmentId={c.id} /> : <div/>}
            {idx === 0 ? <MotionList name="Start" segmentId={c.id} /> : <div/>}
          </>
        ))}

      </div>
    </div>
  );
}