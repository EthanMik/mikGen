import { createSharedState } from "../core/SharedState";

export const useSimulateGroup = createSharedState<string[]>([]);