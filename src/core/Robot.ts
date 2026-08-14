import type { Pose } from "./Types/Pose";
import { clamp, normalizeDeg, toDeg, toRad } from "./Util";

export type RobotConstants = {
    holonomicRobot: boolean,
    width: number,
    height: number,
    speed: number,
    trackwidth: number,
    lateralTau: number,  // first-order lag time constant for lateral (linear) motion (seconds)
    angularTau: number,  // first-order lag time constant for angular (turning) motion (seconds)
    cogOffsetX: number, // lateral offset (positive = robot's right)
    cogOffsetY: number, // longitudinal offset (positive = robot's forward)
    cogOffsetXDisabled: boolean,
    cogOffsetYDisabled: boolean,
    expansionFront: number,
    expansionLeft: number,
    expansionRight: number,
    expansionRear: number,
    expansionFrontDisabled: boolean,
    expansionLeftDisabled: boolean,
    expansionRightDisabled: boolean,
    expansionRearDisabled: boolean,
    sensorFrontX: number,
    sensorFrontY: number,
    sensorFrontDisabled: boolean,
    sensorLeftX: number,
    sensorLeftY: number,
    sensorLeftDisabled: boolean,
    sensorRightX: number,
    sensorRightY: number,
    sensorRightDisabled: boolean,
    sensorRearX: number,
    sensorRearY: number,
    sensorRearDisabled: boolean,

    // Extras: each pairs a value with a Disabled flag, following the sensor/expansion pattern
    latencyMs: number,
    latencyDisabled: boolean,
    odomDrift: number,
    odomDriftDisabled: boolean,
}

export const defaultRobotConstants: RobotConstants = {
    holonomicRobot: false,
    width: 14,
    height: 14,
    speed: 6,
    trackwidth: 12,
    lateralTau: 0.2,
    angularTau: 0.1,
    cogOffsetX: 0,
    cogOffsetY: 0,
    cogOffsetXDisabled: true,
    cogOffsetYDisabled: true,
    expansionFront: 0,
    expansionLeft: 0,
    expansionRight: 0,
    expansionRear: 0,
    expansionFrontDisabled: true,
    expansionLeftDisabled: true,
    expansionRightDisabled: true,
    expansionRearDisabled: true,
    sensorFrontX: 0,
    sensorFrontY: 0,
    sensorFrontDisabled: true,
    sensorLeftX: 0,
    sensorLeftY: 0,
    sensorLeftDisabled: true,
    sensorRightX: 0,
    sensorRightY: 0,
    sensorRightDisabled: true,
    sensorRearX: 0,
    sensorRearY: 0,
    sensorRearDisabled: true,

    latencyMs: 25,
    latencyDisabled: true,
    odomDrift: 0.5,
    odomDriftDisabled: true,
}

/**
 * Fidelity extras. null disables an effect entirely; with every field null the robot runs the
 * original single-step physics and the controllers read ground truth, byte for byte.
 */
export type RobotExtras = {
    /** Sensor pipeline delay in ms between the true state and what the controller reads. */
    latencyMs: number | null;
    /**
     * Wheel odometry with this % scale error replaces ground truth as the controller's pose.
     * Also turns on IMU drift, encoder quantization and heading noise.
     */
    odomDriftPercent: number | null;
};

export const DISABLED_EXTRAS: RobotExtras = Object.freeze({
    latencyMs: null,
    odomDriftPercent: null,
});

export function extrasFromConstants(c: RobotConstants): RobotExtras {
    return {
        latencyMs: c.latencyDisabled ? null : c.latencyMs,
        odomDriftPercent: c.odomDriftDisabled ? null : c.odomDrift,
    };
}

