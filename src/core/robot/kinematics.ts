import { normalizeDeg, toDeg, toRad } from "../Util";

/** Everything about the robot that changes as it drives. Wheel speeds are ft/s. */
export type DriveState = {
    x: number, y: number, angle: number, rotation: number,
    velX: number, velY: number,
    vL: number, vR: number,
    vFL: number, vFR: number, vRL: number, vRR: number,
};

/** The fixed geometry the physics models need. */
export type Chassis = {
    maxSpeed: number,
    trackwidth: number,
    height: number,
    lateralTau: number,
    angularTau: number,
};

export function newDriveState(x: number, y: number, angle: number): DriveState {
    return {
        x, y, angle, rotation: angle,
        velX: 0, velY: 0,
        vL: 0, vR: 0,
        vFL: 0, vFR: 0, vRL: 0, vRR: 0,
    };
}

export function stopDriveState(s: DriveState) {
    s.velX = 0; s.velY = 0;
    s.vL = 0; s.vR = 0;
    s.vFL = 0; s.vFR = 0; s.vRL = 0; s.vRR = 0;
}

/** Displacement of one arc step in world coordinates. */
function arcDisplace(prevAngleRad: number, fwdDelta: number, latDelta: number, dThetaRad: number): { dx: number, dy: number } {
    let localX: number;
    let localY: number;

    if (Math.abs(dThetaRad) < 1e-7) {
        localX = latDelta;
        localY = fwdDelta;
    } else {
        const c = 2 * Math.sin(dThetaRad / 2);
        localX = c * (latDelta / dThetaRad);
        localY = c * (fwdDelta / dThetaRad);
    }

    const len = Math.sqrt(localX ** 2 + localY ** 2);
    if (len === 0) return { dx: 0, dy: 0 };
    const dir = Math.atan2(localY, localX) - prevAngleRad - (dThetaRad / 2);
    return { dx: len * Math.cos(dir), dy: len * Math.sin(dir) };
}

/**
 * Advances the true pose by one arc step and refreshes the world velocities. Both drive models end
 * their step here, so this is the only place the pose is written.
 */
export function integratePose(
    s: DriveState,
    forward_delta: number,
    sideways_delta: number,
    orientation_delta_rad: number,
    fwd_speed: number,
    lat_speed: number,
) {
    const prev_orientation_rad = toRad(s.angle);
    const orientation_rad = prev_orientation_rad + orientation_delta_rad;
    s.angle = normalizeDeg(toDeg(orientation_rad));
    s.rotation += toDeg(orientation_delta_rad);

    const { dx, dy } = arcDisplace(prev_orientation_rad, forward_delta, sideways_delta, orientation_delta_rad);
    s.x += dx;
    s.y += dy;

    s.velX = fwd_speed * Math.sin(orientation_rad) + lat_speed * Math.cos(orientation_rad);
    s.velY = fwd_speed * Math.cos(orientation_rad) - lat_speed * Math.sin(orientation_rad);
}
