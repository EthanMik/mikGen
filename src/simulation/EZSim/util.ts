import { to_deg, to_rad } from "../JarSim/util";
import type { EZconstants } from "./EZConstants";

export type pose = {
    x: number;
    y: number;
    theta: number;
};

export function distance_to_point(itarget: pose, icurrent: pose) {
    const x_error = (itarget.x - icurrent.x);
    const y_error = (itarget.y - icurrent.y);
    const distance = Math.hypot(x_error, y_error);
    return distance;
}

export function absolute_angle_to_point(itarget: pose, icurrent: pose) {
    const x_error = itarget.x - icurrent.x;
    const y_error = itarget.y - icurrent.y;
    const error = to_deg(Math.atan2(x_error, y_error));
    return error;
}

export function vector_off_point(added: number, icurrent: pose): pose {
    const x_error = Math.sin(to_rad(icurrent.theta)) * added;
    const y_error = Math.cos(to_rad(icurrent.theta)) * added;

    const output: pose = { x: 0, y: 0, theta: 0 };
    output.x = x_error + icurrent.x;
    output.y = y_error + icurrent.y;
    output.theta = icurrent.theta;
    return output;
}

export function find_point_to_face(current: pose, target: pose, dir: EZconstants["drive_directions"]) {
    if (dir == "rev") {
        const new_target: pose = target;
        new_target.x -= current.x;
        new_target.y -= current.y;

        new_target.x *= -1;
        new_target.y *= -1;

        new_target.x += current.x;
        new_target.y += current.y;

        target = new_target;
    }

    const tx_cx = target.x - current.x;
    let m = 0.0;
    let angle = 0.0;
    if (tx_cx != 0) {
        m = (target.y - current.y) / tx_cx;
        angle = 90.0 - to_deg(Math.atan(m));
    }
    const ptf1: pose = vector_off_point(7.5, { x: target.x, y: target.y, theta: angle });
    const ptf2: pose = vector_off_point(-7.5, { x: target.x, y: target.y, theta: angle });

    const ptf1_dist = distance_to_point(ptf1, current);
    const ptf2_dist = distance_to_point(ptf2, current);

    if (ptf1_dist > ptf2_dist) {
        return ptf1;
    } else {
        return ptf2;
    }
}

export function is_past_target(target: pose, current: pose, point_to_face: pose, drive_direction: EZconstants["drive_directions"]) {
    const fakek_y = (current.y - target.y);
    const fakek_x = (current.x - target.x);

    const ptf: pose = { x: 0, y: 0, theta: 0 };
    ptf.y = point_to_face.y - target.y;
    ptf.x = point_to_face.x - target.x;

    const add = drive_direction == "rev" ? 180 : 0;
    const fake_angle = to_rad((absolute_angle_to_point(ptf, { x: fakek_x, y: fakek_y, theta: 0 })) + add);

    const fake_y = (fakek_y * Math.cos(fake_angle)) + (fakek_x * Math.sin(fake_angle));

    return fake_y;
}

function turn_shortest(target: number, current: number): number {
    let error = target - current;
    if (Math.abs(error) < 180) return target;

    let new_target = target;
    while (error > 180) { new_target -= 360; error = new_target - current; }
    while (error < -180) { new_target += 360; error = new_target - current; }

    if (new_target - current === 0) return current;
    return new_target;
}

function turn_longest(target: number, current: number): number {
    const shortest_target = turn_shortest(target, current);
    const error = shortest_target - current;
    return shortest_target - 360 * Math.sign(error);
}

function turn_is_toleranced(
    current: number,
    input: number,
    longest: number,
    shortest: number,
    turn_tolerance = 0,
    turn_biased_left = false
): number {
    let output = input;
    const long_error = longest - current;
    const short_error = shortest - current;

    if (Math.abs(long_error) - Math.abs(short_error) >= turn_tolerance * 2)
        return output;

    const long_error_sgn = Math.sign(long_error);

    if (turn_biased_left)
        output = long_error_sgn === -1 ? longest : shortest;
    else
        output = long_error_sgn === 1 ? longest : shortest;

    return output;
}

function turn_short(target: number, current: number): number {
    const shortest = turn_shortest(target, current);
    const longest = turn_longest(target, current);
    return turn_is_toleranced(current, shortest, longest, shortest);
}

function turn_long(target: number, current: number): number {
    const longest = turn_longest(target, current);
    const shortest = turn_shortest(target, current);
    return turn_is_toleranced(current, longest, longest, shortest);
}

function turn_left(target: number, current: number): number {
    const shortest = turn_shortest(target, current);
    if (Math.sign(shortest - current) === -1) return shortest;
    return turn_longest(target, current);
}

function turn_right(target: number, current: number): number {
    const shortest = turn_shortest(target, current);
    if (Math.sign(shortest - current) === 1) return shortest;
    return turn_longest(target, current);
}

export function new_turn_target_compute(target: number, current: number, behavior: EZconstants["angle_behavior"]) {
    let new_target = 0.0;
    switch (behavior) {
        case "cw":
            new_target = turn_right(target, current);
            break;
        case "ccw":
            new_target = turn_left(target, current);
            break;
        case "shortest":
            new_target = turn_short(target, current);
            break;
        case "longest":
            new_target = turn_long(target, current);
            break;
        default:
            new_target = target;
            break;
    }
    return new_target;
}
