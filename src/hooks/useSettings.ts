import { createSharedState } from "../core/SharedState";

type Settings = {
    ghostRobots: boolean
}

const saved = localStorage.getItem("ghostRobots");
const initialGhostRobots = saved === null ? true : saved === "true";

export const useSettings = createSharedState<Settings>({
    ghostRobots: initialGhostRobots
})