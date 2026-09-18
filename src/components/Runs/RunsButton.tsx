import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import ConfigButtonTemplate from "../Config/ConfigButtonTemplate";
import { ConfigCheckboxButton } from "../Util/CheckboxButton";
import { ConfigKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";
import Tooltip from "../Util/Tooltip";
import RunFormatPopup from "./RunFormatPopup";
import { recordedRunStore } from "../../core/RecordedRun";
import { clearRun, loadRunFromFile, loadRunFromHandle, runDirHandleStore, runFileNameStore, runLoadErrorStore } from "../../core/RunStore";
import { fileFormatStore } from "../../hooks/useFileFormat";
import { useSettings } from "../../hooks/useSettings";
import fileIcon from "../../assets/file.svg";
import folderIcon from "../../assets/folder.svg";
import back from "../../assets/back.svg";
import refresh from "../../assets/cw.svg";
import check from "../../assets/check.svg";

/** Firefox has no File System Access API, so it can open a single run but not browse a folder. */
const canUseFileHandles = "showOpenFilePicker" in window;

type Entry = { name: string, kind: "file" | "directory", handle: FileSystemFileHandle | FileSystemDirectoryHandle };

/** Folders first, then run logs, each alphabetical. Anything that cannot be a run is left out. */
async function readRunEntries(handle: FileSystemDirectoryHandle): Promise<Entry[]> {
    const out: Entry[] = [];
    for await (const [name, h] of handle.entries()) {
        const kind = h.kind as "file" | "directory";
        if (kind === "file" && !/\.(csv|txt)$/i.test(name)) continue;
        out.push({ name, kind, handle: h as Entry["handle"] });
    }
    out.sort((a, b) => a.kind !== b.kind ? (a.kind === "directory" ? -1 : 1) : a.name.localeCompare(b.name));
    return out;
}

/** A picker the reader closed without choosing throws AbortError, which is not a failure worth reporting. */
function isAbort(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

/**
 * The Runs dropdown: open a single run log or a whole folder of them, pick one to overlay, and
 * control how it is shown. Everything to do with runs lives here, so the File menu stays about
 * paths and Settings stays as it was.
 */
export default function RunsButton() {
    const [settings, setSettings] = useSettings();
    const run = recordedRunStore.useStore();
    const runFileName = runFileNameStore.useStore();
    const rootHandle = runDirHandleStore.useStore();
    const loadError = runLoadErrorStore.useStore();
    // A path needs a motion beyond its start pose before there is anything to compare a run against
    const hasPath = fileFormatStore.useSelector(s => s.path.segments.length >= 2);

    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(rootHandle);
    const [history, setHistory] = useState<FileSystemDirectoryHandle[]>([]);
    const [entries, setEntries] = useState<Entry[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stable, so the popup attaches its Escape and click outside listeners once rather than on
    // every render. Closing the popup is what clears the stored error.
    const setPopupOpen = useCallback((next: SetStateAction<boolean>) => {
        const isOpen = typeof next === "function" ? next(true) : next;
        if (!isOpen) runLoadErrorStore.setState(null);
    }, []);

    const set = (key: "showRun" | "runErrorOnHover") => (state: boolean) =>
        setSettings(prev => ({ ...prev, [key]: state }));

    // A run loaded while Show Run is off would draw nothing, which reads exactly like a failed load.
    // Turning it on after a successful load removes that confusion.
    const showIfLoaded = (loaded: boolean) => { if (loaded) set("showRun")(true); };

    // A newly picked folder starts from its top, with no back history
    useEffect(() => {
        setDirHandle(rootHandle);
        setHistory([]);
        if (rootHandle === null) setEntries([]);
    }, [rootHandle]);

    const listFolder = (handle: FileSystemDirectoryHandle) => {
        // Permission can be revoked, or the folder removed, after it was chosen
        readRunEntries(handle).then(setEntries).catch(() => setEntries([]));
    };

    useEffect(() => {
        if (dirHandle !== null) listFolder(dirHandle);
    }, [dirHandle]);

    const chooseFile = async () => {
        if (!canUseFileHandles) { fileInputRef.current?.click(); return; }
        let handle: FileSystemFileHandle | undefined;
        try {
            // @ts-expect-error showOpenFilePicker not in all TS DOM libs
            [handle] = await window.showOpenFilePicker({
                types: [{ description: "Run Logs", accept: { "text/csv": [".csv", ".txt"] } }],
                multiple: false,
            });
        } catch (error) {
            if (!isAbort(error)) console.error("Could not open the file picker:", error);
            return;
        }
        // Kept outside the try above, so a file that fails to load is reported rather than
        // mistaken for the picker being closed
        if (handle) showIfLoaded(await loadRunFromHandle(handle));
    };

    const chooseFolder = async () => {
        try {
            // @ts-expect-error showDirectoryPicker not in all TS DOM libs
            runDirHandleStore.setState(await window.showDirectoryPicker({ mode: "read" }));
        } catch (error) {
            if (!isAbort(error)) console.error("Could not open the folder picker:", error);
        }
    };

    // Dropping a file loads it and dropping a folder browses it, matching the Export dropdown
    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const item = e.dataTransfer.items[0];
            const getHandle = (item as DataTransferItem & { getAsFileSystemHandle?: () => Promise<FileSystemHandle | null> })?.getAsFileSystemHandle;
            const handle = getHandle ? await getHandle.call(item) : null;
            if (handle?.kind === "directory") { runDirHandleStore.setState(handle as FileSystemDirectoryHandle); return; }
            if (handle?.kind === "file") { showIfLoaded(await loadRunFromHandle(handle as FileSystemFileHandle)); return; }
            const file = e.dataTransfer.files[0];
            if (file) showIfLoaded(await loadRunFromFile(file));
        } catch (error) {
            runLoadErrorStore.setState({ fileName: "dropped file", problems: [`The dropped item could not be read: ${error instanceof Error ? error.message : String(error)}`] });
        }
    };

    const enterFolder = (h: FileSystemDirectoryHandle) => {
        if (dirHandle) setHistory(prev => [...prev, dirHandle]);
        setDirHandle(h);
    };

    const goBack = () => {
        const prev = history[history.length - 1];
        if (!prev) return;
        setHistory(h => h.slice(0, -1));
        setDirHandle(prev);
    };

    const iconButtons = [
        { icon: back, visible: history.length > 0, onClick: goBack, tooltip: "Go Back" },
        { icon: refresh, visible: dirHandle !== null, onClick: () => { if (dirHandle) listFolder(dirHandle); }, tooltip: "Refresh Folder" },
    ];

    return (
        <>
            {loadError && (
                <RunFormatPopup
                    fileName={loadError.fileName}
                    problems={loadError.problems}
                    open={loadError !== null}
                    setOpen={setPopupOpen}
                />
            )}

            {/* Only used where the File System Access API is missing */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                style={{ display: "none" }}
                onChange={async e => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) showIfLoaded(await loadRunFromFile(file));
                }}
            />

            <ConfigButtonTemplate title="Runs" iconButtons={iconButtons}>
                <div className="flex flex-col gap-1" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
                    <Tooltip label="Open a run log, or drag one onto this button" placement="right" speed="slow">
                        <ConfigKeybindButton
                            name="Choose File"
                            keybind={<img src={fileIcon} className="w-3.5 h-3.5" />}
                            callback={chooseFile}
                        />
                    </Tooltip>
                    <Tooltip
                        label={canUseFileHandles ? "Pick a folder of run logs to browse" : "Your browser can't open folders. Use Choose File instead."}
                        placement="right"
                        speed="slow"
                    >
                        <ConfigKeybindButton
                            name="Choose Folder"
                            keybind={<img src={folderIcon} className="w-3.5 h-3.5" />}
                            callback={chooseFolder}
                            disabled={!canUseFileHandles}
                        />
                    </Tooltip>
                </div>

                {dirHandle !== null && (
                    <>
                        <Section />
                        <span className="text-[12px] text-lightgray px-2 truncate">{dirHandle.name}</span>
                        {entries.length === 0
                            ? <span className="text-[12px] opacity-40 px-2">No run logs here</span>
                            : entries.map(entry => (
                                <button
                                    key={entry.name}
                                    className="flex flex-row px-2 py-0.5 items-center justify-between cursor-pointer rounded-sm w-full text-left hover:bg-medlightgray"
                                    onClick={async () => {
                                        if (entry.kind === "directory") enterFolder(entry.handle as FileSystemDirectoryHandle);
                                        else showIfLoaded(await loadRunFromHandle(entry.handle as FileSystemFileHandle));
                                    }}
                                >
                                    <span className="text-[13px] truncate min-w-0">{entry.name}</span>
                                    <div className="flex items-center shrink-0 ml-1 gap-1">
                                        {entry.kind === "file" && runFileName === entry.name && <img src={check} className="w-3 h-3" />}
                                        <img src={entry.kind === "file" ? fileIcon : folderIcon} className="w-3.5 h-3.5" />
                                    </div>
                                </button>
                            ))}
                    </>
                )}

                <Section />
                <ConfigCheckboxButton
                    name="Show Run"
                    label="Draws the loaded run over the field (E)"
                    checked={settings.showRun}
                    setChecked={set("showRun")}
                />
                <ConfigCheckboxButton
                    name="Error on Hover"
                    label="Hover the run to see how far it was from the precise path"
                    checked={settings.runErrorOnHover}
                    setChecked={set("runErrorOnHover")}
                />
                <ConfigKeybindButton name="Clear Run" keybind="" callback={clearRun} disabled={run === null} />

                {run !== null && (
                    <span className="text-[12px] text-lightgray px-2">
                        {/* The run always draws in full; only the hover comparison needs a path */}
                        {hasPath
                            ? `${run.samples.length} samples loaded.`
                            : `${run.samples.length} samples loaded. Open a path to see cross track error on hover.`}
                    </span>
                )}
            </ConfigButtonTemplate>
        </>
    );
}
