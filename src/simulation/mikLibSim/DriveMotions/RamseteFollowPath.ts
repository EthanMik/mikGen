import type { Robot } from "../../../core/Robot";
import type { Bezier } from "../../../core/Types/Bezier";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { clamp, toDeg, toRad } from "../../../core/Util";
import { type mikConstants } from "../MikConstants";
import { reduce_negative_180_to_180 } from "../Util";

/** Seconds between trajectory samples, matching the 10 ms control tick on the robot. */
const TICK = 0.01;
/** Inches of arc length between raw samples taken off the curve. */
const SAMPLE_SPACING = 0.25;
/** Inches per metre, since the Ramsete b gain is quoted in 1/m^2 the way the literature states it. */
const INCHES_PER_METRE = 39.3701;

/** One sample of the trajectory. Index i is where the robot should be i * TICK seconds in. */
export type TrajectoryPoint = {
    x: number;
    y: number;
    /** Direction of travel in radians, 0 along +Y and clockwise positive, matching mikLib headings. */
    heading: number;
    /** Arc length covered since the start of the path, in inches. */
    distance: number;
    /** Speed along the path in inches per second, never negative. */
    velocity: number;
    /** Rate the heading turns in radians per second, clockwise positive. */
    angular_velocity: number;
    /** Rate the velocity changes in inches per second squared. */
    acceleration: number;
};

let trajectory: TrajectoryPoint[] = [];
let elapsed = 0;
let start = true;

export function reset_ramsete_follow_path() {
    trajectory = [];
    elapsed = 0;
    start = true;
}

