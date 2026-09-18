import type { RecordedRun } from "./RecordedRun";

/**
 * The run log format, described once so the error popup and the tests cannot drift apart. These are
 * the only columns a run needs; any other column in the file is ignored.
 */
export const RUN_FORMAT_COLUMNS: { name: string, meaning: string }[] = [
    { name: "t_ms", meaning: "Milliseconds since logging started" },
    { name: "x", meaning: "Robot x in inches from field centre" },
    { name: "y", meaning: "Robot y in inches from field centre" },
    { name: "theta", meaning: "Heading in degrees, 0 along +Y, clockwise positive" },
];

export const RUN_FORMAT_EXAMPLE = [
    "t_ms,x,y,theta",
    "0,-48.000,-60.000,0.00",
    "20,-47.932,-59.600,0.10",
].join("\n");

/**
 * Larger than any honest log. A 60 second skills run at 50 Hz is 3000 rows and well under 1 MB, so a
 * file past this is almost certainly the wrong file, and parsing it would freeze the tab first.
 */
export const MAX_RUN_FILE_BYTES = 20 * 1024 * 1024;

/**
 * How far from centre a position may sit and still count as on the field. The field is 145 in
 * square, so its edge is about 72.6 in out; the margin allows for a robot pushed against a wall.
 */
const FIELD_LIMIT_IN = 90;

/**
 * Checks a parsed run for problems that would make it meaningless to draw. Returns a list of human
 * readable problems; an empty list means the run is good to display.
 *
 * None of these depend on the open path, so a run can be loaded whether or not a path is open.
 * Parsing already rejects rows that are not numbers. This looks for runs that parse cleanly yet are
 * still wrong: too short to draw, glued together from two recordings, or recorded in the wrong units.
 */
export function validateRun(run: RecordedRun): string[] {
    const problems: string[] = [];
    const samples = run.samples;

    if (samples.length < 2) {
        problems.push(`The log has ${samples.length} readable row${samples.length === 1 ? "" : "s"}; at least 2 are needed to draw a run.`);
        return problems;
    }

    // Time only runs forwards within one recording. A jump backwards means two logs were pasted
    // together, and drawing them as one would mix two unrelated runs on the field.
    for (let i = 1; i < samples.length; i++) {
        if (samples[i].t < samples[i - 1].t) {
            problems.push(`t_ms goes backwards at data row ${i + 1} (${Math.round(samples[i - 1].t * 1000)} then ${Math.round(samples[i].t * 1000)}). This usually means two runs were joined into one file.`);
            break;
        }
    }

    // A log in millimetres or metres parses fine but lands far off the field or crushed into its
    // centre. Only a majority off the field is treated as a units problem, so a few odometry
    // glitches near a wall do not reject an otherwise good run.
    const off = samples.filter(s => Math.abs(s.x) > FIELD_LIMIT_IN || Math.abs(s.y) > FIELD_LIMIT_IN).length;
    if (off > samples.length / 2) {
        problems.push(`${off} of ${samples.length} positions are off the field. x and y must be inches from field centre, which runs from about -72 to 72; a log in millimetres or metres will not line up.`);
    }

    return problems;
}
