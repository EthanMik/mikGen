import { createSharedState } from "../core/SharedState";

export type Settings = {
    onionLayers: boolean;
    /** Inches of travel between onion layers. 0 draws only the segment end positions. */
    onionSpacing: number;
    robotPosition: boolean;
    precisePath: boolean;
    numberedPath: boolean;
    loopPath: boolean;
    snapToGrid: number;
    snappingEnabled: boolean;
};

const DEFAULTS: Settings = {
    onionLayers: false,
    onionSpacing: 0,
    robotPosition: false,
    precisePath: false,
    numberedPath: false,
    loopPath: false,
    snapToGrid: 0.5,
    snappingEnabled: false
};

const saved = localStorage.getItem("settings");
const parsed: Partial<Settings> = saved ? JSON.parse(saved) : {};
const initial = Object.fromEntries(
    (Object.keys(DEFAULTS) as (keyof Settings)[]).map(k => [k, parsed[k] ?? DEFAULTS[k]])
) as Settings;

export const useSettings = createSharedState<Settings>(initial);
