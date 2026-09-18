import { describe, it, expect } from "vitest";
import { looksLikeRunLog, parseRunCsv } from "./RecordedRun";

const HEADER = "t_ms,x,y,theta";

describe("parseRunCsv", () => {
    it("reads a row and converts milliseconds to seconds", () => {
        const { run, warnings } = parseRunCsv(`${HEADER}\n20,-48.5,-60.25,90`, "run");

        expect(warnings).toEqual([]);
        expect(run?.samples).toEqual([{ t: 0.02, x: -48.5, y: -60.25, angle: 90 }]);
    });

    it("ignores extra columns, so a log carrying more than the four still loads", () => {
        // the full set of columns the mikLib logger writes
        const { run, warnings } = parseRunCsv(
            "t_ms,x,y,theta,tx,ty,ttheta,cx,cy,xte,seg,moving\n0,1.5,2.5,90,3,4,90,nan,nan,0.25,2,1",
            "run",
        );
        expect(warnings).toEqual([]);
        expect(run?.samples).toEqual([{ t: 0, x: 1.5, y: 2.5, angle: 90 }]);
    });

    it("ignores column order", () => {
        const { run } = parseRunCsv("battery,y,t_ms,x,theta\n12.4,7,1000,3,45", "run");
        expect(run?.samples[0]).toEqual({ t: 1, x: 3, y: 7, angle: 45 });
    });

    it("accepts other common names for the four columns", () => {
        const { run } = parseRunCsv("time_ms,x_position,y_position,orientation_deg\n0,1,2,3", "run");
        expect(run?.samples[0]).toEqual({ t: 0, x: 1, y: 2, angle: 3 });
    });

    it("skips comments and blank lines", () => {
        const { run, warnings } = parseRunCsv(`# a run\n\n${HEADER}\n0,1,2,3\n`, "run");
        expect(warnings).toEqual([]);
        expect(run?.samples).toHaveLength(1);
    });

    it("does not read a blank cell as zero", () => {
        const { run, warnings } = parseRunCsv(`${HEADER}\n0,,2,3\n20,1,2,3`, "run");
        expect(run?.samples).toHaveLength(1);
        expect(warnings[0]).toContain("Row 2");
    });

    it("skips a malformed row but keeps the rest", () => {
        const { run, warnings } = parseRunCsv(`${HEADER}\n0,1,2,3\n20,nope,2,3\n40,5,6,7`, "run");
        expect(run?.samples).toHaveLength(2);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("Row 3");
    });

    it("names the missing column rather than returning a run", () => {
        const { run, warnings } = parseRunCsv("t_ms,x,y\n0,1,2", "run");
        expect(run).toBeNull();
        expect(warnings[0]).toContain("theta");
    });

    it("returns null for an empty or header only log", () => {
        expect(parseRunCsv("", "run").run).toBeNull();
        expect(parseRunCsv(HEADER, "run").run).toBeNull();
    });
});

describe("looksLikeRunLog", () => {
    it("recognises a run log by its header", () => {
        expect(looksLikeRunLog(`${HEADER}\n0,1,2,3`)).toBe(true);
    });

    it("does not mistake a mikGen path for one", () => {
        expect(looksLikeRunLog('{"format":"mikLib","path":{"segments":[]}}')).toBe(false);
    });
});

describe("files re-saved by other programs", () => {
    // Excel saves UTF-8 CSV with a byte order mark in front of the header. This passes today only
    // because trim() strips U+FEFF, so the test is here to stop that being lost by accident.
    it("reads a log that starts with a byte order mark", () => {
        const { run, warnings } = parseRunCsv("﻿" + `${HEADER}\n0,1,2,3\n20,1,3,3`, "r");
        expect(warnings).toEqual([]);
        expect(run?.samples).toHaveLength(2);
    });

    it("reads a log with Windows line endings", () => {
        const { run, warnings } = parseRunCsv(`${HEADER}\r\n0,1,2,3\r\n20,1,3,3\r\n`, "r");
        expect(warnings).toEqual([]);
        expect(run?.samples).toHaveLength(2);
    });
});
