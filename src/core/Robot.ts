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
        const θ = toRad(this.angle);
        return this.x + this.cogOffsetX * Math.cos(θ) + this.cogOffsetY * Math.sin(θ);
    }
    getY() {
        const θ = toRad(this.angle);
        return this.y - this.cogOffsetX * Math.sin(θ) + this.cogOffsetY * Math.cos(θ);
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

        const b_in = this.width;

        if (b_in === 0) return 0;

        const omegaRad = (vR_in - vL_in) / b_in;

        return toDeg(omegaRad);
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        const b_in = this.width;
        const v_max_ft = this.maxSpeed;

        const left = clamp(leftCmd, -1, 1);
        const right = clamp(rightCmd, -1, 1);

        const targetVL_ft = left * v_max_ft;
        const targetVR_ft = right * v_max_ft;

        // Decompose into linear and angular, apply separate first-order lag
        const targetLinear = (targetVL_ft + targetVR_ft) / 2;
        const targetAngular = (targetVR_ft - targetVL_ft) / 2;
        const currentLinear = (this.vL + this.vR) / 2;
        const currentAngular = (this.vR - this.vL) / 2;

        // Use decel tau when velocity magnitude is shrinking — back-EMF assists braking
        const isLatDecel = Math.abs(targetLinear) < Math.abs(currentLinear);
        const isAngDecel = Math.abs(targetAngular) < Math.abs(currentAngular);

        const kLat = 1 - Math.exp(-dt / (isLatDecel ? this.lateralTau : this.lateralTau));
        const kAng = 1 - Math.exp(-dt / (isAngDecel ? this.angularTau : this.angularTau));

        const newLinear = currentLinear + (targetLinear - currentLinear) * kLat;
        const newAngular = currentAngular + (targetAngular - currentAngular) * kAng;

        this.vL = newLinear - newAngular;
        this.vR = newLinear + newAngular;

        // Convert to inches/second
        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        // Tracker deltas this timestep (analogous to forward_delta / sideways_delta)
        const forward_delta = ((vL_in + vR_in) / 2) * dt;
        const sideways_delta = 0;

        // Orientation
        const prev_orientation_rad = toRad(this.angle);
        const orientation_delta_rad = (vL_in - vR_in) / b_in * dt;
        const orientation_rad = prev_orientation_rad + orientation_delta_rad;

        this.angle = toDeg(orientation_rad);
        this.setAngle(this.angle);

        // Local displacement (5225A tracking document style)
        let local_X_position;
        let local_Y_position;

        if (Math.abs(orientation_delta_rad) < 1e-7) {
            local_X_position = sideways_delta;
            local_Y_position = forward_delta;
        } else {
            local_X_position = (2 * Math.sin(orientation_delta_rad / 2)) * (sideways_delta / orientation_delta_rad);
            local_Y_position = (2 * Math.sin(orientation_delta_rad / 2)) * (forward_delta / orientation_delta_rad);
        }

        // Convert to polar, then rotate into global frame
        let local_polar_angle;
        let local_polar_length;

        if (Math.abs(local_X_position) < 1e-7 && Math.abs(local_Y_position) < 1e-7) {
            local_polar_angle = 0;
            local_polar_length = 0;
        } else {
            local_polar_angle = Math.atan2(local_Y_position, local_X_position);
            local_polar_length = Math.sqrt(local_X_position ** 2 + local_Y_position ** 2);
        }

        const global_polar_angle = local_polar_angle - prev_orientation_rad - (orientation_delta_rad / 2);

        const X_position_delta = local_polar_length * Math.cos(global_polar_angle);
        const Y_position_delta = local_polar_length * Math.sin(global_polar_angle);

        this.x += X_position_delta;
        this.y += Y_position_delta;

        // Update velocity for lateral slip
        const v_in = forward_delta / dt;
        const forwardX = Math.sin(orientation_rad);
        const forwardY = Math.cos(orientation_rad);
        const lateralX = Math.cos(orientation_rad);
        const lateralY = -Math.sin(orientation_rad);

        const latComponent = this.velX * lateralX + this.velY * lateralY;
        const newLat = latComponent * Math.max(0, 1 - this.lateralFriction * dt);

        this.velX = v_in * forwardX + newLat * lateralX;
        this.velY = v_in * forwardY + newLat * lateralY;
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

        // Decompose wheel commands into forward, lateral, angular components
        const r = (this.height + this.width) / 2;
        const targetFwd   = (tFL + tFR + tRL + tRR) / 4;
        const targetLat   = (-tFL + tFR + tRL - tRR) / 4;
        const targetOmega = (-tFL + tFR - tRL + tRR) / (4 * r); // rad/s (ft units)

        // Recover current components from wheel velocities
        const curFwd   = (this.vFL + this.vFR + this.vRL + this.vRR) / 4;
        const curLat   = (-this.vFL + this.vFR + this.vRL - this.vRR) / 4;
        const curOmega = (-this.vFL + this.vFR - this.vRL + this.vRR) / (4 * r);

        // First-order lag with separate lateral and angular time constants
        const kLat = 1 - Math.exp(-dt / this.lateralTau);
        const kAng = 1 - Math.exp(-dt / this.angularTau);

        const newFwd   = curFwd   + (targetFwd   - curFwd)   * kLat;
        const newLat   = curLat   + (targetLat   - curLat)   * kLat;
        const newOmega = curOmega + (targetOmega - curOmega) * kAng;

        // Reconstruct wheel velocities (ft/s) from filtered components
        this.vFL = newFwd - newLat - newOmega * r;
        this.vFR = newFwd + newLat + newOmega * r;
        this.vRL = newFwd + newLat - newOmega * r;
        this.vRR = newFwd - newLat + newOmega * r;

        // Convert to in/s
        const fwd_in   = newFwd   * 12;
        const lat_in   = newLat   * 12;
        const omega_in = newOmega * 12; // rad/s (inches denominator irrelevant for angle)

        // Arc odometry (5225A tracking document style)
        const forward_delta  = fwd_in * dt;
        const sideways_delta = lat_in * dt;
        const prev_orientation_rad = toRad(this.angle);
        const orientation_delta_rad = omega_in * dt;
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

        const local_polar_angle  = Math.atan2(local_Y_position, local_X_position);
        const local_polar_length = Math.sqrt(local_X_position ** 2 + local_Y_position ** 2);

        const global_polar_angle = local_polar_angle - prev_orientation_rad - (orientation_delta_rad / 2);

        this.x += local_polar_length * Math.cos(global_polar_angle);
        this.y += local_polar_length * Math.sin(global_polar_angle);

        // Update world-frame velocity
        const theta = orientation_rad;
        const forwardX = Math.sin(theta);
        const forwardY = Math.cos(theta);
        const rightX   =  Math.cos(theta);
        const rightY   = -Math.sin(theta);

        this.velX = fwd_in * forwardX + lat_in * rightX;
        this.velY = fwd_in * forwardY + lat_in * rightY;
    }


    private moveTowards(current: number, target: number, dt: number): number {
        const diff = target - current;

        const isAccel = Math.abs(target) > Math.abs(current);
        const maxDelta = (isAccel ? 15 : 15) * dt;

        if (Math.abs(diff) <= maxDelta) return target;
        return current + Math.sign(diff) * maxDelta;
    }

    // mecanumDrive(flCmd: number, frCmd: number, rlCmd: number, rrCmd: number, dt: number) {
    //     const fl = clamp(flCmd, -1, 1);
    //     const fr = clamp(frCmd, -1, 1);
    //     const rl = clamp(rlCmd, -1, 1);
    //     const rr = clamp(rrCmd, -1, 1);

    //     const tFL = fl * this.maxSpeed;
    //     const tFR = fr * this.maxSpeed;
    //     const tRL = rl * this.maxSpeed;
    //     const tRR = rr * this.maxSpeed;

    //     this.vFL = this.moveTowards(this.vFL, tFL, dt);
    //     this.vFR = this.moveTowards(this.vFR, tFR, dt);
    //     this.vRL = this.moveTowards(this.vRL, tRL, dt);
    //     this.vRR = this.moveTowards(this.vRR, tRR, dt);

    //     const FL = this.vFL * 12;
    //     const FR = this.vFR * 12;
    //     const RL = this.vRL * 12;
    //     const RR = this.vRR * 12;


    //     const vFwd   = (FL + FR + RL + RR) / 4;
    //     const vRight = (-FL + FR + RL - RR) / 4;

    //     const rx = this.width / 2;
    //     const ry = this.height / 2;
    //     const r = rx + ry;

    //     const omega = (-FL + FR - RL + RR) / (4 * r);

    //     const θ = toRad(this.getAngle());

    //     const forwardX = Math.sin(θ);
    //     const forwardY = Math.cos(θ);
    //     const rightX   = Math.cos(θ);
    //     const rightY   = -Math.sin(θ);

    //     const vx = vFwd * forwardX + vRight * rightX; // in/s
    //     const vy = vFwd * forwardY + vRight * rightY; // in/s

    //     const θNew = θ + omega * dt;
    //     this.x += vx * dt;
    //     this.y += vy * dt;
    //     this.angle = (normalizeDeg(toDeg(θNew)));
    // }



    public stop() {
        this.vL = 0;
        this.vR = 0;
        this.velX = 0;
        this.velY = 0;

        this.vFL = 0;
        this.vFR = 0;
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
