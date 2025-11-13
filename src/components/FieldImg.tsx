import { useCallback, useState } from "react";
import type { Segment } from "../core/Path";
import Field from "./FieldWithMarkers";

export default function FieldContainer({ src, img }: { src: string; img: { x: number, y: number, w: number; h: number } }) {
  const [segment, setSegment] = useState<Segment>({ controls: [] });

  const addControl = useCallback((next: Segment) => {
    setSegment(next);
  }, []);

  const deleteControl = useCallback((id: string) => {
    setSegment(s => ({
      ...s, controls: s.controls.filter(c => c.id !== id)
    }));
  }, []);


  return (
    <Field
      src={src}
      img={img}
      segment={segment}
      radius={15}
      addControl={addControl}
      deleteControl={deleteControl}
    />
  );
}