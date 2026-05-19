import { createSharedState } from "../core/SharedState";

type Settings = {
    ghostRobots: boolean;
    robotPosition: boolean;
    precisePath: boolean;
    numberedPath: boolean;
};

const DEFAULTS: Settings = {
    ghostRobots: false,
    robotPosition: false,
    precisePath: false,
    numberedPath: false,
};

const saved = localStorage.getItem("settings");
const initial: Settings = saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;

export const useSettings = createSharedState<Settings>(initial);
