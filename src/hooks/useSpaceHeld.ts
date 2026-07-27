import { createSharedState } from "../core/SharedState";

/** True while the spacebar is held, which turns a left drag on the field into a pan. */
export const useSpaceHeld = createSharedState(false);

let usedForPan = false;

/** Marks the current space press as a pan gesture, so releasing it does not toggle playback. */
export const markSpacePan = () => { usedForPan = true; };

/** Reads and clears the pan mark. Called once when space is released. */
export const consumeSpacePan = () => {
    const used = usedForPan;
    usedForPan = false;
    return used;
};
