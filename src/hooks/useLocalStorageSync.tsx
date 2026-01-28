import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";
import { undoHistory } from "../core/Undo/UndoHistory";

export default function useLocalStorageSync() {
    const [ settings, ] = useSettings();
    const undoHistoryStore = undoHistory.useStore(); 

    useEffect(() => {
        localStorage.setItem("ghostRobots", settings.ghostRobots ? "true" : "false");
        localStorage.setItem("robotPosition", settings.robotPosition ? "true" : "false");
        localStorage.setItem("precisePath", settings.precisePath ? "true" : "false");
    }, [settings.ghostRobots, settings.robotPosition, settings.precisePath]);

    const skipFirstState = useRef(true);

    useEffect(() => {
        if (skipFirstState.current) {
            skipFirstState.current = false;
            return;
        }

        const latestState = undoHistoryStore[undoHistoryStore.length - 1];
        if (latestState) {
            console.log(latestState.path);
            localStorage.setItem("appState", JSON.stringify(latestState));
        }

    }, [undoHistoryStore.length]);
}