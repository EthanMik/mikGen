import { turnToAngle } from "../core/mikLibSim/DriveMotions";
import { AngleTurnSegment, PointDriveSegment, PoseDriveSegment, type Path } from "../core/Path";
import { createSharedState } from "../core/SharedState";

const saved = localStorage.getItem("path");
const initialData = saved ? JSON.parse(saved) : { segments: [] };

export const usePath = createSharedState<Path>({segments: [
    PoseDriveSegment({x: -43, y: -28, angle: 0}),
    PoseDriveSegment({x: -12.60, y: 15.75, angle: 90}),
    AngleTurnSegment(0)
]});