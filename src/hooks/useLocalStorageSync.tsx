import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";
import { useFormat } from "./useFormat";
import { useField } from "./useField";
import { usePath } from "./usePath";
import { useCommand } from "./useCommands";
import { robotConstantsStore } from "../core/Robot";
import { globalDefaultsStore } from "../core/DefaultConstants";
import type { FileFormat } from "./useFileFormat";
import { undoHistory } from "../core/Undo/UndoHistory";

export default function useLocalStorageSync() {
    const [ settings, ] = useSettings();
    const [ format,  ] = useFormat();
    const [ field,  ] = useField();
    const [ path, ] = usePath();
    const robotStore = robotConstantsStore.useStore();
    const defaultsStore = globalDefaultsStore.useStore();
    const undoHistoryStore = undoHistory.useStore();

    const [ commands , ] = useCommand(); 

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

        const newAppState: FileFormat = {
            format,
            field,
            path,
            commands,
            robot: robotStore,
            defaults: defaultsStore[format]
        };

        console.log(newAppState.path)

        localStorage.setItem("appState", JSON.stringify(newAppState));

    }, [undoHistoryStore.length]);
}