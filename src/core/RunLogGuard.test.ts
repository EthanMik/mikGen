import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { looksLikeRunLog } from "./RecordedRun";
import { loadContentIntoState } from "./FileStore";
import { fileFormatStore } from "../hooks/useFileFormat";
import { newFileFormat } from "./FileSchema";

const RUN = "# mikGen run log v1\nt_ms,x,y,theta,xte,seg,moving\n0,1,2,3,0.5,0,1\n20,1,2,3,0.5,0,1";
const PATH = JSON.stringify({
    format: "mikLib", field: "override-v5-match",
    path: { name: "p", segments: [{ id: "s0", kind: "start", pose: { x: 0, y: 0, angle: 0 } }] },
});

describe("looksLikeRunLog", () => {
    it("recognises a run log by its header", () => {
        expect(looksLikeRunLog(RUN)).toBe(true);
        expect(looksLikeRunLog("time_ms,x_position,y_position\n0,1,2")).toBe(true);
    });

    it("does not mistake a path file for one", () => {
        expect(looksLikeRunLog(PATH)).toBe(false);
    });

    it("needs a time column as well as x and y", () => {
        expect(looksLikeRunLog("x,y,heading\n1,2,3")).toBe(false);
    });

    it("skips comments and blanks before deciding", () => {
        expect(looksLikeRunLog("# note\n\n# another\nt_ms,x,y\n0,1,2")).toBe(true);
    });

    it("says no to an empty file", () => {
        expect(looksLikeRunLog("")).toBe(false);
    });
});

describe("opening a run log as a path", () => {
    let alertSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        alertSpy = vi.fn();
        vi.stubGlobal("alert", alertSpy);
        // the success path autosaves, which this suite does not otherwise need
        const store = new Map<string, string>();
        vi.stubGlobal("localStorage", {
            getItem: (k: string) => store.get(k) ?? null,
            setItem: (k: string, v: string) => void store.set(k, v),
            removeItem: (k: string) => void store.delete(k),
            clear: () => store.clear(),
        });
        fileFormatStore.setState(newFileFormat("mikLib", "override-v5-match", "keep me"));
    });
    afterEach(() => vi.unstubAllGlobals());

    it("refuses it and leaves the open path alone", () => {
        loadContentIntoState(RUN, "square-run");

        // The real damage was not the empty path: the file handle was kept and a later save
        // wrote that empty path back over the log on disk.
        expect(fileFormatStore.getState().path.name).toBe("keep me");
        expect(alertSpy).toHaveBeenCalledOnce();
        expect(String(alertSpy.mock.calls[0][0])).toContain("Import Run");
    });

    it("still opens a real path file", () => {
        loadContentIntoState(PATH, "a-path");
        // deserializeToState names the path after the file, so the segments are what to check
        expect(fileFormatStore.getState().path.segments).toHaveLength(1);
        expect(fileFormatStore.getState().path.segments[0].kind).toBe("start");
        expect(alertSpy).not.toHaveBeenCalled();
    });
});
