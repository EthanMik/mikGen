import { createSharedState } from "../core/SharedState";
import { FIELD_IMG_DIMENSIONS, type Rectangle } from "../core/Util";

export const useFieldImg = createSharedState<Rectangle>(FIELD_IMG_DIMENSIONS);