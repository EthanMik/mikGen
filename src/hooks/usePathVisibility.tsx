import { createSharedState } from "../core/SharedState";

export const usePathVisibility = createSharedState<boolean>(false);