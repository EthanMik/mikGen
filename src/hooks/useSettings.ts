import { createSharedState } from "../core/SharedState";

type Settings = {
    ghostRobots: boolean,
    robotPosition: boolean,
    precisePath: boolean,
    numberedPath: boolean
}

const savedGhostRobot = localStorage.getItem("ghostRobots");
const initialGhostRobots = savedGhostRobot === null ? false : savedGhostRobot === "true";

const savedRobotPosition = localStorage.getItem("robotPosition");
const initialRobotsPosition = savedRobotPosition === null ? false : savedRobotPosition === "true";

const savedPrecisePath = localStorage.getItem("precisePath");
const initialPrecisePath = savedPrecisePath === null ? false : savedPrecisePath === "true";

const savedNumberedPath = localStorage.getItem("precisePath");
const initialNumberedPath = savedNumberedPath === null ? false : savedNumberedPath === "true";

export const useSettings = createSharedState<Settings>({
    ghostRobots: initialGhostRobots,
    robotPosition: initialRobotsPosition,
    precisePath: initialPrecisePath,
    numberedPath: initialNumberedPath

})