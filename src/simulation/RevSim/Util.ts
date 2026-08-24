import type { Coordinate } from "../../core/Types/Coordinate";
import { clamp, toDeg, toRad } from "../../core/Util";
import type { revConstants } from "./RevConstants";

export type PathPose = { x: number, y: number, theta: number };

export function wrap_angle_180(angle: number): number {
    if (!Number.isFinite(angle)) return 0;
    let a = (angle + 180) % 360;
    if (a < 0) a += 360;
    return a - 180;
}

export function wrap_angle_360(angle: number): number {
    if (!Number.isFinite(angle)) return 0;
    let a = angle % 360;
    if (a < 0) a += 360;
    return a;
}

export function wrap_angle_90(angle: number): number {
    if (!Number.isFinite(angle)) return 0;
    let a = (angle + 90) % 180;
    if (a < 0) a += 180;
    return a - 90;
}

export function slew(output: number, prev_output: number, slew_rate: number): number {
    if (slew_rate === 0) return output;
    let change = output - prev_output;
    if (change > slew_rate) change = slew_rate;
    else if (change < -slew_rate) change = -slew_rate;
    return prev_output + change;
}

export function angle_error(error: number, direction: revConstants["turn_direction"]): number {
    if (direction === "cw") return error < 0 ? error + 360 : error;
    if (direction === "ccw") return error > 0 ? error - 360 : error;
    return wrap_angle_180(error);
}

export function line_crossed(
    desired_x: number, desired_y: number, desired_angle: number,
    current_x: number, current_y: number, exit_error: number,
): boolean {
    return (desired_y - current_y) * Math.cos(toRad(desired_angle))
        <= -(desired_x - current_x) * Math.sin(toRad(desired_angle)) + exit_error;
}

export function clamp_min_speed(output: number, min_speed: number): number {
    if (output < 0 && output > -min_speed) return -min_speed;
    if (output > 0 && output < min_speed) return min_speed;
    return output;
}

export function clamp_max_slip(
    output: number, current_x: number, current_y: number, current_angle: number,
    target_x: number, target_y: number, max_slip: number,
): number {
    if (max_slip <= 0) return output;

    const dx = target_x - current_x;
    const dy = target_y - current_y;
    const perp_dist = Math.abs(Math.cos(toRad(current_angle)) * dx - Math.sin(toRad(current_angle)) * dy);
    if (perp_dist === 0) return output;

    const dist = Math.hypot(dx, dy);
    const slip_limit = Math.sqrt((dist * dist) / (2 * perp_dist) * (max_slip * 12)) / 12;

    return clamp(output, -slip_limit, slip_limit);
}

export function clamp_overturn(drive_output: number, heading_output: number, max_speed: number): number {
    const overturn = Math.abs(heading_output) + Math.abs(drive_output) - max_speed;
    if (overturn > 0) {
        if (drive_output > 0) return Math.max(drive_output - overturn, 0);
        if (drive_output < 0) return Math.min(drive_output + overturn, 0);
    }
    return drive_output;
}

export function cumulative_lengths(points: Coordinate[]): number[] {
    const lengths: number[] = [];
    if (points.length === 0) return lengths;

    lengths.push(0);
    for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    }
    return lengths;
}

export function path_progress(points: Coordinate[], lengths: number[], current: Coordinate): number {
    if (points.length === 0) return 0;

    let closest_arc = 0;
    let closest_distance = Math.hypot(points[0].x - current.x, points[0].y - current.y);

    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const chord = lengths[i] - lengths[i - 1];
        if (chord === 0) continue;

        const t = clamp(
            ((current.x - a.x) * (b.x - a.x) + (current.y - a.y) * (b.y - a.y)) / (chord * chord),
            0, 1,
        );
        const distance = Math.hypot(a.x + (b.x - a.x) * t - current.x, a.y + (b.y - a.y) * t - current.y);

        if (distance < closest_distance) {
            closest_distance = distance;
            closest_arc = lengths[i - 1] + chord * t;
        }
    }

    return closest_arc;
}

export function path_pose_at(points: Coordinate[], lengths: number[], distance: number): PathPose {
    if (points.length === 0) return { x: 0, y: 0, theta: 0 };

    const last = points[points.length - 1];
    const pose: PathPose = { x: last.x, y: last.y, theta: 0 };

    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const chord = lengths[i] - lengths[i - 1];
        if (chord === 0) continue;

        pose.theta = toDeg(Math.atan2(b.x - a.x, b.y - a.y));
        if (distance <= lengths[i] || i === points.length - 1) {
            const t = clamp((distance - lengths[i - 1]) / chord, 0, 1);
            pose.x = a.x + (b.x - a.x) * t;
            pose.y = a.y + (b.y - a.y) * t;
            return pose;
        }
    }

    return pose;
}

export function to_tank_voltage(forward: number, turn: number): [number, number] {
    let left = forward + turn;
    let right = forward - turn;

    const ratio = Math.max(Math.abs(left), Math.abs(right));
    if (ratio > 1) {
        left /= ratio;
        right /= ratio;
    }
    return [left, right];
}

export function to_holonomic_voltage(forward: number, strafe: number, turn: number): [number, number, number, number] {
    let lf = forward + strafe + turn;
    let lb = forward - strafe + turn;
    let rf = forward - strafe - turn;
    let rb = forward + strafe - turn;

    const ratio = Math.max(Math.abs(lf), Math.abs(lb), Math.abs(rf), Math.abs(rb));
    if (ratio > 1) {
        lf /= ratio;
        lb /= ratio;
        rf /= ratio;
        rb /= ratio;
    }
    return [lf, lb, rf, rb];
}
