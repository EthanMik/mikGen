import { createObjectStore } from "./Store";
import type { Pose } from "./Types/Pose";
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
    expansionFront: number,
    expansionLeft: number,
    expansionRight: number,
    expansionRear: number,
    isMecnum: boolean,
}

export const defaultRobotConstants: RobotConstants = {
    width: 14,
    height: 14,
    speed: 6,
    accel: 15,
    lateralFriction: 10,
    cogOffsetX: 0,
    cogOffsetY: 0,
    expansionFront: 0,
    expansionLeft: 0,
    expansionRight: 0,
    expansionRear: 0,
    isMecnum: false
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

    constructor(
        private x: number,
        private y: number,
        private angle: number,
        public width: number,
        public height: number,
        public maxSpeed: number,
        public maxAccel: number,
        public maxDecel: number,
        public lateralFriction: number = 10,

        public cogOffsetX: number = 0, // lateral (positive = robot's right)
        public cogOffsetY: number = 0, // longitudinal (positive = robot's forward)
        public expansionFront: number = 0,
        public expansionLeft: number = 0,
        public expansionRight: number = 0,
        public expansionRear: number = 0,
    ) {}

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

        const b_in = this.width;

        if (b_in === 0) return 0;

        const omegaRad = (vR_in - vL_in) / b_in;

        return toDeg(omegaRad);
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        const b_in = this.width;      // Distance between wheel centers (inches)
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

    mecanumDrive(flCmd: number, frCmd: number, rlCmd: number, rrCmd: number, dt: number) {
        const fl = clamp(flCmd, -1, 1);
        const fr = clamp(frCmd, -1, 1);
        const rl = clamp(rlCmd, -1, 1);
        const rr = clamp(rrCmd, -1, 1);

        const tFL = fl * this.maxSpeed;
        const tFR = fr * this.maxSpeed;
        const tRL = rl * this.maxSpeed;
        const tRR = rr * this.maxSpeed;

        this.vFL = this.moveTowards(this.vFL, tFL, dt);
        this.vFR = this.moveTowards(this.vFR, tFR, dt);
        this.vRL = this.moveTowards(this.vRL, tRL, dt);
        this.vRR = this.moveTowards(this.vRR, tRR, dt);

        const FL = this.vFL * 12;
        const FR = this.vFR * 12;
        const RL = this.vRL * 12;
        const RR = this.vRR * 12;


        const vFwd   = (FL + FR + RL + RR) / 4;
        const vRight = (-FL + FR + RL - RR) / 4;

        const rx = this.height / 2;
        const ry = this.width / 2;
        const r = rx + ry;

        const omega = (-FL + FR - RL + RR) / (4 * r);

        const θ = toRad(this.angle);

        const forwardX = Math.sin(θ);
        const forwardY = Math.cos(θ);
        const rightX   = Math.cos(θ);
        const rightY   = -Math.sin(θ);

        const vx = vFwd * forwardX + vRight * rightX; // in/s
        const vy = vFwd * forwardY + vRight * rightY; // in/s

        this.velX = vx;
        this.velY = vy;

        let xNew = this.x + vx * dt;
        let yNew = this.y + vy * dt;
        const θNew = θ + omega * dt;
        
        this.x = xNew;
        this.y = yNew;
        this.angle = θNew
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
        const θ = toRad(angle);
        this.x = x - (this.cogOffsetX * Math.cos(θ) + this.cogOffsetY * Math.sin(θ));
        this.y = y - (-this.cogOffsetX * Math.sin(θ) + this.cogOffsetY * Math.cos(θ));
        this.velX = 0;
        this.velY = 0;

        return true;
    }
}
