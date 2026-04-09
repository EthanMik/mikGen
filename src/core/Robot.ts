import { createObjectStore } from "./Store";
import type { Pose } from "./Types/Pose";
import { clamp, normalizeDeg, toDeg, toRad } from "./Util";

export type RobotConstants = {
    width: number,
    height: number,
    speed: number,
    lateralTau: number,  // first-order lag time constant for lateral (linear) motion (seconds)
    angularTau: number,  // first-order lag time constant for angular (turning) motion (seconds)
    cogOffsetX: number, // lateral offset (positive = robot's right)
    cogOffsetY: number, // longitudinal offset (positive = robot's forward)
    expansionFront: number,
    expansionLeft: number,
    expansionRight: number,
    expansionRear: number,
    isOmni: boolean,
}

export const defaultRobotConstants: RobotConstants = {
    width: 14,
    height: 14,
    speed: 6,
    lateralTau: 0.2,
    angularTau: 0.1,
    cogOffsetX: 0,
    cogOffsetY: 0,
    expansionFront: 0,
    expansionLeft: 0,
    expansionRight: 0,
    expansionRear: 0,
    isOmni: false,
}

export const robotConstantsStore = createObjectStore<RobotConstants>(defaultRobotConstants);

export class Robot {
    // Tank drive robot
    private vL: number = 0;
    private vR: number = 0;
    private velX: number = 0;
    private velY: number = 0;

    private vFL: number = 0;
    private vFR: number = 0;
    private vCL: number = 0;
    private vCR: number = 0;
    private vRL: number = 0;
    private vRR: number = 0;

    private lateralFriction: number = 0;

    constructor(
        private x: number,
        private y: number,
        private angle: number,
        public width: number,
        public height: number,
        public maxSpeed: number,

        public cogOffsetX: number = 0, // lateral (positive = robot's right)
        public cogOffsetY: number = 0, // longitudinal (positive = robot's forward)
        public expansionFront: number = 0,
        public expansionLeft: number = 0,
        public expansionRight: number = 0,
        public expansionRear: number = 0,

        public isOmnis: boolean = false,
        public lateralTau: number,
        public angularTau: number,
    ) {
        if (isOmnis) {
            this.lateralFriction = 10;
        } else {
            this.lateralFriction = 50;
        }
    }

    private setAngle(angle: number) {
        this.angle = normalizeDeg(angle);
    }

    // Returns the world-frame position of the CoG offset point
    getX() {
        const theta = toRad(this.angle);
        return this.x + this.cogOffsetX * Math.cos(theta) + this.cogOffsetY * Math.sin(theta);
    }
    getY() {
        const theta = toRad(this.angle);
        return this.y - this.cogOffsetX * Math.sin(theta) + this.cogOffsetY * Math.cos(theta);
    }
    getAngle() { return this.angle; }

    getPose(): Pose { return { x: this.x, y: this.y, angle: this.angle } } 

    // Returns Velocity in in/s (includes lateral drift)
    public getXVelocity(): number {
        return this.velX;
    }

    // Returns Velocity in in/s (includes lateral drift)
    public getYVelocity(): number {
        return this.velY;
    }

