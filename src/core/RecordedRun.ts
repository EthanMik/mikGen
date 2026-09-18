import { createStore } from "./Store";

/**
 * One row of a recorded run: where the robot was, and which way it faced, at one instant.
 *
 * Positions are field centric inches and angles are degrees with 0 along +Y and clockwise
 * positive. That is mikLib's odometry convention and mikGen's field convention already agreeing
 * exactly, so nothing in this file converts units, flips an axis, or offsets an angle. If a log
 * ever lands rotated or mirrored on the field, suspect the robot's starting pose rather than
 * anything here.
 *
 * A run carries nothing else. Anything derived from it, cross track error included, is worked out
 * on the website against the path that is open, which is what lets a run be loaded before, after
 * or without a path.
 */
export type RunSample = {
    /**
     * Seconds since logging started. The file counts milliseconds; the division happens once here
     * so that everything downstream shares the simulator's unit.
     */
    t: number,
    x: number,
    y: number,
    angle: number,
};

export type RecordedRun = {
    name: string,
    samples: RunSample[],
};

export const recordedRunStore = createStore<RecordedRun | null>(null);

/**
 * Whether a file is a run log rather than a path. Checked by the path loader too, because a run
 * log is not JSON and would otherwise be "repaired" into an empty path, quietly destroying whatever
 * was open. Only the header is inspected; a log can be megabytes.
 */
export function looksLikeRunLog(content: string): boolean {
    for (const line of content.slice(0, 2048).split(/\r?\n/)) {
        const l = line.trim();
        if (l === "" || l.startsWith("#")) continue;
        const cols = l.toLowerCase().split(",").map(c => c.trim());
        // the header row: a time column plus x and y
        return cols.some(c => ALIASES.t.includes(c))
            && cols.some(c => ALIASES.x.includes(c))
            && cols.some(c => ALIASES.y.includes(c));
    }
    return false;
}

export type ParseResult = {
    run: RecordedRun | null,
    /** Rows that could not be read, reported rather than thrown so one bad line cannot lose a run. */
    warnings: string[],
};

/**
 * Column names accepted for each field.
 *
 * The header drives the mapping rather than column position, which buys two things: a log may list
 * its columns in any order, and a log with extra columns still loads, those columns simply being
 * ignored. The first name in each list is the one the documented format uses, and is also the name
 * quoted back at the reader when a required column turns out to be missing.
 */
const ALIASES: Record<"t" | "x" | "y" | "angle", string[]> = {
    t: ["t_ms", "time_ms", "t", "time"],
    x: ["x", "x_pos", "x_position"],
    y: ["y", "y_pos", "y_position"],
    angle: ["theta", "angle", "heading", "orientation_deg"],
};

function buildColumnMap(header: string[]): Partial<Record<keyof typeof ALIASES, number>> {
    const map: Partial<Record<keyof typeof ALIASES, number>> = {};
    const lower = header.map(h => h.trim().toLowerCase());
    for (const field of Object.keys(ALIASES) as (keyof typeof ALIASES)[]) {
        for (const name of ALIASES[field]) {
            const at = lower.indexOf(name);
            if (at !== -1) { map[field] = at; break; }
        }
    }
    return map;
}

/**
 * Reads a cell as a number, treating a blank or an unparseable value as absent rather than as zero.
 *
 * The distinction carries real weight: zero is a perfectly good coordinate, meaning the centre of
 * the field. If a missing value collapsed to zero, a damaged row would draw a dot in the middle of
 * the field instead of being skipped.
 */
function num(cells: string[], at: number | undefined): number | undefined {
    if (at === undefined) return undefined;
    const raw = cells[at];
    if (raw === undefined) return undefined;
    const trimmed = raw.trim();
    if (trimmed === "") return undefined;
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : undefined;
}

/**
 * Parses a run log. It needs t_ms, x, y and theta; every other column is ignored. The header drives
 * the column mapping, so column order does not matter.
 *
 * A row missing any of the four is dropped with a warning rather than failing the whole run.
 */
export function parseRunCsv(content: string, name: string): ParseResult {
    const warnings: string[] = [];
    const lines = content.split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l !== "" && !l.startsWith("#"));

    if (lines.length < 2) {
        return { run: null, warnings: ["Log has no header and data rows."] };
    }

    const map = buildColumnMap(lines[0].split(","));

    for (const required of Object.keys(ALIASES) as (keyof typeof ALIASES)[]) {
        if (map[required] === undefined) {
            // Name the column the log should have carried, not the field it maps to internally,
            // since the reader's next move is to go and add it to the file
            return { run: null, warnings: [`Log is missing a "${ALIASES[required][0]}" column.`] };
        }
    }

    const samples: RunSample[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(",");

        const t = num(cells, map.t);
        const x = num(cells, map.x);
        const y = num(cells, map.y);
        const angle = num(cells, map.angle);

        if (t === undefined || x === undefined || y === undefined || angle === undefined) {
            warnings.push(`Row ${i + 1} is missing a required value and was skipped.`);
            continue;
        }

        // Logs count milliseconds; everything downstream is in seconds like the simulator
        samples.push({ t: t / 1000, x, y, angle });
    }

    if (samples.length === 0) {
        return { run: null, warnings: [...warnings, "No readable rows in log."] };
    }

    return { run: { name, samples }, warnings };
}
