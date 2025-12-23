import { createSharedState } from "../core/SharedState";
import type { Path } from "../core/Types/Path";
import { createAngleTurnSegment, createPoseDriveSegment } from "../core/Types/Segment";

const saved = localStorage.getItem("path");
const initialData = saved ? JSON.parse(saved) : { segments: [] };

export const usePath = createSharedState<Path>({segments: []});