    // Returns angular velocity in degrees per second
    public getAngularVelocity(): number {
        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        const b_in = this.width - 2;

        if (b_in === 0) return 0;

        const omegaRad = (vR_in - vL_in) / b_in;

        return toDeg(omegaRad);
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        const b_in = this.width - 2;

        const left = clamp(leftCmd, -1, 1);
        const right = clamp(rightCmd, -1, 1);

        const targetVL_ft = left * this.maxSpeed;
        const targetVR_ft = right * this.maxSpeed;

        // Decompose into linear and angular, apply separate first-order lag
        const targetLinear = (targetVL_ft + targetVR_ft) / 2;
        const targetAngular = (targetVR_ft - targetVL_ft) / 2;
        const currentLinear = (this.vL + this.vR) / 2;
        const currentAngular = (this.vR - this.vL) / 2;

        const kLat = 1 - Math.exp(-dt / (this.lateralTau));
        const kAng = 1 - Math.exp(-dt / (this.angularTau));

        const newLinear = currentLinear + (targetLinear - currentLinear) * kLat;
        const newAngular = currentAngular + (targetAngular - currentAngular) * kAng;

        this.vL = newLinear - newAngular;
        this.vR = newLinear + newAngular;

        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        const fwd_speed = (vL_in + vR_in) / 2;
        const orientation_delta_rad = (vL_in - vR_in) / b_in * dt;

        // Compute lateral slip speed using the new orientation
        const new_orientation_rad = toRad(this.angle) + orientation_delta_rad;
        const rightX =  Math.cos(new_orientation_rad);
        const rightY = -Math.sin(new_orientation_rad);
        const lat_speed = (this.velX * rightX + this.velY * rightY) * Math.max(0, 1 - this.lateralFriction * dt);

        this.odometryUpdate(fwd_speed * dt, 0, orientation_delta_rad, fwd_speed, lat_speed);
    }

    mecanumDrive(flCmd: number, frCmd: number, rlCmd: number, rrCmd: number, dt: number) {
        const fl = clamp(flCmd, -1, 1);
        const fr = clamp(frCmd, -1, 1);
        const rl = clamp(rlCmd, -1, 1);
        const rr = clamp(rrCmd, -1, 1);

        const tFL = fl * this.maxSpeed;
        const tFR = fr * this.maxSpeed;
        const tRL = rl * this.maxSpeed;
        const tRR = rr * this.maxSpeed;

        const r = (this.height + (this.width - 2)) / 2;
        const targetFwd   = (tFL + tFR + tRL + tRR) / 4;
        const targetLat   = (tFL - tFR - tRL + tRR) / 4;
        const targetOmega = (tFL - tFR + tRL - tRR) / (4 * r);

        const curFwd   = (this.vFL + this.vFR + this.vRL + this.vRR) / 4;
        const curLat   = (this.vFL - this.vFR - this.vRL + this.vRR) / 4;
        const curOmega = (this.vFL - this.vFR + this.vRL - this.vRR) / (4 * r);

        const kLat = 1 - Math.exp(-dt / this.lateralTau);
        const kAng = 1 - Math.exp(-dt / this.angularTau);

        const newFwd   = curFwd   + (targetFwd   - curFwd)   * kLat;
        const newLat   = curLat   + (targetLat   - curLat)   * kLat;
        const newOmega = curOmega + (targetOmega - curOmega) * kAng;

        this.vFL = newFwd + newLat + newOmega * r;
        this.vFR = newFwd - newLat - newOmega * r;
        this.vRL = newFwd - newLat + newOmega * r;
        this.vRR = newFwd + newLat - newOmega * r;

        const fwd_in = newFwd * 12;
        const lat_in = newLat * 12;
        const omega_in = newOmega * 12;

        this.odometryUpdate(fwd_in * dt, lat_in * dt, omega_in * dt, fwd_in, lat_in);
    }