/** Interpolates between two headings the short way round, so the wrap at +/-pi does not spin the reference. */
function lerpAngle(from: number, to: number, alpha: number): number {
    const difference = ((to - from + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    return from + alpha * difference;
}

/** sin(x)/x, which is what the Ramsete sideways term wants. The ratio is 1 at zero, not 0/0. */
function sinc(x: number): number {
    return Math.abs(x) < 1e-4 ? 1 - (x * x) / 6 : Math.sin(x) / x;
}

/**
 * Turns a cubic bezier into a trajectory the robot can drive, mirroring generate_trajectory() in
 * mikLib's util.cpp so the preview and the robot plan the same motion.
 *
 * The curve is walked at roughly even arc length for position, heading and curvature. Each sample
 * takes the slowest of three limits: the flat max_velocity, the speed at which the outer wheel
 * would exceed it on that curvature, and the speed at which the robot would slide sideways given
 * friction_limit. A forward pass then caps how fast speed builds under max_accel and a backward
 * pass caps it again so the robot is always slow enough to reach end_velocity, which is what makes
 * it brake before a corner rather than after it. Finally it is resampled onto a fixed time grid.
 */
export function generateTrajectory(
    curve: Bezier,
    track_width: number,
    max_velocity: number,
    max_accel: number,
    friction_limit: number,
    start_velocity: number,
    end_velocity: number,
): TrajectoryPoint[] {
    if (max_velocity <= 0 || max_accel <= 0 || track_width <= 0) return [];

    // The bezier as a cubic polynomial, so the derivatives that curvature needs fall straight out
    const c3: Coordinate = {
        x: -curve.p0.x + 3 * curve.c1.x - 3 * curve.c2.x + curve.p1.x,
        y: -curve.p0.y + 3 * curve.c1.y - 3 * curve.c2.y + curve.p1.y,
    };
    const c2: Coordinate = {
        x: 3 * curve.p0.x - 6 * curve.c1.x + 3 * curve.c2.x,
        y: 3 * curve.p0.y - 6 * curve.c1.y + 3 * curve.c2.y,
    };
    const c1: Coordinate = { x: -3 * curve.p0.x + 3 * curve.c1.x, y: -3 * curve.p0.y + 3 * curve.c1.y };
    const c0: Coordinate = { x: curve.p0.x, y: curve.p0.y };

    const samples: TrajectoryPoint[] = [];
    const curvature: number[] = [];

    let t = 0;
    let distance = 0;
    let previous = c0;

    for (;;) {
        const position = {
            x: c3.x * t * t * t + c2.x * t * t + c1.x * t + c0.x,
            y: c3.y * t * t * t + c2.y * t * t + c1.y * t + c0.y,
        };
        const first = { x: 3 * c3.x * t * t + 2 * c2.x * t + c1.x, y: 3 * c3.y * t * t + 2 * c2.y * t + c1.y };
        const second = { x: 6 * c3.x * t + 2 * c2.x, y: 6 * c3.y * t + 2 * c2.y };

        // Inches of path per unit of t, not the robot's speed
        const speed = Math.hypot(first.x, first.y);
        if (speed < 1e-6) {
            // Coincident control points flatten the derivative here. Step past it rather than
            // giving up, since the rest of the curve is usually perfectly drivable.
            if (t >= 1) break;
            t = Math.min(1, t + 0.001);
            continue;
        }

        distance += Math.hypot(position.x - previous.x, position.y - previous.y);
        previous = position;

        samples.push({
            x: position.x,
            y: position.y,
            // Compass bearings, 0 along +Y and clockwise positive, so x and y swap in atan2
            heading: Math.atan2(first.x, first.y),
            distance,
            velocity: 0,
            angular_velocity: 0,
            acceleration: 0,
        });
        // Signed curvature in the same clockwise-positive sense as the heading above
        curvature.push((second.x * first.y - first.x * second.y) / (speed * speed * speed));

        if (t >= 1) break;
        // The cap matters where the derivative goes small near a control point, which would
        // otherwise leap across the curve in a single step
        t = Math.min(1, t + Math.min(0.01, SAMPLE_SPACING / speed));
    }

    const count = samples.length;
    if (count < 2) return [];

    // Speed limit at each sample on its own, before acceleration is taken into account
    for (let i = 0; i < count; i++) {
        let limit = max_velocity;
        const k = Math.abs(curvature[i]);
        if (k > 1e-6) {
            // The outer wheel runs faster than the robot's centre by v * k * track_width / 2
            limit = Math.min(limit, max_velocity / (1 + k * track_width * 0.5));
            // Sideways acceleration through a corner is v^2 * k, and the wheels only hold so much
            if (friction_limit > 0) limit = Math.min(limit, Math.sqrt(friction_limit / k));
        }
        samples[i].velocity = limit;
    }

    // Forward pass: you can only speed up so fast, so clamp each sample against the one behind it
    samples[0].velocity = Math.min(samples[0].velocity, Math.max(0, start_velocity));
    for (let i = 1; i < count; i++) {
        const ds = samples[i].distance - samples[i - 1].distance;
        const reachable = Math.sqrt(samples[i - 1].velocity ** 2 + 2 * max_accel * ds);
        samples[i].velocity = Math.min(samples[i].velocity, reachable);
    }

    // Backward pass: you can only slow down so fast. This is what brakes into a corner rather
    // than discovering it at full speed.
    samples[count - 1].velocity = Math.min(samples[count - 1].velocity, Math.max(0, end_velocity));
    for (let i = count - 2; i >= 0; i--) {
        const ds = samples[i + 1].distance - samples[i].distance;
        const stoppable = Math.sqrt(samples[i + 1].velocity ** 2 + 2 * max_accel * ds);
        samples[i].velocity = Math.min(samples[i].velocity, stoppable);
    }

    // With the speeds settled, the rest of the motion follows from them
    for (let i = 0; i < count; i++) {
        samples[i].angular_velocity = samples[i].velocity * curvature[i];
        if (i < count - 1) {
            const ds = samples[i + 1].distance - samples[i].distance;
            samples[i].acceleration = ds > 1e-6
                ? (samples[i + 1].velocity ** 2 - samples[i].velocity ** 2) / (2 * ds)
                : 0;
        }
    }

    // Time stamp each sample. Covering ds at the average of the two end speeds takes ds / v_average.
    const timestamp = new Array<number>(count).fill(0);
    for (let i = 1; i < count; i++) {
        const ds = samples[i].distance - samples[i - 1].distance;
        const average = (samples[i].velocity + samples[i - 1].velocity) * 0.5;
        // A profile that never gets moving is refused rather than returned as a stalled path
        if (average < 1e-4) return [];
        timestamp[i] = timestamp[i - 1] + ds / average;
    }

    // Resample onto a fixed grid so the follower can index straight by elapsed time
    const ticks = Math.floor(timestamp[count - 1] / TICK) + 1;
    const out: TrajectoryPoint[] = [];
    let index = 0;

    for (let tick = 0; tick < ticks; tick++) {
        const time = tick * TICK;
        while (index < count - 2 && timestamp[index + 1] < time) index++;

        const span = timestamp[index + 1] - timestamp[index];
        const alpha = span > 1e-6 ? clamp((time - timestamp[index]) / span, 0, 1) : 0;
        const from = samples[index];
        const to = samples[index + 1];

        out.push({
            x: from.x + alpha * (to.x - from.x),
            y: from.y + alpha * (to.y - from.y),
            heading: lerpAngle(from.heading, to.heading, alpha),
            distance: from.distance + alpha * (to.distance - from.distance),
            velocity: from.velocity + alpha * (to.velocity - from.velocity),
            angular_velocity: from.angular_velocity + alpha * (to.angular_velocity - from.angular_velocity),
            acceleration: from.acceleration + alpha * (to.acceleration - from.acceleration),
        });
    }

    // The grid rarely lands exactly on the end of the path, so finish on the real last point
    out.push(samples[count - 1]);
    return out;
}

/**
 * Drives the trajectory with a Ramsete controller, mirroring ramsete_follow_path() in mikLib's
 * drive-motions.cpp.
 *
 * The reference is picked by the clock rather than by whichever point is nearest, so the robot can
 * be genuinely behind or ahead of schedule and the controller is allowed to see it. Ramsete folds
 * the three pose errors into one pair of wheel speeds, which the kS/kV/kA feedforward turns into
 * volts. Its gain scales with the reference speed, so it has no authority at a standstill and will
 * not tidy up the last fraction of an inch.
 */
export function ramsete_follow_path(robot: Robot, dt: number, bezier: Bezier | undefined, p: mikConstants[]): boolean {
    if (bezier === undefined) return true;

    const k = p[0];
    const track_width = robot.trackwidth;
    const reverse = k.drive_direction === "reversed";

    if (start) {
        trajectory = generateTrajectory(bezier, track_width, k.max_velocity, k.max_accel,
            k.friction_limit, k.start_velocity, k.end_velocity);
        elapsed = 0;
        start = false;
    }

    if (trajectory.length < 2) {
        reset_ramsete_follow_path();
        return true;
    }

    const index = Math.floor(elapsed / TICK);
    elapsed += dt;

    // Running off the end of the trajectory is what ends the motion, so there is no separate timeout
    if (index >= trajectory.length) {
        reset_ramsete_follow_path();
        return true;
    }

    const reference = trajectory[index];

    // Driving a path backwards is the same problem as driving it forwards on a robot whose front
    // is its back, so control everything off that flipped facing
    const facing = robot.getAngle() + (reverse ? 180 : 0);
    const facing_rad = toRad(facing);

    const dx = reference.x - robot.getX();
    const dy = reference.y - robot.getY();

    // Ramsete is written for a maths frame: x out the front, y out the left, angles
    // counter-clockwise. mikLib headings are compass bearings, so forward is (sin, cos),
    // left is (-cos, sin), and every angle changes sign on the way in.
    const error_forward = dx * Math.sin(facing_rad) + dy * Math.cos(facing_rad);
    const error_left = -dx * Math.cos(facing_rad) + dy * Math.sin(facing_rad);
    const error_heading = -toRad(reduce_negative_180_to_180(toDeg(reference.heading) - facing));

    const reference_velocity = reference.velocity;
    const reference_omega = -reference.angular_velocity;

    // b is quoted in 1/m^2 the way the literature states it, but this library works in inches
    const b = k.b / (INCHES_PER_METRE * INCHES_PER_METRE);

    // The single gain tying the three errors together. It grows with how fast the robot is meant
    // to be going, so corrections stay proportionate to the motion.
    const gain = 2 * k.zeta * Math.sqrt(reference_omega * reference_omega + b * reference_velocity * reference_velocity);

    // Speed up or ease off depending on whether the robot is behind or ahead of schedule
    const velocity = reference_velocity * Math.cos(error_heading) + gain * error_forward;
    // Turn to fix the heading, plus a term steering back onto the line the path traces
    const omega = reference_omega + gain * error_heading
        + b * reference_velocity * sinc(error_heading) * error_left;

    // Back to the real robot. Reversing flips which way it travels but not which way it spins.
    const linear = reverse ? -velocity : velocity;
    const linear_accel = reverse ? -reference.acceleration : reference.acceleration;

    // How fast the reference turn rate is itself changing, read off the next sample one tick later
    const next_omega = index + 1 < trajectory.length ? -trajectory[index + 1].angular_velocity : reference_omega;
    const angular_accel = (next_omega - reference_omega) / TICK;

    const half_track = track_width * 0.5;
    // A turn means one wheel runs faster than the robot's centre and the other slower
    const left_velocity = linear - omega * half_track;
    const right_velocity = linear + omega * half_track;
    const left_accel = linear_accel - angular_accel * half_track;
    const right_accel = linear_accel + angular_accel * half_track;

    // Feedforward turns a wheel speed into the voltage that produces it
    let left_output = k.kV * left_velocity + k.kA * left_accel;
    let right_output = k.kV * right_velocity + k.kA * right_accel;
    if (Math.abs(left_velocity) > 1e-3) left_output += k.kS * Math.sign(left_velocity);
    if (Math.abs(right_velocity) > 1e-3) right_output += k.kS * Math.sign(right_velocity);

    // Scale both sides together when either saturates, so clipping cannot quietly straighten out
    // a turn the path asked for
    const peak = Math.max(Math.abs(left_output), Math.abs(right_output));
    if (peak > k.max_voltage) {
        left_output *= k.max_voltage / peak;
        right_output *= k.max_voltage / peak;
    }

    robot.tankDrive(left_output / 12, right_output / 12, dt);

    return false;
}
