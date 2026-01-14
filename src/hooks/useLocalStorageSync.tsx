import { useEffect, useSyncExternalStore } from "react";
import { useSettings } from "./useSettings";
import { useFormat } from "./useFormat";
import { useField } from "./useField";
import { usePath } from "./usePath";
import { useCommand } from "./useCommands";
import { robotConstantsStore } from "../core/Robot";
import { globalDefaultsStore } from "../core/DefaultConstants";
import type { FileFormat } from "./useFileFormat";


export default function useLocalStorageSync() {
    const [ settings, ] = useSettings();
    const [ format,  ] = useFormat();
    const [ field,  ] = useField();
    const [ path, ] = usePath();
    const robotStore = useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.getState);
    const defaultsStore = useSyncExternalStore(globalDefaultsStore.subscribe, globalDefaultsStore.getState);

    const [ commands , ] = useCommand(); 

    useEffect(() => {
        localStorage.setItem("ghostRobots", settings.ghostRobots ? "true" : "false");
    }, [settings.ghostRobots]);

    useEffect(() => {
        const newAppState: FileFormat = {
            format,
            field,
            path,
            commands,
            robot: robotStore,
            defaults: defaultsStore[format]
        };

        localStorage.setItem("appState", JSON.stringify(newAppState));

    }, [path, field, format, commands, robotStore, defaultsStore]);
}