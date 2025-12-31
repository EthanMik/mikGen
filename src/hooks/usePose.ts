import { createSharedState } from "../core/SharedState";
import type { Pose } from "../core/Types/Pose";

export const usePose = createSharedState<Pose | null>(null);