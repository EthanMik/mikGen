import { toRad } from "../Util";
import { integratePose, type Chassis, type DriveState } from "./kinematics";

/**
 * One control tick of a differential drive. Both sides drive along the robot's heading, so the only
 * sideways motion is whatever the previous velocity is still carrying through the turn.
 */
export function tankStep(s: DriveState, c: Chassis, left: number, right: number, dt: number) {
    const targetVL_ft = left * c.maxSpeed;
    const targetVR_ft = right * c.maxSpeed;

    const targetLinear = (targetVL_ft + targetVR_ft) / 2;
    const targetAngular = (targetVR_ft - targetVL_ft) / 2;
    const currentLinear = (s.vL + s.vR) / 2;
    const currentAngular = (s.vR - s.vL) / 2;

    // The first-order lag is the back-EMF side of a DC motor
    const kLat = 1 - Math.exp(-dt / c.lateralTau);
    const kAng = 1 - Math.exp(-dt / c.angularTau);

    const newLinear = currentLinear + (targetLinear - currentLinear) * kLat;
    const newAngular = currentAngular + (targetAngular - currentAngular) * kAng;

    s.vL = newLinear - newAngular;
    s.vR = newLinear + newAngular;

    const vL_in = s.vL * 12;
    const vR_in = s.vR * 12;

    const fwd_speed = (vL_in + vR_in) / 2;
    const orientation_delta_rad = c.trackwidth !== 0
        ? (vL_in - vR_in) / c.trackwidth * dt
        : 0;

    const new_orientation_rad = toRad(s.angle) + orientation_delta_rad;
    const rightX = Math.cos(new_orientation_rad);
    const rightY = -Math.sin(new_orientation_rad);
    const lat_speed = s.velX * rightX + s.velY * rightY;

    integratePose(s, fwd_speed * dt, 0, orientation_delta_rad, fwd_speed, lat_speed);
}
