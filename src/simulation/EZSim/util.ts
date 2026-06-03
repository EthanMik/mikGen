import type { EZconstants } from "./EZConstants";

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
