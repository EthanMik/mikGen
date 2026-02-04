import { createSharedState } from "../core/SharedState";
import type { Path } from "../core/Types/Path";
import { VALIDATED_APP_STATE } from "./useFileFormat";

export const usePath = createSharedState<Path>(VALIDATED_APP_STATE.path);