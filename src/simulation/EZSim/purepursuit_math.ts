import { absolute_angle_to_point, distance_to_point, vector_off_point, type pose } from "./util";

/**
 * One waypoint in a pure pursuit path. `theta` null is EZ's ANGLE_NOT_SET: the point is driven
 * through point-to-point, and only a point that names a heading gets boomeranged onto.
 */
export type waypoint = {
    x: number;
    y: number;
    theta: number | null;
};

/**
 * Densifies a waypoint list, as EZ's `pid_odom_injected_pp_set` does before following it.
 *
 * Port of Drive::inject_points. Two things happen: a point that names a heading gets a parent
 * point dropped one lookahead short of it so the boomerang has room to swing in, and every gap
 * between remaining points is filled in at `spacing` intervals.
 *
 * The robot's own position leads the list, matching EZ, which inserts it rather than taking it
 * from the caller. Codegen leaves it out of the emitted vector for the same reason.
 */
export function inject_points(current: pose, movements: waypoint[], spacing: number, lookahead: number, dir: number): waypoint[] {
    if (movements.length === 0) return [];

    const input: waypoint[] = [{ x: current.x, y: current.y, theta: null }, ...movements];

    // Inject the parent point every boomerang swings through on its way to the real target
    for (let i = 0; i < input.length - 1; i++) {
        if (input[i].theta === null) continue;
        const offset = vector_off_point(lookahead * dir, { x: input[i].x, y: input[i].y, theta: input[i].theta! });
        input.splice(i + 1, 0, { x: offset.x, y: offset.y, theta: null });
        i++;
    }

    const output: waypoint[] = [];
    // Nothing is injected within a lookahead of the start: points that close together fight the
    // follower rather than guiding it (EZ-Robotics/EZ-Template#152)
    let allow_injecting = false;

    for (let i = 0; i < input.length - 1; i++) {
        const from = input[i];
        const to = input[i + 1];
        output.push({ ...from });

        // A leg that ends on a heading is left alone: it is the boomerang's own approach
        if (to.theta !== null) continue;

        const fits = Math.floor(distance_to_point({ x: to.x, y: to.y, theta: 0 }, { x: from.x, y: from.y, theta: 0 }) / spacing);
        const heading = absolute_angle_to_point({ x: to.x, y: to.y, theta: 0 }, { x: from.x, y: from.y, theta: 0 });

        for (let j = 0; j < fits; j++) {
            const injected = vector_off_point(spacing * (j + 1), { x: from.x, y: from.y, theta: heading });

            if (distance_to_point(injected, { x: input[0].x, y: input[0].y, theta: 0 }) >= lookahead) allow_injecting = true;
            if (!allow_injecting) continue;

            // Anything closer than one spacing to the point it leads into is the same point twice
            if (distance_to_point(injected, { x: to.x, y: to.y, theta: 0 }) < spacing) continue;

            output.push({ x: injected.x, y: injected.y, theta: null });
        }
    }

    output.push({ ...input[input.length - 1] });
    return output;
}

/**
 * Gradient descent smoothing, port of Drive::smooth_path.
 *
 * Pulls each point toward the average of its neighbours (`weight_smooth`) while holding it near
 * where it started (`weight_data`), until an iteration moves everything less than `tolerance`.
 * The result cuts corners, so it drives smoother than the drawn curve but no longer traces it.
 *
 * Pinned points: both ends, index 1, and anything within a lookahead of the start, matching EZ.
 * EZ additionally pins a run of points after each heading; here only the final point can carry
 * one and it is already pinned as an endpoint.
 */
export function smooth_path(
    path: waypoint[],
    weight_smooth: number,
    weight_data: number,
    tolerance: number,
    lookahead: number,
): waypoint[] {
    if (path.length < 4) return path.map(p => ({ ...p }));

    const smoothed = path.map(p => [p.x, p.y]);

    let allow_smoothing = false;
    const pinned = path.map((p, i) => {
        if (distance_to_point({ x: p.x, y: p.y, theta: 0 }, { x: path[0].x, y: path[0].y, theta: 0 }) > lookahead) allow_smoothing = true;
        return p.theta !== null || !allow_smoothing || i === 1;
    });

    let change = tolerance;
    // Bounded: the update is a contraction, but a pathological tolerance should not spin forever
    for (let pass = 0; change >= tolerance && pass < 10000; pass++) {
        change = 0;
        for (let i = 1; i < path.length - 2; i++) {
            if (pinned[i]) continue;
            for (let axis = 0; axis < 2; axis++) {
                const original = axis === 0 ? path[i].x : path[i].y;
                const before = smoothed[i][axis];
                smoothed[i][axis] += weight_data * (original - before)
                    + weight_smooth * (smoothed[i + 1][axis] + smoothed[i - 1][axis] - 2 * before);
                change += Math.abs(smoothed[i][axis] - before);
            }
        }
    }

    // Headings ride along untouched; only the coordinates move
    return path.map((p, i) => ({ x: smoothed[i][0], y: smoothed[i][1], theta: p.theta }));
}
