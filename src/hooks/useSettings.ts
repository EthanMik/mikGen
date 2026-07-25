import { createSharedState } from "../core/SharedState";

type Settings = {
    ghostRobots: boolean;
    robotPosition: boolean;
    precisePath: boolean;
    numberedPath: boolean;
    loopPath: boolean;
    snapToGrid: number;
    snappingEnabled: boolean;
};

const DEFAULTS: Settings = {
    ghostRobots: false,
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
