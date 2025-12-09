import type { PIDConstants } from "./Constants";

export class PID {
    public kp: number;
    public ki: number;
    public kd: number;
    
    public starti: number;
    public settleTime: number;
    public settleError: number;
    public timeout: number;

    public maxSpeed: number = 1;
    public minSpeed: number = 0;
    public lead: number = 0;
    public setback: number = 0;

    private acculatedError = 0;
    private previousError = 0;
    private timeSpentSettled = 0;
    private timeSpentRunning = 0;

    constructor(kPID: PIDConstants) {
        this.kp = kPID.kp ? kPID.kp : 0;
        this.ki = kPID.ki ? kPID.ki : 0;
        this.kd = kPID.kd ? kPID.kd : 0;
        this.starti = kPID.starti ? kPID.starti : 0;
        
        this.settleTime = kPID.settleTime ? kPID.settleTime : 0;
        this.settleError = kPID.settleError ? kPID.settleError : 0;
        this.timeout = kPID.timeout ? kPID.timeout : 0;
        
        this.maxSpeed = kPID.maxSpeed ? kPID.maxSpeed : 0;
        this.minSpeed = kPID.minSpeed ? kPID.minSpeed : 0;

        this.lead = kPID.lead ? kPID.lead : 0;        
        this.setback = kPID.setback ? kPID.setback : 0;   
    }

    public update(kPID: PIDConstants) {
        this.kp = kPID.kp ? kPID.kp : 0;
        this.ki = kPID.ki ? kPID.ki : 0;
        this.kd = kPID.kd ? kPID.kd : 0;
        this.starti = kPID.starti ? kPID.starti : 0;
        
        this.settleTime = kPID.settleTime ? kPID.settleTime : 0;
        this.settleError = kPID.settleError ? kPID.settleError : 0;
        this.timeout = kPID.timeout ? kPID.timeout : 0;
        
        this.maxSpeed = kPID.maxSpeed ? kPID.maxSpeed : 0;
        this.minSpeed = kPID.minSpeed ? kPID.minSpeed : 0; 

        this.lead = kPID.lead ? kPID.lead : 0;        
        this.setback = kPID.setback ? kPID.setback : 0;        
    }

    public compute(error: number) {
        if (Math.abs(error) < this.starti){
            this.acculatedError += error;
        }
        if ((error > 0 && this.previousError < 0) || (error < 0 && this.previousError > 0)) { 
            this.acculatedError = 0; 
        }

        const output = this.kp * error + this.ki * this.acculatedError + this.kd * (error - this.previousError);

        this.previousError = error;

        if(Math.abs(error) < this.settleError) {
            this.timeSpentSettled += 10;
        } else {
            this.timeSpentSettled = 0;
        }

        this.timeSpentRunning += 10;

        return output;
    }

    public isSettled(): boolean {
        if (this.timeSpentRunning > this.timeout && this.timeout != 0) {
            return true;
        }
        if (this.timeSpentSettled > this.settleTime) {
            return true;
        }
        return false;
    }

    public reset() {
        this.previousError = 0;
        this.acculatedError = 0;
        this.timeSpentRunning = 0;
        this.timeSpentSettled = 0;
    }
}