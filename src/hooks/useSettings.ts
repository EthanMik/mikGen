import { createSharedState } from "../core/SharedState";

type Settings = {
    ghostRobots: boolean;
    robotPosition: boolean;
    precisePath: boolean;
    numberedPath: boolean;
    loopPath: boolean;
    snapToGrid: number;
    themeIdx: number;
};

const DEFAULTS: Settings = {
    ghostRobots: false,
    robotPosition: false,
    precisePath: false,
    numberedPath: false,
    loopPath: false,
    snapToGrid: 0.5,
    themeIdx: 0
};

const saved = localStorage.getItem("settings");
const initial: Settings = saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;

export const useSettings = createSharedState<Settings>(initial);
