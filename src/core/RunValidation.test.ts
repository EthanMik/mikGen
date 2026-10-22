import { describe, it, expect } from "vitest";
import { parseRunCsv } from "./RecordedRun";
import { RUN_FORMAT_COLUMNS, RUN_FORMAT_EXAMPLE, validateRun } from "./RunValidation";

const run = (body: string) => parseRunCsv("t_ms,x,y,theta\n" + body, "r").run!;

describe("validateRun", () => {
    it("accepts a well formed run", () => {
        // a short straight drive north
        const rows = Array.from({ length: 30 }, (_, i) => `${i * 20},-12,${-12 + i * 0.8},0`).join("\n");
        expect(validateRun(run(rows))).toEqual([]);
    });

    it("rejects a run too short to draw", () => {
        expect(validateRun(run("0,1,2,3"))[0]).toContain("at least 2");
    });

    it("rejects two runs glued together", () => {
        expect(validateRun(run("0,1,2,3\n20,1,2,3\n10,1,2,3"))[0]).toContain("backwards");
    });

    it("rejects a log recorded in millimetres", () => {
        const mm = [0, 20, 40].map(t => `${t},-1200,-1500,0`).join("\n");
        expect(validateRun(run(mm)).join(" ")).toContain("off the field");
    });

    it("tolerates a few off field glitches", () => {
        const rows = Array.from({ length: 10 }, (_, i) => `${i * 20},${i === 3 ? 120 : 10},10,0`).join("\n");
        expect(validateRun(run(rows))).toEqual([]);
    });

    it("accepts a robot that only turned in place, which is still a valid run", () => {
        expect(validateRun(run("0,5,5,0\n20,5,5,45\n40,5,5,90"))).toEqual([]);
    });
});

describe("the documented format", () => {
    it("parses its own example without complaint", () => {
        const { run: r, warnings } = parseRunCsv(RUN_FORMAT_EXAMPLE, "example");
        expect(warnings).toEqual([]);
        expect(validateRun(r!)).toEqual([]);
    });

    it("needs exactly t_ms, x, y and theta", () => {
        expect(RUN_FORMAT_COLUMNS.map(c => c.name).join(",")).toBe("t_ms,x,y,theta");
    });
});
