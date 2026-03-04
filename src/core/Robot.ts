import { createObjectStore } from "./Store";
import { clamp, normalizeDeg, toDeg, toRad } from "./Util";

export type RobotConstants = {
    width: number,
    height: number,
    speed: number,
    accel: number,
    lateralFriction: number,
    // Offset of the robot's reference/tracking center from the kinematic center
    // (midpoint between drive wheels), in the robot's local frame.
    // NOT the same as odometry offsets — odometry offsets are relative to this point.
    cogOffsetX: number, // lateral offset (positive = robot's right)
    cogOffsetY: number, // longitudinal offset (positive = robot's forward)
}

export const defaultRobotConstants: RobotConstants = {
    width: 14,
    height: 14,
    speed: 6,
    accel: 15,
    lateralFriction: 10,
    cogOffsetX: 0,
    cogOffsetY: 0,
}

export const robotConstantsStore = createObjectStore<RobotConstants>(defaultRobotConstants);

export class Robot {
    public width: number;
    public height: number;
    public maxSpeed: number;
    public trackWidth: number;

    // Kinematic center (midpoint between drive wheels) — internal only
    private x: number = 0;
    private y: number = 0;
    private angle: number = 0;

    private vL: number = 0;
    private vR: number = 0;
    private velX: number = 0;
    private velY: number = 0;
    public maxAccel: number;
    public maxDecel: number;
    public lateralFriction: number;

    // CoG offset in robot-local frame (not odometry offsets, which are relative to this point)
    public cogOffsetX: number; // lateral (positive = robot's right)
    public cogOffsetY: number; // longitudinal (positive = robot's forward)

    constructor(startX: number, startY: number, startAngle: number, width: number, height: number, maxSpeed: number, trackWidth: number, maxAccel: number, maxDecel: number, lateralFriction: number = 10, cogOffsetX: number = 0, cogOffsetY: number = 0) {
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed;
        this.trackWidth = trackWidth;
        this.maxAccel = maxAccel;
        this.maxDecel = maxDecel;
        this.lateralFriction = lateralFriction;
        this.cogOffsetX = cogOffsetX;
        this.cogOffsetY = cogOffsetY;
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

    // Returns Velocity in in/s (includes lateral drift)
    public getXVelocity(): number {
        return this.velX;
    }

    // Returns Velocity in in/s (includes lateral drift)
    public getYVelocity(): number {
        return this.velY;
    }

    private moveTowards(current: number, target: number, dt: number): number {
        const diff = target - current;

        const signFlip = current !== 0 && target !== 0 && Math.sign(current) !== Math.sign(target);
        const isAccel = !signFlip && Math.abs(target) > Math.abs(current);

        const maxDelta = (isAccel ? this.maxAccel : this.maxDecel) * dt;

        if (Math.abs(diff) <= maxDelta) return target;
        return current + Math.sign(diff) * maxDelta;
    }

    // Returns angular velocity in degrees per second
    public getAngularVelocity(): number {
        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        const b_in = this.trackWidth;

        if (b_in === 0) return 0;

        const omegaRad = (vR_in - vL_in) / b_in;

        return toDeg(omegaRad);
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        const b_in = this.trackWidth;      // Distance between wheel centers (inches)
        const v_max_ft = this.maxSpeed;    // Maximum linear velocity (feet/second)

        // Input is in the range -1 to 1, with - being reverse
        const left  = clamp(leftCmd,  -1, 1);
        const right = clamp(rightCmd, -1, 1);

        // Convert commands to wheel velocities (ft/s)
        const targetVL_ft = left  * v_max_ft;
        const targetVR_ft = right * v_max_ft;

        // Apply acceleration limits to smoothly approach target velocity
        this.vL = this.moveTowards(this.vL, targetVL_ft, dt);
        this.vR = this.moveTowards(this.vR, targetVR_ft, dt);

        // Convert wheel velocities to inches/second for position calculations
        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        // Calculate linear velocity (in/s)
        const v_in = (vR_in + vL_in) / 2;

        // Calculate angular velocity using differential drive kinematic equation
        const ω = (vL_in - vR_in) / b_in;

        // Update heading first
        const θ = toRad(this.angle);
        const θNew = θ + ω * dt;
        this.setAngle(toDeg(θNew));

        // Forward and lateral unit vectors in the NEW heading direction
        const forwardX = Math.sin(θNew);
        const forwardY = Math.cos(θNew);
        const lateralX = Math.cos(θNew);    // perpendicular right
        const lateralY = -Math.sin(θNew);   // perpendicular right

        // Decompose current velocity into lateral component only (longitudinal is set from wheel speeds)
        const latComponent = this.velX * lateralX + this.velY * lateralY;

        // Lateral: decay with friction (simulates tire slip during turns)
        const newLat = latComponent * Math.max(0, 1 - this.lateralFriction * dt);

        // Reconstruct actual velocity vector
        this.velX = v_in * forwardX + newLat * lateralX;
        this.velY = v_in * forwardY + newLat * lateralY;

        // Update kinematic center position using actual velocity
        this.x += this.velX * dt;
        this.y += this.velY * dt;
    }

    public stop() {
        this.vL = 0;
        this.vR = 0;
        this.velX = 0;
        this.velY = 0;
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
