import Tooltip from "../Util/Tooltip";
import { recordedRunStore } from "../../core/RecordedRun";

/**
 * A small line under the path name saying which run is loaded. Nothing else on screen names the
 * run, and once drawn it is easy to mistake for part of the path. Renders nothing when no run is
 * loaded, so the path menu looks exactly as it always did for anyone not using runs.
 */
export default function RunLabel() {
    const run = recordedRunStore.useStore();
    if (run === null) return null;

    return (
        <Tooltip
            label={`${run.samples.length} samples. Runs > Clear Run to remove.`}
            placement="bottom"
        >
            <span className="block text-[11px] text-lightgray truncate min-w-0 leading-tight">
                run: {run.name}
            </span>
        </Tooltip>
    );
}
