import type { Segment } from "./Segment";

export interface Path {
    name: string,
    segments: Segment[];
}

export const getBackwardsSnapPose = (path: Path, idx: number) => {
    const controls = path.segments;
    for (let i = idx; i >= 0; i--) {
        const c = controls[i];
        if (c.pose.x !== null && c.pose.y !== null) {
            return c.pose;
        }
    }
    return null;
};

export function getForwardSnapPose(path: Path, idx: number) {
    const controls = path.segments;
    for (let i = idx; i < controls.length; i++) {
        const c = controls[i];
        if (c.pose.x !== null && c.pose.y !== null) {
            return c.pose;
        }
    }
    return null;
}