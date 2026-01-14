import { createSharedState } from "../core/SharedState";
import type { Segment } from "../core/Types/Segment";

export const useClipboard = createSharedState<Segment[]>([]);