    // 4 mecanum corner wheels + 2 center omni wheels (asterisk layout)
    asteriskDrive(flCmd: number, frCmd: number, clCmd: number, crCmd: number, rlCmd: number, rrCmd: number, dt: number) {
        const fl = clamp(flCmd, -1, 1);
        const fr = clamp(frCmd, -1, 1);
        const cl = clamp(clCmd, -1, 1);
        const cr = clamp(crCmd, -1, 1);
        const rl = clamp(rlCmd, -1, 1);
        const rr = clamp(rrCmd, -1, 1);

        const r_m = (this.height + (this.width - 2)) / 2;  // mecanum corner turning radius (in)
        const b   = this.width - 2;                         // center omni track width (in)

        const tFL = fl * this.maxSpeed;
        const tFR = fr * this.maxSpeed;
        const tCL = cl * this.maxSpeed;
        const tCR = cr * this.maxSpeed;
        const tRL = rl * this.maxSpeed;
        const tRR = rr * this.maxSpeed;

        // Forward: average all 6 wheels (lat and omega terms cancel)
        const targetFwd   = (tFL + tFR + tCL + tCR + tRL + tRR) / 6;
        // Lateral: only mecanum corners can strafe
        const targetLat   = (tFL - tFR - tRL + tRR) / 4;
        // Omega: weighted average of corner mecanum estimate (×4) and center omni estimate (×2)
        const targetOmega = ((tFL - tFR + tRL - tRR) / r_m + 2 * (tCL - tCR) / b) / 6;

        const curFwd      = (this.vFL + this.vFR + this.vCL + this.vCR + this.vRL + this.vRR) / 6;
        const curLat      = (this.vFL - this.vFR - this.vRL + this.vRR) / 4;
        const curOmega    = ((this.vFL - this.vFR + this.vRL - this.vRR) / r_m + 2 * (this.vCL - this.vCR) / b) / 6;

        const kLat = 1 - Math.exp(-dt / this.lateralTau);
        const kAng = 1 - Math.exp(-dt / this.angularTau);

        const newFwd   = curFwd   + (targetFwd   - curFwd)   * kLat;
        const newLat   = curLat   + (targetLat   - curLat)   * kLat;
        const newOmega = curOmega + (targetOmega - curOmega) * kAng;

        this.vFL = newFwd + newLat + newOmega * r_m;
        this.vFR = newFwd - newLat - newOmega * r_m;
        this.vCL = newFwd + newOmega * (b / 2);
        this.vCR = newFwd - newOmega * (b / 2);
        this.vRL = newFwd - newLat + newOmega * r_m;
        this.vRR = newFwd + newLat - newOmega * r_m;

        const fwd_in   = newFwd   * 12;
        const lat_in   = newLat   * 12;
        const omega_in = newOmega * 12;

        this.odometryUpdate(fwd_in * dt, lat_in * dt, omega_in * dt, fwd_in, lat_in);
    }

    // Arc odometry (5225A tracking document style) + world-frame velocity update
    private odometryUpdate(forward_delta: number, sideways_delta: number, orientation_delta_rad: number, fwd_speed: number, lat_speed: number) {
        const prev_orientation_rad = toRad(this.angle);
        const orientation_rad = prev_orientation_rad + orientation_delta_rad;
        this.setAngle(toDeg(orientation_rad));

        let local_X_position: number;
        let local_Y_position: number;

        if (Math.abs(orientation_delta_rad) < 1e-7) {
            local_X_position = sideways_delta;
            local_Y_position = forward_delta;
        } else {
            const c = 2 * Math.sin(orientation_delta_rad / 2);
            local_X_position = c * (sideways_delta / orientation_delta_rad);
            local_Y_position = c * (forward_delta  / orientation_delta_rad);
        }

        const local_polar_length = Math.sqrt(local_X_position ** 2 + local_Y_position ** 2);
        if (local_polar_length > 0) {
            const global_polar_angle = Math.atan2(local_Y_position, local_X_position) - prev_orientation_rad - (orientation_delta_rad / 2);
            this.x += local_polar_length * Math.cos(global_polar_angle);
            this.y += local_polar_length * Math.sin(global_polar_angle);
        }

        this.velX = fwd_speed * Math.sin(orientation_rad) + lat_speed * Math.cos(orientation_rad);
        this.velY = fwd_speed * Math.cos(orientation_rad) - lat_speed * Math.sin(orientation_rad);
    }

    public stop() {
        this.vL = 0;
        this.vR = 0;
        this.velX = 0;
        this.velY = 0;

        this.vFL = 0;
        this.vFR = 0;
        this.vCL = 0;
        this.vCR = 0;
        this.vRL = 0;
        this.vRR = 0;
    }

    // x, y are the CoG offset point position; converts to kinematic center internally
    public setPose(x: number, y: number, angle: number) {
        this.angle = angle;
        const θ = toRad(angle);
        this.x = x - (this.cogOffsetX * Math.cos(θ) + this.cogOffsetY * Math.sin(θ));
        this.y = y - (-this.cogOffsetX * Math.sin(θ) + this.cogOffsetY * Math.cos(θ));
        this.velX = 0;
        this.velY = 0;

        return true;
    }
}
