import { createStore } from "./Store";
import { looksLikeRunLog, parseRunCsv, recordedRunStore } from "./RecordedRun";
import { MAX_RUN_FILE_BYTES, validateRun } from "./RunValidation";

/** The folder picked in the Runs dropdown, listed so a run can be chosen with one click. */
export const runDirHandleStore = createStore<FileSystemDirectoryHandle | null>(null);

/** Name of the file the loaded run came from, so the folder list can tick it. */
export const runFileNameStore = createStore<string | null>(null);

/**
 * A run that failed to load, waiting to be shown in the format popup. Global rather than local to
 * one component because a bad file can arrive from the file picker, a drop, or the folder list,
 * and all three should end in the same popup.
 */
export const runLoadErrorStore = createStore<{ fileName: string, problems: string[] } | null>(null);

/**
 * Loads a run log end to end: size check, format sniff, parse, validate.
 *
 * Every failure lands in runLoadErrorStore with a reason instead of throwing, and a failed load
 * leaves any previously loaded run in place. Replacing a good overlay with nothing because the
 * next file was bad would be a worse outcome than keeping what was already on screen.
 *
 * Returns true when the run was loaded.
 */
export async function loadRunFromFile(file: File): Promise<boolean> {
    const fail = (problems: string[]) => {
        runLoadErrorStore.setState({ fileName: file.name, problems });
        return false;
    };

    // Checked before reading: parsing a huge file would freeze the tab before any message showed
    if (file.size > MAX_RUN_FILE_BYTES) {
        return fail([`The file is ${(file.size / 1024 / 1024).toFixed(1)} MB. A run log is normally well under 1 MB, so this is probably not a run.`]);
    }

    let text: string;
    try {
        text = await file.text();
    } catch {
        return fail(["The file could not be read. It may have been moved, or the browser lost permission to it."]);
    }

    if (!looksLikeRunLog(text)) {
        // A mikGen path is the most likely wrong file, since both live in the same folders
        const isPath = text.trimStart().startsWith("{");
        return fail([isPath
            ? "This looks like a mikGen path file, not a run log. Open paths with File > Open File."
            : "The first line that is not a comment is not a run log header. It needs at least t_ms, x and y columns."]);
    }

    const { run, warnings } = parseRunCsv(text, file.name.replace(/\.[^/.]+$/, ""));
    if (run === null) return fail(warnings);

    const problems = validateRun(run);
    if (problems.length > 0) return fail(problems);

    // Rows skipped for a missing value are not fatal; the rest of the run is still worth showing
    if (warnings.length > 0) console.warn(`Run "${file.name}" loaded with ${warnings.length} skipped row(s):`, warnings);

    recordedRunStore.setState(run);
    runFileNameStore.setState(file.name);
    return true;
}

/**
 * Loads a run from a file system handle, as the folder list and the file picker provide.
 *
 * Getting the File out of a handle can fail on its own: the file may have been deleted or moved
 * since the folder was listed, or the browser may have revoked permission. That failure happens
 * before loadRunFromFile ever runs, so it is caught here and reported through the same popup
 * rather than escaping as an unhandled promise rejection that nothing on screen would mention.
 */
export async function loadRunFromHandle(handle: FileSystemFileHandle): Promise<boolean> {
    let file: File;
    try {
        file = await handle.getFile();
    } catch {
        runLoadErrorStore.setState({
            fileName: handle.name,
            problems: ["The file could not be opened. It may have been moved or deleted, or the browser may need permission again. Try choosing the folder again."],
        });
        return false;
    }
    return loadRunFromFile(file);
}

/** Removes the loaded run, leaving the chosen folder open. */
export function clearRun() {
    recordedRunStore.setState(null);
    runFileNameStore.setState(null);
}
