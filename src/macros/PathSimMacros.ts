import type { SetStateAction } from "react";
import type { PathSim } from "../core/ComputePathSim";

export function PathSimMacros() {
    function toggleRobotVisibility(
        evt: KeyboardEvent,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,
    ) {        
        if (evt.key.toLowerCase() === "r" && !evt.ctrlKey) {
            setVisibility((v) => !v);
        }
    }

    /** Using key "P" to start and stop simulator */
    const pauseSimulator = (
        evt: KeyboardEvent,
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,
    ) => {
        if (evt.key.toLowerCase() === "k") {
            setPlaying((v) => {
                const newState = !v;
                if (newState) {
                    setVisibility(true);
                }
                return newState;
            });
            evt.stopPropagation();
        }
    };

    const scrubSimulator = (
        evt: KeyboardEvent,
        setPercent: React.Dispatch<React.SetStateAction<number>>,
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>,
        skip: React.RefObject<boolean>,
        computedPath: PathSim,
        smallStep: number,
        largeStep: number,
    ) => {
        const FAST_SCRUB_STEP = largeStep; // Move 1 second
        const SLOW_SCRUB_STEP = smallStep;

        const scrub = evt.shiftKey
            ? (FAST_SCRUB_STEP / computedPath.totalTime) * 100
            : (SLOW_SCRUB_STEP / computedPath.totalTime) * 100;

        if (evt.key.toLowerCase() === "l") {
            setPercent((p) => {
                if (p + scrub <= 100) {
                    return p + scrub;
                }
                return 100;
            });
            setPlaying(false);
            skip.current = false;
        }

        if (evt.key.toLowerCase() === "j") {
            setPercent((p) => {
                if (p - scrub >= 0) {
                    return p - scrub;
                }
                return 0;
            });
            setPlaying(false);
            skip.current = false;
        }
    };

    return {
        toggleRobotVisibility,
        pauseSimulator,
        scrubSimulator
    };
}
