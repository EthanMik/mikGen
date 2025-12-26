import { clamp, normalizeDeg, toDeg, toRad } from "./Util";

type RobotConstants = {
    width: number,
    height: number,
    speed: number,
    accel: number
}

export const robotConstants: RobotConstants = {
    width: 14,
    height: 14,
    speed: 6,
    accel: 15
}

let state: RobotConstants = { ...robotConstants };

const listeners = new Set<() => void>();

export const robotConstantsStore = {
  get: () => state,

  set: (partial: Partial<RobotConstants>) => {
    state = { ...state, ...partial };
    Object.assign(robotConstants, state);
    listeners.forEach((fn) => fn());
  },

  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export class Robot {
    public width: number;
    public height: number;
    public maxSpeed: number;
    public trackWidth: number;

    private x: number = 0; 
    private y: number = 0;
    private angle: number = 0;

    private vL: number = 0;
    private vR: number = 0;
    public maxAccel: number;
    public maxDecel: number;

    constructor(startX: number, startY: number, startAngle: number, width: number, height: number, maxSpeed: number, trackWidth: number, maxAccel: number, maxDecel: number) {
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed;
        this.trackWidth = trackWidth;
        this.maxAccel = maxAccel;
        this.maxDecel = maxDecel;
    }

    private setX(x: number) { 
        this.x = x 
    }

    private setY(y: number) { 
        this.y = y 
    }

    private setAngle(angle: number) { 
        this.angle = normalizeDeg(angle);
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getAngle() { return this.angle; }

    // Returns Velocity in in/s
    public getXVelocity(): number {
        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;
        
        const v_in = (vR_in + vL_in) / 2;
        
        const θ = toRad(this.getAngle());
        const forwardX = Math.sin(θ);
        
        return v_in * forwardX;
    }
    
    // Returns Velocity in in/s
    public getYVelocity(): number {
        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        const v_in = (vR_in + vL_in) / 2;

        const θ = toRad(this.getAngle());
        const forwardY = Math.cos(θ);

        return v_in * forwardY;
    }

    private moveTowards(current: number, target: number, dt: number): number {
        const diff = target - current;

        const signFlip = current !== 0 && target !== 0 && Math.sign(current) !== Math.sign(target);
        const isAccel = !signFlip && Math.abs(target) > Math.abs(current);

        const maxDelta = (isAccel ? this.maxAccel : this.maxDecel) * dt;

        if (Math.abs(diff) <= maxDelta) return target;
        return current + Math.sign(diff) * maxDelta;
    }

    tankDrive(leftCmd: number, rightCmd: number, dt: number) {
        const b_in = this.trackWidth;
        const v_max_ft = this.maxSpeed;

        const left  = clamp(leftCmd,  -1, 1);
        const right = clamp(rightCmd, -1, 1);

        const targetVL_ft = left  * v_max_ft;
        const targetVR_ft = right * v_max_ft;

        this.vL = this.moveTowards(this.vL, targetVL_ft, dt);
        this.vR = this.moveTowards(this.vR, targetVR_ft, dt);

        const vL_in = this.vL * 12;
        const vR_in = this.vR * 12;

        const v_in  = (vR_in + vL_in) / 2;        

        const ω = (vL_in - vR_in) / b_in;

        const θdeg = this.getAngle();
        const θ = toRad(θdeg);

        const forwardX = Math.sin(θ);
        const forwardY = Math.cos(θ);

        const xNew = this.getX() + v_in * forwardX * dt;
        const yNew = this.getY() + v_in * forwardY * dt;

        const θNew = θ + ω * dt;
        let θdegNew = toDeg(θNew);
        θdegNew = normalizeDeg(θdegNew);

        this.setX(xNew);
        this.setY(yNew);
        this.setAngle(θdegNew);
    }

    public stop() {
        this.vL = 0;
        this.vR = 0;
    }

    public setPose(x: number, y: number, angle: number) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        
        return true;
    }
}
