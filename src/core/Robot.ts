import type { PathSim } from "./PathSim";
import { clamp, normalizeDeg, toDeg, toRad } from "./Util";

export class Robot {
    public width: number;
    public height: number;
    public maxSpeed: number;
    public trackWidth: number;

    private x: number = 0; 
    private y: number = 0;
    private angle: number = 0;
    private pathTime: number = 0;

    private vL: number = 0;
    private vR: number = 0;
    public maxAccel: number;

    constructor(startX: number, startY: number, startAngle: number, width: number, height: number, maxSpeed: number, trackWidth: number, maxAccel: number) {
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed;
        this.trackWidth = trackWidth;
        this.maxAccel = maxAccel;
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

    private moveTowards(current: number, target: number, maxDelta: number): number {
        const diff = target - current;
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

        const dvMax_ft = this.maxAccel * dt;

        this.vL = this.moveTowards(this.vL, targetVL_ft, dvMax_ft);
        this.vR = this.moveTowards(this.vR, targetVR_ft, dvMax_ft);

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

    public setPose(x: number, y: number, angle: number) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        
        return true;
    }

    public pathFollow(path: PathSim, dt: number) {
        if (!path.trajectory.length) return;

        this.pathTime += dt;
        if (this.pathTime > path.totalTime) {
            this.pathTime = path.totalTime;
        }

        const normalized = this.pathTime / path.totalTime;
        const idx = Math.floor(normalized * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];

        this.setX(snap.x);
        this.setY(snap.y);
        this.setAngle(snap.angle);
    }
}
