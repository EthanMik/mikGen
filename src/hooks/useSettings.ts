import { createSharedState } from "../core/SharedState";

export type Settings = {
    onionLayers: boolean;
    /** Inches of travel between onion layers. 0 draws only the segment end positions. */
    onionSpacing: number;
    robotPosition: boolean;
    precisePath: boolean;
    /**
     * Draws a loaded run over the field, in the precise path's dot style. Toggled from the Runs
     * dropdown or with E. Off by default, and RunLayer additionally renders nothing until a run
     * is loaded, so the field looks untouched for anyone not using the feature.
     */
    showRun: boolean;
    /**
     * Shows a readout of cross track error when hovering the drawn run: how far the real robot
     * was from the precise path of whatever path is open.
     * Off by default because it makes the run catch the pointer.
     */
    runErrorOnHover: boolean;
    numberedPath: boolean;
    loopPath: boolean;
    snapToGrid: number;
    snappingEnabled: boolean;
};

const DEFAULTS: Settings = {
    onionLayers: false,
    onionSpacing: 0,
    robotPosition: false,
    precisePath: false,
    showRun: false,
    runErrorOnHover: false,
    numberedPath: false,
    loopPath: false,
    snapToGrid: 0.5,
    snappingEnabled: false
};

const saved = localStorage.getItem("settings");
const parsed: Partial<Settings> = saved ? JSON.parse(saved) : {};
const initial = Object.fromEntries(
    (Object.keys(DEFAULTS) as (keyof Settings)[]).map(k => [k, parsed[k] ?? DEFAULTS[k]])
) as Settings;

export const useSettings = createSharedState<Settings>(initial);
