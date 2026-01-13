import { createSharedState } from "../core/SharedState";
import type { Path } from "../core/Types/Path";

export const usePath = createSharedState<Path>({
    name: "",
    segments: []
});