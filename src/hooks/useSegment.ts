import type { Segment } from "../core/Path";
import { createSharedState } from "../core/SharedState";

const saved = localStorage.getItem("path");
const initialData = saved ? JSON.parse(saved) : { controls: [] };

export const useSegment = createSharedState<Segment>(initialData);