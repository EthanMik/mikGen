import { createSharedState } from "../core/SharedState";
import { FIELD_IMG_DIMENSIONS, type Rectangle } from "../core/Util";

export const useFieldImg = createSharedState<Rectangle>(FIELD_IMG_DIMENSIONS);

let pending: ((prev: Rectangle) => Rectangle)[] = [];
let frame = 0;

/**
 * Folds high frequency pan/zoom updates into one store write per animation frame.
 * Wheel events fire well above the frame rate, and each write re-renders the field.
 * Updaters are applied in order, so a burst of zoom ticks each stay anchored at the
 * cursor position they captured.
 */
export function queueFieldImg(updater: (prev: Rectangle) => Rectangle) {
    pending.push(updater);
    if (frame !== 0) return;

    frame = requestAnimationFrame(() => {
        frame = 0;
        const updaters = pending;
        pending = [];
        useFieldImg.setState(prev => updaters.reduce((acc, update) => update(acc), prev));
    });
}
