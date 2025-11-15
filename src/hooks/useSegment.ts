import { useEffect, useState } from "react";
import type { Segment } from "../core/Path";

let globalSegment: Segment = { controls: [] };
let listeners: Array<(seg: Segment) => void> = [];

function setGlobalSegment(next: Segment) {
  globalSegment = next;
  listeners.forEach((listener) => listener(globalSegment));
}

export function useSegment() {
  const [segment, setSegmentState] = useState<Segment>(globalSegment);

  useEffect(() => {
    listeners.push(setSegmentState);
    return () => {
      listeners = listeners.filter((l) => l !== setSegmentState);
    };
  }, []);

  const setSegment = (next: Segment) => {
    setGlobalSegment(next);
  };

  return { segment, setSegment };
}
