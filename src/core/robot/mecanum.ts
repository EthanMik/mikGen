import { integratePose, type Chassis, type DriveState } from "./kinematics";

/**
 * One control tick of a mecanum drive. The four wheel commands resolve into forward, sideways and
 * yaw, which is the whole difference from tank: this chassis has a lateral axis of its own.
 */
export function mecanumStep(s: DriveState, c: Chassis, fl: number, fr: number, rl: number, rr: number, dt: number) {
    const tFL = fl * c.maxSpeed;
    const tFR = fr * c.maxSpeed;
    const tRL = rl * c.maxSpeed;
    const tRR = rr * c.maxSpeed;

    const r = (c.height + c.trackwidth) / 2;
    const targetFwd = (tFL + tFR + tRL + tRR) / 4;
    const targetLat = (tFL - tFR - tRL + tRR) / 4;
    const targetOmega = r !== 0 ? (tFL - tFR + tRL - tRR) / (4 * r) : 0;

    const curFwd = (s.vFL + s.vFR + s.vRL + s.vRR) / 4;
    const curLat = (s.vFL - s.vFR - s.vRL + s.vRR) / 4;
    const curOmega = r !== 0 ? (s.vFL - s.vFR + s.vRL - s.vRR) / (4 * r) : 0;

    const kLat = 1 - Math.exp(-dt / c.lateralTau);
    const kAng = 1 - Math.exp(-dt / c.angularTau);

    const newFwd = curFwd + (targetFwd - curFwd) * kLat;
    const newLat = curLat + (targetLat - curLat) * kLat;
    const newOmega = curOmega + (targetOmega - curOmega) * kAng;

    s.vFL = newFwd + newLat + newOmega * r;
    s.vFR = newFwd - newLat - newOmega * r;
    s.vRL = newFwd - newLat + newOmega * r;
    s.vRR = newFwd + newLat - newOmega * r;

    const fwd_in = newFwd * 12;
    const lat_in = newLat * 12;
    const omega_in = newOmega * 12;

    integratePose(s, fwd_in * dt, lat_in * dt, omega_in * dt, fwd_in, lat_in);
}
