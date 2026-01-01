import { createSharedState } from "../core/SharedState";
import type { Pose } from "../core/Types/Pose";

export const useRobotPose = createSharedState<Pose[]>([]);