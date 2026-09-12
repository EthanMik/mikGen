import { createStore } from "./Store";

/**
 * One row of a run log written by the robot. Positions are field-centric inches and angles are
 * degrees with 0 along +Y and clockwise positive, which is mikLib's odometry convention and
 * mikGen's field convention already agreeing, so nothing here converts frames.
 */
export type RunSample = {
    /** Seconds since the logger started, converted from the log's milliseconds. */
    t: number,
    x: number,
    y: number,
    angle: number,
    /** Where the running motion wanted the robot to be, when the algorithm has a positional target. */
    target?: { x: number, y: number, angle: number },
    /**
     * The point a boomerang was steering at when the row was taken. It moves with the robot, so it
     * exists only in the log. nothing downstream can rebuild it from the pose.
     */
    carrot?: { x: number, y: number },
    /**
     * The motion algorithm's own cross-track error, signed, positive to the robot's left. Inches for
     * drives and degrees for turns. Absent when the firmware predates the field, in which case the
     * importer falls back to measuring against path geometry.
     */
    xte?: number,
    /** Index of the motion this row belongs to, counted from the first motion of the run. */
    seg: number,
    /** Which motion algorithm produced the row, for deciding how to read xte. */
    kind?: string,
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

/** Column names accepted for each field, so a log can spell them a few reasonable ways. */
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

/** Reads a cell as a number, treating blanks and non-numbers as absent rather than as zero. */
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
export function samplesBySegment(run: RecordedRun): RunSample[][] {
    const out: RunSample[][] = [];
    for (const s of run.samples) {
        if (s.seg < 0) continue;
        while (out.length <= s.seg) out.push([]);
        out[s.seg].push(s);
    }
    return out;
}
