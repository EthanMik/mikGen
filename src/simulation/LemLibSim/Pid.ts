import type { LemConstants } from "./LemConstants";

export class LemPID {
    public kp: number;
    public ki: number;
    public kd: number;

    public windupRange: number;    

    public integral: number = 0;
    public prevError: number = 0;

    constructor(constants: LemConstants) {
        this.kp = constants.kp;
        this.ki = constants.ki;
        this.kd = constants.kd;

        this.windupRange = constants.antiWindup;
    }

    public update(error: number) {
        this.integral += error;
        if (Math.sign(error) != Math.sign(this.prevError)) this.integral = 0;
        if (Math.abs(error) > this.windupRange && this.windupRange !== 0) this.integral = 0;

        const derivative = error - this.prevError;
        this.prevError = error;

        return error * this.kp + this.integral * this.ki + derivative * this.kd; 
    }

    public reset() {
        this.integral = 0;
        this.prevError = 0;
    }
}