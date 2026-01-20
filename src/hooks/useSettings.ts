import { createSharedState } from "../core/SharedState";

type Settings = {
    ghostRobots: boolean,
    robotPosition: boolean
}

const savedGhostRobot = localStorage.getItem("ghostRobots");
const initialGhostRobots = savedGhostRobot === null ? true : savedGhostRobot === "true";

const savedRobotPosition = localStorage.getItem("robotPosition");
const initialRobotsPosition = savedRobotPosition === null ? false : savedRobotPosition === "true";

export const useSettings = createSharedState<Settings>({
    ghostRobots: initialGhostRobots,
    robotPosition: initialRobotsPosition
})