/** Controller tick period in ms; the sim loop always paces itself on this. */
const CONTROL_LOOP_MS = 10;
/** Physics substep when any extra is active; odometry and the latency pipeline sample on this finer grid. */
const PHYSICS_DT = 1 / 400;
/** IMU heading drift applied whenever odometry replaces ground truth, deg/min. */
const IMU_DRIFT_DEG_PER_MIN = 0.5;
/** One count of a 0.088 deg/count rotation sensor on a 2.75in tracking wheel, in inches. */
const ENCODER_QUANT_IN = 0.0021;
/** Per-sample white noise on the IMU heading, degrees stdev. */
const IMU_NOISE_DEG = 0.02;

/** What the controller can see: the estimated pose and the encoder-side velocities behind it. */
type SensorSample = {
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

function finiteCmd(cmd: number): number {
    return Number.isFinite(cmd) ? cmd : 0;
}

export class Robot {
    // Tank drive robot. vL/vR (and the mecanum vFL..vRR) are the wheel speeds in ft/s.
    private vL: number = 0;
    private vR: number = 0;
    private velX: number = 0;
    private velY: number = 0;

    private vFL: number = 0;
    private vFR: number = 0;
    private vRL: number = 0;
    private vRR: number = 0;

    private timeout: number = 0;
    private rotation: number = 0;

    public holonomicRobot: boolean = false;

    // Wheel odometry estimate, in the same kinematic-center frame as x/y/angle
    private odomX: number = 0;
    private odomY: number = 0;
    private odomAngle: number = 0;
    private odomRotation: number = 0;
    private encL: number = 0;
    private encLOut: number = 0;
    private encR: number = 0;
    private encROut: number = 0;
    private encLat: number = 0;
    private encLatOut: number = 0;
    private imuDriftSign: number = 1;

    private simTime: number = 0;
    private sensed: SensorSample;
    private sensorLog: SensorSample[] = [];

    // Seeded so a recompute of the same path replays the same noise instead of jiggling the trajectory
    private rngState: number = 0x9e3779b9;

    constructor(
        private x: number,
        private y: number,
        private angle: number,
        public width: number,
        public trackwidth: number,
        public height: number,
        public maxSpeed: number,

        public cogOffsetX: number = 0, // lateral (positive = robot's right)
        public cogOffsetY: number = 0, // longitudinal (positive = robot's forward)
        public expansionFront: number = 0,
        public expansionLeft: number = 0,
        public expansionRight: number = 0,
        public expansionRear: number = 0,

        public sensorFrontX: number = 0,
        public sensorFrontY: number = 0,
        public sensorFrontDisabled: boolean = true,
        public sensorLeftX: number = 0,
        public sensorLeftY: number = 0,
        public sensorLeftDisabled: boolean = true,
        public sensorRightX: number = 0,
        public sensorRightY: number = 0,
        public sensorRightDisabled: boolean = true,
        public sensorRearX: number = 0,
        public sensorRearY: number = 0,
        public sensorRearDisabled: boolean = true,

        public lateralTau: number,
        public angularTau: number,
        private extras: RobotExtras = DISABLED_EXTRAS,
    ) {
        this.rotation = angle;
        this.odomX = x;
        this.odomY = y;
        this.odomAngle = angle;
        this.odomRotation = angle;
        this.imuDriftSign = this.rand() < 0.5 ? -1 : 1;
        this.sensed = this.truthSample();
        this.sensorLog = [this.sensed];
    }

    // mulberry32
    private rand(): number {
        this.rngState = (this.rngState + 0x6D2B79F5) | 0;
        let t = this.rngState;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    private gauss(): number {
        const u = Math.max(this.rand(), 1e-12);
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.rand());
    }

    /**
     * Any effect that needs the substepped pipeline instead of the legacy single-step physics.
     * The same set is what makes the sensed pose differ from the true pose.
     */
    private extrasActive(): boolean {
        const e = this.extras;
        return e.latencyMs !== null || e.odomDriftPercent !== null;
    }

    /** Seconds one controller tick takes. The sim loop paces itself on this. */
    public getControlDt(): number {
        return CONTROL_LOOP_MS / 1000;
    }

    /** Elapsed sim time in seconds. */
    public getTime(): number {
        return this.simTime;
    }

    private setAngle(angle: number) {
        this.angle = normalizeDeg(angle);
    }

    private truthSample(): SensorSample {
        return {
            t: this.simTime,
            x: this.x, y: this.y,
            angle: this.angle, rotation: this.rotation,
            velX: this.velX, velY: this.velY,
            vL: this.vL, vR: this.vR,
        };
    }

    /**
     * The sample the controller reads this instant: ground truth when no sensing extra is on,
     * else the newest odometry/IMU sample old enough to have cleared the latency pipeline.
     */
    private currentSense(): SensorSample {
        if (!this.extrasActive()) return this.truthSample();
        if (this.extras.latencyMs === null) return this.sensed;
        const cutoff = this.simTime - this.extras.latencyMs / 1000;
        for (let i = this.sensorLog.length - 1; i >= 0; i--) {
            if (this.sensorLog[i].t <= cutoff) return this.sensorLog[i];
        }
        // Nothing has cleared the pipeline yet, so the controller still sees the oldest reading
        return this.sensorLog[0] ?? this.sensed;
    }

    // Returns the world-frame position of the CoG offset point, as the controller senses it
    getX() {
        const s = this.currentSense();
        const theta = toRad(s.angle);
        return s.x + this.cogOffsetX * Math.cos(theta) + this.cogOffsetY * Math.sin(theta);
    }
    getY() {
        const s = this.currentSense();
        const theta = toRad(s.angle);
        return s.y - this.cogOffsetX * Math.sin(theta) + this.cogOffsetY * Math.cos(theta);
    }
    getAngle() { return this.currentSense().angle; }
    getRotation() { return this.currentSense().rotation; }

    // Ground truth for the renderer; controllers must not read these
    getTrueX() {
        const theta = toRad(this.angle);
        return this.x + this.cogOffsetX * Math.cos(theta) + this.cogOffsetY * Math.sin(theta);
    }
    getTrueY() {
        const theta = toRad(this.angle);
        return this.y - this.cogOffsetX * Math.sin(theta) + this.cogOffsetY * Math.cos(theta);
    }
    getTrueAngle() { return this.angle; }

    getPose(): Pose { return { x: this.x, y: this.y, angle: this.angle } }

    // Returns Velocity in in/s (includes lateral drift)
    public getXVelocity(): number {
        return this.currentSense().velX;
    }

    // Returns Velocity in in/s (includes lateral drift)
    public getYVelocity(): number {
        return this.currentSense().velY;
    }

    // Returns angular velocity in degrees per second
    public getAngularVelocity(): number {
        const s = this.currentSense();
        const vL_in = s.vL * 12;
        const vR_in = s.vR * 12;

        const b_in = this.width - 2;

        if (b_in === 0) return 0;

        const omegaRad = (vR_in - vL_in) / b_in;

        return toDeg(omegaRad);
    }

    /** Displacement of one arc step in world coordinates. Shared by true physics and odometry. */
    private static arcDisplace(prevAngleRad: number, fwdDelta: number, latDelta: number, dThetaRad: number): { dx: number, dy: number } {
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

    private imuDriftDeg(): number {
        if (this.extras.odomDriftPercent === null) return 0;
        return this.imuDriftSign * (IMU_DRIFT_DEG_PER_MIN / 60) * this.simTime;
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        if (this.holonomicRobot) {
            this.mecanumDrive(leftCmd, rightCmd, leftCmd, rightCmd, dt);
            return;
        }

        const left = clamp(finiteCmd(leftCmd), -1, 1);
        const right = clamp(finiteCmd(rightCmd), -1, 1);

        if (!this.extrasActive()) {
            this.legacyTankStep(left, right, dt);
            this.simTime += dt;
            return;
        }

        const n = Math.max(1, Math.round(dt / PHYSICS_DT));
        const h = dt / n;
        for (let i = 0; i < n; i++) this.stepTank(left, right, h);
    }

    /** The original one-step physics, kept verbatim so a robot with no extras is unchanged. */
    private legacyTankStep(left: number, right: number, dt: number) {
        const targetVL_ft = left * this.maxSpeed;
        const targetVR_ft = right * this.maxSpeed;

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
        const orientation_delta_rad = this.trackwidth !== 0
            ? (vL_in - vR_in) / this.trackwidth * dt
            : 0;

        const new_orientation_rad = toRad(this.angle) + orientation_delta_rad;
        const rightX = Math.cos(new_orientation_rad);
        const rightY = -Math.sin(new_orientation_rad);
        const lat_speed = this.velX * rightX + this.velY * rightY;

        this.odometryUpdate(fwd_speed * dt, 0, orientation_delta_rad, fwd_speed, lat_speed);
    }

    /** One physics substep of the full pipeline: motors, pose, sensors. */
    private stepTank(left: number, right: number, h: number) {
        // Motor model: the first-order lag is the back-EMF side of a DC motor
        const targetVL = left * this.maxSpeed;
        const targetVR = right * this.maxSpeed;

        const targetLinear = (targetVL + targetVR) / 2;
        const targetAngular = (targetVR - targetVL) / 2;
        const currentLinear = (this.vL + this.vR) / 2;
        const currentAngular = (this.vR - this.vL) / 2;

        const kLat = 1 - Math.exp(-h / this.lateralTau);
        const kAng = 1 - Math.exp(-h / this.angularTau);

        const newLinear = currentLinear + (targetLinear - currentLinear) * kLat;
        const newAngular = currentAngular + (targetAngular - currentAngular) * kAng;

        this.vL = newLinear - newAngular;
        this.vR = newLinear + newAngular;

        const dLIn = this.vL * 12 * h;
        const dRIn = this.vR * 12 * h;

        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;
        const fwdWheel = (vL_in + vR_in) / 2;
        const omega = this.trackwidth !== 0 ? (vL_in - vR_in) / this.trackwidth : 0; // rad/s, clockwise

        this.odometryUpdate(fwdWheel * h, 0, omega * h, fwdWheel, 0);

        this.simTime += h;
        this.updateOdomEstimate(dLIn, dRIn);
        this.recordSense();
    }

    mecanumDrive(flCmd: number, frCmd: number, rlCmd: number, rrCmd: number, dt: number) {
        const fl = clamp(finiteCmd(flCmd), -1, 1);
        const fr = clamp(finiteCmd(frCmd), -1, 1);
        const rl = clamp(finiteCmd(rlCmd), -1, 1);
        const rr = clamp(finiteCmd(rrCmd), -1, 1);

        if (!this.extrasActive()) {
            this.legacyMecanumStep(fl, fr, rl, rr, dt);
            this.simTime += dt;
            return;
        }

        const n = Math.max(1, Math.round(dt / PHYSICS_DT));
        const h = dt / n;
        for (let i = 0; i < n; i++) this.stepMecanum(fl, fr, rl, rr, h);
    }

    /** The original one-step mecanum physics, kept verbatim for a robot with no extras. */
    private legacyMecanumStep(fl: number, fr: number, rl: number, rr: number, dt: number) {
        const tFL = fl * this.maxSpeed;
        const tFR = fr * this.maxSpeed;
        const tRL = rl * this.maxSpeed;
        const tRR = rr * this.maxSpeed;

        const r = (this.height + this.trackwidth) / 2;
        const targetFwd = (tFL + tFR + tRL + tRR) / 4;
        const targetLat = (tFL - tFR - tRL + tRR) / 4;
        const targetOmega = r !== 0 ? (tFL - tFR + tRL - tRR) / (4 * r) : 0;

        const curFwd = (this.vFL + this.vFR + this.vRL + this.vRR) / 4;
        const curLat = (this.vFL - this.vFR - this.vRL + this.vRR) / 4;
        const curOmega = r !== 0 ? (this.vFL - this.vFR + this.vRL - this.vRR) / (4 * r) : 0;

        const kLat = 1 - Math.exp(-dt / this.lateralTau);
        const kAng = 1 - Math.exp(-dt / this.angularTau);

        const newFwd = curFwd + (targetFwd - curFwd) * kLat;
        const newLat = curLat + (targetLat - curLat) * kLat;
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

    /** One physics substep of the full mecanum pipeline. */
    private stepMecanum(fl: number, fr: number, rl: number, rr: number, h: number) {
        const tFL = fl * this.maxSpeed;
        const tFR = fr * this.maxSpeed;
        const tRL = rl * this.maxSpeed;
        const tRR = rr * this.maxSpeed;

        const r = (this.height + this.trackwidth) / 2;
        const targetFwd = (tFL + tFR + tRL + tRR) / 4;
        const targetLat = (tFL - tFR - tRL + tRR) / 4;
        const targetOmega = r !== 0 ? (tFL - tFR + tRL - tRR) / (4 * r) : 0;

        const curFwd = (this.vFL + this.vFR + this.vRL + this.vRR) / 4;
        const curLat = (this.vFL - this.vFR - this.vRL + this.vRR) / 4;
        const curOmega = r !== 0 ? (this.vFL - this.vFR + this.vRL - this.vRR) / (4 * r) : 0;

        const kLat = 1 - Math.exp(-h / this.lateralTau);
        const kAng = 1 - Math.exp(-h / this.angularTau);

        const newFwd = curFwd + (targetFwd - curFwd) * kLat;
        const newLat = curLat + (targetLat - curLat) * kLat;
        const newOmega = curOmega + (targetOmega - curOmega) * kAng;

        this.vFL = newFwd + newLat + newOmega * r;
        this.vFR = newFwd - newLat - newOmega * r;
        this.vRL = newFwd - newLat + newOmega * r;
        this.vRR = newFwd + newLat - newOmega * r;

        const dFwdIn = newFwd * 12 * h;
        const dLatIn = newLat * 12 * h;

        const fwdWheel = newFwd * 12;
        const latWheel = newLat * 12;
        const omega = newOmega * 12; // rad/s, clockwise

        this.odometryUpdate(fwdWheel * h, latWheel * h, omega * h, fwdWheel, latWheel);

        this.simTime += h;
        // Encoder-side forward/lateral deltas, expressed as virtual left/right wheels so the same
        // odometry estimate serves both drive types
        this.updateOdomEstimate(dFwdIn, dFwdIn, dLatIn);
        this.recordSense();
    }

    /**
     * The odometry task's own integration: measured wheel deltas and the IMU heading, never the
     * true pose. Slip, backlash, scale error and quantization all land here and stay here.
     */
    private updateOdomEstimate(dLIn: number, dRIn: number, dLatIn: number = 0) {
        const e = this.extras;
        if (e.odomDriftPercent === null) return;

        const scale = 1 + e.odomDriftPercent / 100;
        this.encL += dLIn * scale;
        this.encR += dRIn * scale;
        this.encLat += dLatIn * scale;
        const outL = Math.round(this.encL / ENCODER_QUANT_IN) * ENCODER_QUANT_IN;
        const outR = Math.round(this.encR / ENCODER_QUANT_IN) * ENCODER_QUANT_IN;
        const outLat = Math.round(this.encLat / ENCODER_QUANT_IN) * ENCODER_QUANT_IN;
        const dL = outL - this.encLOut;
        const dR = outR - this.encROut;
        const dLat = outLat - this.encLatOut;
        this.encLOut = outL;
        this.encROut = outR;
        this.encLatOut = outLat;

        const measRot = this.rotation + this.imuDriftDeg() + this.gauss() * IMU_NOISE_DEG;
        const dThetaRad = toRad(measRot - this.odomRotation);
        const fwdDelta = (dL + dR) / 2;

        const { dx, dy } = Robot.arcDisplace(toRad(this.odomAngle), fwdDelta, dLat, dThetaRad);
        this.odomX += dx;
        this.odomY += dy;
        this.odomRotation = measRot;
        this.odomAngle = normalizeDeg(this.odomAngle + toDeg(dThetaRad));
    }

    /** Publish what the sensors currently say, and let it age through the latency pipeline. */
    private recordSense() {
        if (!this.extrasActive()) return;
        const e = this.extras;
        const odomOn = e.odomDriftPercent !== null;

        let sx: number, sy: number, sAngle: number, sRot: number, sVelX: number, sVelY: number;
        if (odomOn) {
            sx = this.odomX;
            sy = this.odomY;
            sAngle = this.odomAngle;
            sRot = this.odomRotation;
            // Velocity as the odom task derives it: encoder speed projected on the measured heading
            const fwdV = this.holonomicRobot
                ? (this.vFL + this.vFR + this.vRL + this.vRR) / 4 * 12
                : (this.vL + this.vR) / 2 * 12;
            const th = toRad(sAngle);
            sVelX = fwdV * Math.sin(th);
            sVelY = fwdV * Math.cos(th);
        } else {
            // Latency only: the pipeline ages the true state
            sx = this.x;
            sy = this.y;
            sRot = this.rotation;
            sAngle = this.angle;
            sVelX = this.velX;
            sVelY = this.velY;
        }

        const sample: SensorSample = {
            t: this.simTime,
            x: sx, y: sy, angle: sAngle, rotation: sRot,
            velX: sVelX, velY: sVelY,
            vL: this.vL, vR: this.vR,
        };
        this.sensed = sample;

        if (e.latencyMs !== null) {
            this.sensorLog.push(sample);
            const cutoff = this.simTime - e.latencyMs / 1000;
            while (this.sensorLog.length > 1 && this.sensorLog[1].t <= cutoff) this.sensorLog.shift();
        }
    }

    private odometryUpdate(forward_delta: number, sideways_delta: number, orientation_delta_rad: number, fwd_speed: number, lat_speed: number) {
        const prev_orientation_rad = toRad(this.angle);
        const orientation_rad = prev_orientation_rad + orientation_delta_rad;
        this.setAngle(toDeg(orientation_rad));
        this.rotation += toDeg(orientation_delta_rad);

        const { dx, dy } = Robot.arcDisplace(prev_orientation_rad, forward_delta, sideways_delta, orientation_delta_rad);
        this.x += dx;
        this.y += dy;

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
        this.vRL = 0;
        this.vRR = 0;
    }

    // x, y are the CoG offset point position; converts to kinematic center internally
    public setPose(x: number, y: number, angle: number) {
        this.angle = angle;
        this.rotation = angle;
        const θ = toRad(angle);
        this.x = x - (this.cogOffsetX * Math.cos(θ) + this.cogOffsetY * Math.sin(θ));
        this.y = y - (-this.cogOffsetX * Math.sin(θ) + this.cogOffsetY * Math.cos(θ));
        this.velX = 0;
        this.velY = 0;

        // A pose set is the code calling odom.setPose: the estimate and the sensor pipeline
        // restart from here
        this.odomX = this.x;
        this.odomY = this.y;
        this.odomAngle = this.angle;
        this.odomRotation = this.rotation + this.imuDriftDeg();
        this.encL = 0;
        this.encLOut = 0;
        this.encR = 0;
        this.encROut = 0;
        this.encLat = 0;
        this.encLatOut = 0;
        this.sensed = this.truthSample();
        this.sensorLog = [this.sensed];

        return true;
    }


    public wait(timeout: number, dt: number): boolean {
        this.timeout += (dt * 1000);
        this.tankDrive(0, 0, dt);
        if (this.timeout >= timeout) {
            this.timeout = 0;
            return true;
        }
        return false;
    }
}
