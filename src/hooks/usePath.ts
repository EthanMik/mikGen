import { createSharedState } from "../core/SharedState";
import type { Path } from "../core/Types/Path";
import { createAngleTurnSegment, createPoseDriveSegment } from "../core/Types/Segment";

const saved = localStorage.getItem("path");
const initialData = saved ? JSON.parse(saved) : { segments: [] };

export const usePath = createSharedState<Path>({segments: [
    createPoseDriveSegment({x: -43, y: -28, angle: 0}),
    createPoseDriveSegment({x: -12.60, y: 15.75, angle: 90}),
    createAngleTurnSegment(0)
]});