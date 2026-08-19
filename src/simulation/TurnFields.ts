import lockClose from "../assets/lock-close.svg";
import lockOpen from "../assets/lock-open.svg";
import { resolveTurnPose } from "../core/Util";
import type { ActionButtonField } from "./FormatDefinition";

/**
 * Freezes the coordinate a point turn faces. Unlocked it tracks the drive segment in front of it;
 * locking snaps the currently resolved target into turnPose, so later edits to that drive segment
 * leave the turn pointing where it is. Shared by every format that implements a turn-to-point.
 */
export const turnLockButton: ActionButtonField = {
    srcImg: (seg) => seg.turnLocked ? lockClose : lockOpen,
    label: "Lock Turn Target",
    onPress: (path, idx) => {
        // The stored coordinate is left behind on unlock: it is the fallback an unlocked turn with
        // nothing ahead of it aims at, so re-locking lands in the same place
        if (path.segments[idx].turnLocked) return { turnLocked: false };
        const target = resolveTurnPose(path, idx);
        return { turnLocked: true, turnPose: { x: target.x, y: target.y, angle: target.angle } };
    },
};
