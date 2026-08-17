import type { SetStateAction } from "react";
import type { PathSim } from "../core/ComputePathSim";
import type { Settings } from "../hooks/useSettings";
import { consumeSpacePan } from "../hooks/useSpaceHeld";

export function PathSimMacros() {
    function toggleRobotVisibility(
        evt: KeyboardEvent,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,
    ) {
        if (evt.key.toLowerCase() === "r" && !evt.ctrlKey) {
            setVisibility((v) => !v);
        }
    }

    function togglePrecisePath(
        evt: KeyboardEvent,
        setSettings: React.Dispatch<SetStateAction<Settings>>,
    ) {
        if (evt.key.toLowerCase() === "p" && !evt.ctrlKey) {
            setSettings((prev) => ({ ...prev, precisePath: !prev.precisePath }));
        }
    }

    function toggleOnionLayers(
        evt: KeyboardEvent,
        setSettings: React.Dispatch<SetStateAction<Settings>>,
    ) {
        if (evt.key.toLowerCase() === "o" && !evt.ctrlKey) {
            setSettings((prev) => ({ ...prev, onionLayers: !prev.onionLayers }));
        }
    }

    function toggleLoopPath(
        evt: KeyboardEvent,
        setSettings: React.Dispatch<SetStateAction<Settings>>,
    ) {
        if (evt.key === ";" && !evt.ctrlKey) {
            setSettings((prev) => ({ ...prev, loopPath: !prev.loopPath }));
        }
    }

    const togglePlaying = (
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,
    ) => {
        setPlaying((v) => {
            const newState = !v;
            if (newState) {
                setVisibility(true);
            }
            return newState;
        });
    };

    /** Using key "K" to start and stop simulator */
    const pauseSimulator = (
        evt: KeyboardEvent,
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,
    ) => {
        if (evt.key.toLowerCase() === "k") {
            evt.preventDefault();
            togglePlaying(setPlaying, setVisibility);
            evt.stopPropagation();
        }
    };

    /**
     * Space toggles on release, not on press, because holding it pans the field. A press that
     * panned is swallowed here, so only a plain tap reaches playback.
     */
    const releaseSimulator = (
        evt: KeyboardEvent,
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,
    ) => {
        if (evt.code !== "Space") return;
        if (consumeSpacePan()) return;

        evt.preventDefault();
        togglePlaying(setPlaying, setVisibility);
        evt.stopPropagation();
    };

    const scrubSimulator = (
        evt: KeyboardEvent,
        setPercent: React.Dispatch<React.SetStateAction<number>>,
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>,
        setVisibility: React.Dispatch<SetStateAction<boolean>>,    
        skip: React.RefObject<boolean>,
        computedPath: PathSim,
        smallStep: number,
        largeStep: number,
    ) => {
        const FAST_SCRUB_STEP = largeStep;
        const SLOW_SCRUB_STEP = smallStep;

        const scrub = evt.shiftKey
            ? (FAST_SCRUB_STEP / computedPath.totalTime) * 100
            : (SLOW_SCRUB_STEP / computedPath.totalTime) * 100;

        if (evt.key.toLowerCase() === "l") {
            setVisibility(true);
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
            setVisibility(true);
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
        togglePrecisePath,
        toggleOnionLayers,
        toggleLoopPath,
        pauseSimulator,
        releaseSimulator,
        scrubSimulator
    };
}
