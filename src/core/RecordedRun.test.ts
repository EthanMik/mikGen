import { describe, it, expect } from "vitest";
import { parseRunCsv, samplesBySegment } from "./RecordedRun";

const HEADER = "t_ms,x,y,theta,tx,ty,ttheta,xte,seg,kind,moving";
const CARROT_HEADER = "t_ms,x,y,theta,cx,cy,seg,moving";

describe("parseRunCsv", () => {
    it("reads a full row and converts milliseconds to seconds", () => {
        const { run, warnings } = parseRunCsv(
            `${HEADER}\n20,-48.5,-60.25,90,-48,-60,90,0.25,0,drive_to_point,1`,
            "run",
        );

        expect(warnings).toEqual([]);
        expect(run?.samples).toHaveLength(1);
        expect(run?.samples[0]).toEqual({
            t: 0.02,
            x: -48.5,
            y: -60.25,
            angle: 90,
            target: { x: -48, y: -60, angle: 90 },
            xte: 0.25,
            seg: 0,
            kind: "drive_to_point",
            moving: true,
        });
    });

    it("flags whether the log carried the algorithm's own error", () => {
        const withError = parseRunCsv(`${HEADER}\n0,0,0,0,0,0,0,1.5,0,x,1`, "a");
        expect(withError.run?.hasAlgError).toBe(true);

        const without = parseRunCsv("t_ms,x,y,theta\n0,0,0,0", "b");
        expect(without.run?.hasAlgError).toBe(false);
        expect(without.run?.samples[0].xte).toBeUndefined();
    });

    it("ignores column order and unknown columns", () => {
        const { run } = parseRunCsv("battery,y,t_ms,x,theta\n12.4,7,1000,3,45", "run");
        expect(run?.samples[0]).toMatchObject({ t: 1, x: 3, y: 7, angle: 45 });
    });

    it("accepts mikLib's own field names as aliases", () => {
        const { run } = parseRunCsv(
            "time_ms,x_position,y_position,orientation_deg,desired_x_position,desired_y_position,desired_heading,error_left,motion_index,motion_running\n" +
            "0,1,2,3,4,5,6,7,2,0",
            "run",
        );
        expect(run?.samples[0]).toMatchObject({
            x: 1, y: 2, angle: 3, xte: 7, seg: 2, moving: false,
        });
        expect(run?.samples[0].target).toEqual({ x: 4, y: 5, angle: 6 });
    });

    it("skips comments and blank lines", () => {
        const { run, warnings } = parseRunCsv(
            `# mikGen run log v1\n\n${HEADER}\n0,1,2,3,,,,,0,,1\n`,
            "run",
        );
        expect(warnings).toEqual([]);
        expect(run?.samples).toHaveLength(1);
    });

    it("leaves target absent when the motion had no positional goal", () => {
        const { run } = parseRunCsv(`${HEADER}\n0,1,2,3,,,90,4,0,turn_to_angle,1`, "run");
        expect(run?.samples[0].target).toBeUndefined();
        expect(run?.samples[0].xte).toBe(4);
    });

    it("does not read a blank cell as zero", () => {
        const { run } = parseRunCsv(`${HEADER}\n0,1,2,3,,,,,0,,1`, "run");
        expect(run?.samples[0].xte).toBeUndefined();
    });

    it("skips a malformed row but keeps the rest", () => {
        const { run, warnings } = parseRunCsv(
            `${HEADER}\n0,1,2,3,,,,,0,,1\n20,nope,2,3,,,,,0,,1\n40,5,6,7,,,,,0,,1`,
            "run",
        );
        expect(run?.samples).toHaveLength(2);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("Row 3");
    });

    it("reports a missing required column instead of returning a run", () => {
        const { run, warnings } = parseRunCsv("t_ms,x,y\n0,1,2", "run");
        expect(run).toBeNull();
        expect(warnings[0]).toContain("theta");
    });

    it("returns null for an empty or header-only log", () => {
        expect(parseRunCsv("", "run").run).toBeNull();
        expect(parseRunCsv(HEADER, "run").run).toBeNull();
    });
});

describe("carrot columns", () => {
    it("reads a carrot when both halves are present", () => {
        const { run } = parseRunCsv(`${CARROT_HEADER}
0,1,2,3,7.5,8.5,0,1`, "run");
        expect(run?.samples[0].carrot).toEqual({ x: 7.5, y: 8.5 });
    });

    it("treats a NaN carrot as absent, which is how a non-boomerang motion logs it", () => {
        const { run } = parseRunCsv(`${CARROT_HEADER}
0,1,2,3,nan,nan,0,1`, "run");
        expect(run?.samples[0].carrot).toBeUndefined();
    });

    it("does not invent a carrot from half a pair", () => {
        const { run } = parseRunCsv(`${CARROT_HEADER}
0,1,2,3,7.5,,0,1`, "run");
        expect(run?.samples[0].carrot).toBeUndefined();
    });
});

describe("samplesBySegment", () => {
    it("groups rows by the log's segment counter", () => {
        const { run } = parseRunCsv(
            `${HEADER}\n0,0,0,0,,,,,0,,1\n20,1,1,0,,,,,0,,1\n40,2,2,0,,,,,2,,1`,
            "run",
        );
        const grouped = samplesBySegment(run!);

        expect(grouped).toHaveLength(3);
        expect(grouped[0]).toHaveLength(2);
        // A gap in the counter keeps its slot, so indexes still line up with the path's segments
        expect(grouped[1]).toHaveLength(0);
        expect(grouped[2]).toHaveLength(1);
    });
});

describe("samplesBySegment robustness", () => {
    const rows = (...segs: (number | string)[]) =>
        parseRunCsv("t_ms,x,y,theta,seg\n" + segs.map((s, i) => `${i * 20},1,2,3,${s}`).join("\n"), "r").run!;

    it("drops rows from before the first motion instead of padding motion 0", () => {
        const g = samplesBySegment(rows(-1, -1, 0, 0));
        expect(g).toHaveLength(1);
        expect(g[0]).toHaveLength(2);
    });

    it("refuses an implausible index rather than allocating for it", () => {
        const g = samplesBySegment(rows(0, 999999999, 1));
        expect(g).toHaveLength(2);
        expect(g.flat()).toHaveLength(2);
    });

    it("ignores a fractional index", () => {
        expect(samplesBySegment(rows(0, 1.5)).flat()).toHaveLength(1);
    });
});
