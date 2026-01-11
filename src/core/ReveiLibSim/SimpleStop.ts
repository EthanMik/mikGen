import { type Pose, type PoseState } from "../Types/Pose";
import { toDeg } from "../Util";
import { to_relative } from "./Util";

export type StopState = "GO" | "EXIT" | "BRAKE" | "COAST";

export class SimpleStop {
    harshThreshold: number;
    coastThreshold: number;
    coastPower: number;
    timeout: number | null = null;
    stopLastState: StopState = "GO";

    private timeInit: number | null = null;
    
    constructor (harshThreshold: number, coastThreshold: number, coastPower: number, timeout: number | null = null) {
        this.harshThreshold = harshThreshold;
        this.coastThreshold = coastThreshold;
        this.coastPower = Math.abs(coastPower);
        this.timeout = timeout;
    }

    getCoastPower(): number {
        return this.coastPower;
    }

    reset() {
        this.timeInit = null;
        this.stopLastState = "GO";
    }

    getStopState(currentState: PoseState, targetState: Pose, startState: Pose, dropEarly: number): StopState  {
        if (this.timeout !== null) {
            const now = Date.now();

            if (this.timeInit === null) {
                this.timeInit = now;
            } else if (now > this.timeInit + this.timeout) {
                return "EXIT";
            }
        }

        const longitudinalSpeed = Math.sqrt((currentState.xVel ?? 0) * (currentState.xVel ?? 0) + (currentState.yVel ?? 0) * (currentState.yVel ?? 0));

        const posCurrent: Pose = { ...currentState };
        
        const posFinal: Pose = { ...targetState };
        posFinal.angle = toDeg(Math.atan2((posFinal.x ?? 0) - (startState.x ?? 0), (posFinal.y ?? 0) - (startState.y ?? 0)));

        const error: Pose = to_relative(posCurrent, posFinal);
        
        const longitudinalDistance = (error.y ?? 0) - dropEarly;
        
        console.log(longitudinalSpeed, longitudinalDistance)

        if (longitudinalDistance < 0) {
            this.stopLastState = "BRAKE";
            return this.harshThreshold > 1 ? "BRAKE" : "EXIT";
        }

        if (longitudinalSpeed * (this.harshThreshold / 1000) > longitudinalDistance || this.stopLastState == "BRAKE") {
            this.stopLastState = "BRAKE";
            return "BRAKE";
        }

        if (longitudinalSpeed * (this.coastThreshold / 1000) > longitudinalDistance || this.stopLastState == "COAST") {
            this.stopLastState = "COAST";
            return "COAST";
        }

        return "GO";
    }
}