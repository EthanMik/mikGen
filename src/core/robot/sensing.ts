import { normalizeDeg, shortAngleDelta } from "../Util";
import type { DriveState } from "./kinematics";

/** What the controller can see: a past pose plus the velocities that went with it. */
export type SensorSample = {
    t: number,
    x: number,
    y: number,
    angle: number,
    rotation: number,
    velX: number,
    velY: number,
    vL: number,
    vR: number,
};

export function sampleOf(s: DriveState, t: number): SensorSample {
    return {
        t,
        x: s.x, y: s.y,
        angle: s.angle, rotation: s.rotation,
        velX: s.velX, velY: s.velY,
        vL: s.vL, vR: s.vR,
    };
}

/** Blend two samples, taking the short way round on the wrapped heading. */
function lerpSample(a: SensorSample, b: SensorSample, f: number): SensorSample {
    const mix = (u: number, v: number) => u + (v - u) * f;
    return {
        t: mix(a.t, b.t),
        x: mix(a.x, b.x),
        y: mix(a.y, b.y),
        angle: normalizeDeg(a.angle + shortAngleDelta(a.angle, b.angle) * f),
        // rotation is cumulative and never wraps, so it blends directly
        rotation: mix(a.rotation, b.rotation),
        velX: mix(a.velX, b.velX),
        velY: mix(a.velY, b.velY),
        vL: mix(a.vL, b.vL),
        vR: mix(a.vR, b.vR),
    };
}

/**
 * The reading at time t, interpolated between the two logged samples bracketing it so a delay is
 * exact rather than quantized to a control tick. Before the log reaches back that far the controller
 * still sees the oldest reading it has.
 */
export function sampleAt(log: SensorSample[], t: number): SensorSample | null {
    if (log.length === 0) return null;
    if (t <= log[0].t) return log[0];

    for (let i = log.length - 1; i >= 0; i--) {
        if (log[i].t > t) continue;
        const next = log[i + 1];
        if (!next) return log[i];
        const span = next.t - log[i].t;
        return span > 0 ? lerpSample(log[i], next, (t - log[i].t) / span) : log[i];
    }
    return log[0];
}

/** Drop readings the delay window has moved past, keeping one either side of it to blend between. */
export function trimLog(log: SensorSample[], cutoff: number) {
    while (log.length > 2 && log[1].t <= cutoff) log.shift();
}
