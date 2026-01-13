import { createSharedState } from "../core/SharedState";



type Settings = {
    ghostRobots: boolean
}

export const useSettings = createSharedState<Settings>({
    ghostRobots: true
})