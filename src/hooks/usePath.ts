import { AngleTurnSegment, PointDriveSegment, PoseDriveSegment, type Path } from "../core/Path";
import { createSharedState } from "../core/SharedState";

const saved = localStorage.getItem("path");
const initialData = saved ? JSON.parse(saved) : { segments: [] };

export const usePath = createSharedState<Path>({segments: [
    new PoseDriveSegment({x: 30, y: 30, angle: 45}),
    new AngleTurnSegment(90),
    new PointDriveSegment({x: 0, y: 0}),
    new PointDriveSegment({x: 0, y: 10}),
]});