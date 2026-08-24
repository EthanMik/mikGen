import plus from "../assets/plus.svg";
import { bezierEndpoints, chordControlPosition, segmentControls } from "../core/Types/Bezier";
import { createControlPoint } from "../core/Types/Pose";
import type { ActionButtonField } from "./FormatDefinition";

/**
 * Adds a control handle to a bezier segment, up to the two a cubic takes. A segment with fewer
 * is still drawn and exported as a cubic through degree elevation, so this only changes how much
 * of the curve is under direct control. Shared by every format that implements a path follow.
 */
export const addControlButton: ActionButtonField = {
    srcImg: plus,
    label: "Add Control",
    onPress: (path, idx) => {
        const seg = path.segments[idx];
        const controls = segmentControls(seg);
        if (controls.length >= 2) return undefined;

        const ends = bezierEndpoints(path, idx);
        if (ends === null) return undefined;

        const pos = chordControlPosition(ends.p0, ends.p1, controls.length);
        return { controls: [...controls, createControlPoint(pos.x, pos.y)] };
    },
};
