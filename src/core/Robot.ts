import type { Pose } from "./Types/Pose";
import { clamp, toDeg, toRad } from "./Util";
import { newDriveState, stopDriveState, type Chassis, type DriveState } from "./robot/kinematics";
import { tankStep } from "./robot/tank";
import { mecanumStep } from "./robot/mecanum";
import { sampleAt, sampleOf, trimLog, type SensorSample } from "./robot/sensing";

export { defaultRobotConstants, type RobotConstants } from "./robot/constants";
import type { RobotConstants } from "./robot/constants";

/** Where a robot starts. Distinct from the editor's Pose, whose fields may be unset. */
export type StartPose = { x: number, y: number, angle: number };

function finiteCmd(cmd: number): number {
    return Number.isFinite(cmd) ? cmd : 0;
}

/**
 * The simulated robot. Holds the true state, steps it through whichever drive model the chassis is,
 * and answers pose queries the way the controller would see them.
 *
 * Controllers read getX/getY/getAngle, which are subject to sensing latency. The renderer reads
 * getTrueX/getTrueY/getTrueAngle, which never are.
 */
export class Robot {
    private state: DriveState;
    private chassis: Chassis;
    private simTime: number = 0;
    /** Past true poses. Only maintained while latency is on. */
    private sensorLog: SensorSample[] = [];
    private timeout: number = 0;

    public readonly width: number;
    public readonly height: number;
    public readonly trackwidth: number;
    public readonly maxSpeed: number;
    public readonly cogOffsetX: number;
    public readonly cogOffsetY: number;
    public holonomicRobot: boolean;

    /** Seconds per control tick. */
    private readonly controlDt: number;
    /** null when the controller reads ground truth. */
    private readonly latencyMs: number | null;

    constructor(c: RobotConstants, pose: StartPose = { x: 0, y: 0, angle: 0 }) {
        this.width = c.width;
        this.height = c.height;
        this.trackwidth = c.trackwidth;
        this.maxSpeed = c.speed;
        this.cogOffsetX = c.cogOffsetXDisabled ? 0 : c.cogOffsetX;
        this.cogOffsetY = c.cogOffsetYDisabled ? 0 : c.cogOffsetY;
        this.holonomicRobot = c.holonomicRobot;
        this.controlDt = 1 / c.updateHz;
        this.latencyMs = c.latencyDisabled ? null : c.latencyMs;

        this.chassis = {
            maxSpeed: c.speed,
            trackwidth: c.trackwidth,
            height: c.height,
            lateralTau: c.lateralTau,
            angularTau: c.angularTau,
        };
        this.state = newDriveState(pose.x, pose.y, pose.angle);
        this.sensorLog = [sampleOf(this.state, 0)];
    }

    /** Seconds one controller tick takes. The sim loop paces itself on this. */
    public getControlDt(): number {
        return this.controlDt;
    }

    /** Elapsed sim time in seconds. */
    public getTime(): number {
        return this.simTime;
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        if (this.holonomicRobot) {
            this.mecanumDrive(leftCmd, rightCmd, leftCmd, rightCmd, dt);
            return;
        }

        tankStep(this.state, this.chassis, clamp(finiteCmd(leftCmd), -1, 1), clamp(finiteCmd(rightCmd), -1, 1), dt);
        this.advance(dt);
    }

    mecanumDrive(flCmd: number, frCmd: number, rlCmd: number, rrCmd: number, dt: number) {
        mecanumStep(
            this.state, this.chassis,
            clamp(finiteCmd(flCmd), -1, 1), clamp(finiteCmd(frCmd), -1, 1),
            clamp(finiteCmd(rlCmd), -1, 1), clamp(finiteCmd(rrCmd), -1, 1),
            dt,
        );
        this.advance(dt);
    }

    /** Close out a tick: move the clock on, then log what the sensors would have seen. */
    private advance(dt: number) {
        this.simTime += dt;
        if (this.latencyMs === null) return;
        this.sensorLog.push(sampleOf(this.state, this.simTime));
        trimLog(this.sensorLog, this.simTime - this.latencyMs / 1000);
    }

    /** The reading the controller gets this instant: ground truth, or the pose latencyMs ago. */
    private sensed(): SensorSample {
        if (this.latencyMs === null) return sampleOf(this.state, this.simTime);
        return sampleAt(this.sensorLog, this.simTime - this.latencyMs / 1000)
            ?? sampleOf(this.state, this.simTime);
    }

    // Position of the CoG offset point, as the controller senses it
    getX() {
        const s = this.sensed();
        return s.x + this.cogOffsetX * Math.cos(toRad(s.angle)) + this.cogOffsetY * Math.sin(toRad(s.angle));
    }
    getY() {
        const s = this.sensed();
        return s.y - this.cogOffsetX * Math.sin(toRad(s.angle)) + this.cogOffsetY * Math.cos(toRad(s.angle));
    }
    getAngle() { return this.sensed().angle; }
    getRotation() { return this.sensed().rotation; }

    /** Velocity in in/s, including lateral drift. */
    getXVelocity() { return this.sensed().velX; }
    getYVelocity() { return this.sensed().velY; }

    /** Angular velocity in degrees per second. */
    getAngularVelocity(): number {
        const s = this.sensed();
        const b_in = this.width - 2;
        if (b_in === 0) return 0;
        return toDeg((s.vR * 12 - s.vL * 12) / b_in);
    }

    // Ground truth for the renderer; controllers must not read these
    getTrueX() {
        const s = this.state;
        return s.x + this.cogOffsetX * Math.cos(toRad(s.angle)) + this.cogOffsetY * Math.sin(toRad(s.angle));
    }
    getTrueY() {
        const s = this.state;
        return s.y - this.cogOffsetX * Math.sin(toRad(s.angle)) + this.cogOffsetY * Math.cos(toRad(s.angle));
    }
    getTrueAngle() { return this.state.angle; }

    getPose(): Pose { return { x: this.state.x, y: this.state.y, angle: this.state.angle } }

    public stop() {
        stopDriveState(this.state);
    }

    /** x, y are the CoG offset point; converts to kinematic center internally. */
    public setPose(x: number, y: number, angle: number) {
        const s = this.state;
        s.angle = angle;
        s.rotation = angle;
        const theta = toRad(angle);
        s.x = x - (this.cogOffsetX * Math.cos(theta) + this.cogOffsetY * Math.sin(theta));
        s.y = y - (-this.cogOffsetX * Math.sin(theta) + this.cogOffsetY * Math.cos(theta));
        s.velX = 0;
        s.velY = 0;

        // A pose set restarts the pipeline, so no stale reading survives the teleport
        this.sensorLog = [sampleOf(s, this.simTime)];

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
