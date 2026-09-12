import { createStore } from "./Store";

/**
 * One row of a run log written by the robot, sampled at 50 Hz by mik::run_log.
 *
 * Positions are field centric inches and angles are degrees with 0 along +Y and clockwise
 * positive. That is mikLib's odometry convention and mikGen's field convention already agreeing
 * exactly, so nothing in this file converts units, flips an axis, or offsets an angle. If a log
 * ever lands rotated or mirrored on the field, suspect the robot's starting pose rather than
 * anything here.
 *
 * Everything past x, y and angle is optional. A log from older firmware simply omits columns, and
 * the parser leaves the matching fields undefined rather than inventing values for them.
 */
export type RunSample = {
    /**
     * Seconds since the logger started. The file counts milliseconds; the division happens once
     * here so that everything downstream shares the simulator's unit.
     */
    t: number,
    x: number,
    y: number,
    angle: number,
    /**
     * The motion's final target. Fixed for the whole motion rather than a moving reference, because
     * mikLib assigns desired_X_position once before the control loop starts. Plotting it therefore
     * gives one point per motion, not a trail. The moving reference is the carrot below.
     */
    target?: { x: number, y: number, angle: number },
    /**
     * The point a boomerang was actually steering at when this row was taken.
     *
     * Only drive_to_pose has one, and it is recomputed every tick from the robot's own remaining
     * distance to the target, so it sweeps inward as the robot closes. That dependence on where the
     * robot happened to be at that instant is exactly why it cannot be reconstructed afterwards
     * from a list of poses, and why the firmware has to write it down as it goes.
     *
     * Every other motion writes nan here, which arrives as undefined.
     */
    carrot?: { x: number, y: number },
    /**
     * The motion algorithm's own cross track error, signed, positive to the robot's left. Inches
     * for drives, degrees for turns.
     *
     * Absent when the firmware predates the field, or when the motion does not compute one, in
     * which case CrossTrackError falls back to measuring the pose against path geometry.
     */
    xte?: number,
    /**
     * Which motion this row belongs to, counted from zero at the first motion of the run. The
     * firmware derives it by watching motion_running go false to true, so autons need no changes.
     *
     * Mind the offset against a mikGen path: path.segments[0] is the start pose, which the robot
     * never drives, so log motion 0 lines up with path segment 1.
     */
    seg: number,
    /** Which motion algorithm produced the row. Parsed if present; mikLib does not write it yet. */
    kind?: string,
    /** False while the robot is between motions, for instance settling after one has exited. */
    moving: boolean,
};

