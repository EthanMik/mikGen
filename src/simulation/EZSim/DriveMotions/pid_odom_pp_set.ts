import type { Robot } from "../../../core/Robot";
import type { Coordinate } from "../../../core/Types/Coordinate";
import type { EZconstants } from "../EZConstants";
import { inject_points, smooth_path, type waypoint } from "../purepursuit_math";
import { distance_to_point, vector_off_point, type pose } from "../util";
import { odomSetRunning, pid_odom_set, resetOdomSet, retargetOdomSet } from "./pid_odom_set";

let pp_start = true;
let pp_movements: waypoint[] = [];
let pp_index = 0;

export function resetPpSet() {
    pp_start = true;
    pp_movements = [];
    pp_index = 0;
    resetOdomSet();
}

/**
 * The carrot a boomerang chases, from EZ's boomerang_task: a point pulled back off the target
 * along its heading, by an amount that shrinks as the robot closes in. Inside half a lookahead it
 * collapses onto the target itself so the motion actually lands rather than circling.
 */
function compute_carrot(target: waypoint, current: pose, dir: number, drive_p: EZconstants): Coordinate {
    const dist = distance_to_point({ x: target.x, y: target.y, theta: 0 }, current);
    if (dist < drive_p.lookahead / 2) return { x: target.x, y: target.y };

    const h = Math.min(dist * drive_p.lead, drive_p.boomerang_distance) * dir;
    const pulled = vector_off_point(-h, { x: target.x, y: target.y, theta: target.theta! });
    return { x: pulled.x, y: pulled.y };
}

/**
 * Follows a waypoint vector, port of EZ's pp_task.
 *
 * Walks an index along the path, stepping to the next waypoint as soon as the robot is within a
 * lookahead of the current one, and drives each leg with the same point-to-point motion the
 * single-point odom moves use. Only the final waypoint's exit condition ends the motion, so the
 * robot flows through the interior points instead of settling on each.
 *
 * `pp_mode` selects which of EZ's three entry points is being modelled, which is the whole reason
 * the three drive differently: `pid_odom_pp_set` follows the vector as given, the injected variant
 * re-densifies it first, and the smooth variant also relaxes it toward a shorter line.
 */
export function pid_odom_pp_set(robot: Robot, dt: number, points: Coordinate[], angle: number | null, p: EZconstants[]): boolean {
    const drive_p = p[0];
    const odom_pose_get = (): pose => ({ x: robot.getX(), y: robot.getY(), theta: robot.getRotation() });
    const dir = drive_p.drive_directions === "rev" ? -1 : 1;

    if (pp_start) {
        pp_start = false;
        pp_index = 0;

        // A heading lands on the last point only, which is what makes it boomerang onto the
        // ending pose; matches which point codegen gives the `_deg` term to
        const raw: waypoint[] = points.map((pt, i) => ({
            x: pt.x,
            y: pt.y,
            theta: i === points.length - 1 ? angle : null,
        }));

        if (drive_p.pp_mode === "pid_odom_pp_set") {
            pp_movements = raw;
        } else {
            const injected = inject_points(odom_pose_get(), raw, drive_p.path_spacing, drive_p.lookahead, dir);
            pp_movements = drive_p.pp_mode === "pid_odom_smooth_pp_set"
                ? smooth_path(injected, drive_p.weight_smooth, drive_p.weight_data, drive_p.smooth_tolerance, drive_p.lookahead)
                : injected;
        }

        if (pp_movements.length === 0) return true;
    }

    const last_index = pp_movements.length - 1;
    let target = pp_movements[pp_index];

    // Step onto the next waypoint once this one is inside the lookahead circle
    if (pp_index < last_index && distance_to_point({ x: target.x, y: target.y, theta: 0 }, odom_pose_get()) < drive_p.lookahead) {
        pp_index++;
        target = pp_movements[pp_index];
        if (odomSetRunning()) retargetOdomSet(robot, target.x, target.y, p);
    }

    // A waypoint that names a heading is driven at its carrot rather than at itself
    const aim = target.theta !== null ? compute_carrot(target, odom_pose_get(), dir, drive_p) : { x: target.x, y: target.y };
    if (target.theta !== null && odomSetRunning()) retargetOdomSet(robot, aim.x, aim.y, p);

    const reached = pid_odom_set(robot, dt, aim.x, aim.y, p);

    // Interior points do not end the motion: the inner PID settling on one just means it is time
    // to move along, which is the flow-through pure pursuit exists to get
    if (reached && pp_index < last_index) {
        pp_index++;
        return false;
    }

    if (reached) {
        pp_start = true;
        return true;
    }
    return false;
}