export type RecordedRun = {
    name: string,
    samples: RunSample[],
    /** True when at least one row carried an xte column, so the authoritative number is in use. */
    hasAlgError: boolean,
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
 * its columns in any order, and a newer firmware may add columns an older importer has never heard
 * of without breaking it. The first name in each list is the one mikLib actually writes, and is
 * also the name quoted back at the reader when a required column turns out to be missing.
 */
const ALIASES: Record<string, string[]> = {
    t: ["t_ms", "time_ms", "t", "time"],
    x: ["x", "x_pos", "x_position"],
    y: ["y", "y_pos", "y_position"],
    angle: ["theta", "angle", "heading", "orientation_deg"],
    tx: ["tx", "target_x", "desired_x", "desired_x_position"],
    ty: ["ty", "target_y", "desired_y", "desired_y_position"],
    tangle: ["ttheta", "target_theta", "desired_angle", "desired_heading"],
    cx: ["cx", "carrot_x", "carrot_x_position"],
    cy: ["cy", "carrot_y", "carrot_y_position"],
    xte: ["xte", "cross_track", "cross_track_error", "error_left"],
    seg: ["seg", "segment", "motion", "motion_index"],
    kind: ["kind", "motion_kind", "type"],
    moving: ["moving", "motion_running", "in_motion"],
};

function buildColumnMap(header: string[]): Record<string, number> {
    const map: Record<string, number> = {};
    const lower = header.map(h => h.trim().toLowerCase());
    for (const [field, names] of Object.entries(ALIASES)) {
        for (const name of names) {
            const at = lower.indexOf(name);
            if (at !== -1) { map[field] = at; break; }
        }
    }
    return map;
}

/**
 * Reads a cell as a number, treating a blank or an unparseable value as absent rather than as zero.
 *
 * The distinction carries real weight. Zero is a perfectly good cross track error, meaning the
 * robot was exactly on line, and a perfectly good coordinate, meaning the centre of the field. If
 * missing data collapsed to zero, a log with no carrot would draw a trail to the middle of the
 * field and a log with no error column would look like a flawless run.
 *
 * mikLib writes the literal text nan for a carrot that does not exist, and Number("nan") is NaN,
 * which is not finite, so it lands here as undefined with no special casing needed.
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
 * Parses a run log. The header drives the column mapping, so column order is free and extra columns
 * are ignored, which keeps a log written by a newer firmware readable by an older importer.
 *
 * Rows missing any of t/x/y/theta are dropped with a warning; every other field is optional.
 */
export function parseRunCsv(content: string, name: string): ParseResult {
    const warnings: string[] = [];
    const lines = content.split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l !== "" && !l.startsWith("#"));

    if (lines.length < 2) {
        return { run: null, warnings: ["Log has no header and data rows."] };
    }

    const header = lines[0].split(",");
    const map = buildColumnMap(header);

    for (const required of ["t", "x", "y", "angle"]) {
        if (map[required] === undefined) {
            // Name the column the log should have carried, not the field it maps to internally,
            // since the reader's next move is to go and add it to the file
            return { run: null, warnings: [`Log is missing a "${ALIASES[required][0]}" column.`] };
        }
    }

    const samples: RunSample[] = [];
    let hasAlgError = false;

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

        const tx = num(cells, map.tx);
        const ty = num(cells, map.ty);
        const tangle = num(cells, map.tangle);
        const cx = num(cells, map.cx);
        const cy = num(cells, map.cy);
        const xte = num(cells, map.xte);
        if (xte !== undefined) hasAlgError = true;

        const kindAt = map.kind;
        const kind = kindAt !== undefined ? cells[kindAt]?.trim() || undefined : undefined;

        const movingRaw = map.moving !== undefined ? cells[map.moving]?.trim().toLowerCase() : undefined;

        samples.push({
            // Logs count milliseconds; everything downstream is in seconds like the simulator
            t: t / 1000,
            x, y, angle,
            target: tx !== undefined && ty !== undefined
                ? { x: tx, y: ty, angle: tangle ?? angle }
                : undefined,
            carrot: cx !== undefined && cy !== undefined ? { x: cx, y: cy } : undefined,
            xte,
            seg: num(cells, map.seg) ?? 0,
            kind,
            // A log with no column at all is a log of a motion that was running
            moving: movingRaw === undefined ? true : movingRaw === "1" || movingRaw === "true",
        });
    }

    if (samples.length === 0) {
        return { run: null, warnings: [...warnings, "No readable rows in log."] };
    }

    return { run: { name, samples, hasAlgError }, warnings };
}

/** Splits a run into one array per motion, indexed by the log's own seg counter. */
/**
 * Far more motions than any auton could hold. Purely a guard: the segment index arrives from a
 * file, and the grouping below fills every slot up to it, so a single corrupt row reading
 * 999999999 would otherwise try to allocate a billion arrays and take the tab down with it.
 */
const MAX_SEGMENTS = 512;

/**
 * Splits a run into one array per motion, indexed by the log's own seg counter.
 *
 * Gaps are kept as empty arrays rather than closed up, because the index carries meaning: it is
 * what lines a logged motion up against a segment of the path. Collapsing a gap would silently
 * shift every later motion onto the wrong part of the path.
 *
 * Three kinds of index are refused. A negative one marks a row from before the first motion, when
 * the robot is sitting still with nothing to attribute the row to. A fractional one cannot be an
 * index at all. One past MAX_SEGMENTS is corrupt, and acting on it would hang the tab.
 */
export function samplesBySegment(run: RecordedRun): RunSample[][] {
    const out: RunSample[][] = [];
    for (const s of run.samples) {
        if (s.seg < 0 || s.seg >= MAX_SEGMENTS || !Number.isInteger(s.seg)) continue;
        while (out.length <= s.seg) out.push([]);
        out[s.seg].push(s);
    }
    return out;
}
