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

    private timeElsapsed: number = 0;
    
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
        this.timeElsapsed = 0;
        this.stopLastState = "GO";
    }

  getStopState(
    currentState: PoseState,
    targetState: Pose,
    startState: Pose,
    dropEarly: number,
    dt: number
  ): StopState {
    if (this.timeout !== null && this.timeout > 0) {
      this.timeElsapsed += (dt / 1000);
      if (this.timeElsapsed > this.timeout) return "EXIT";
    }

    const xv = currentState.xVel ?? 0;
    const yv = currentState.yVel ?? 0;
    const longitudinalSpeed = Math.sqrt(xv * xv + yv * yv);

    const posCurrent: Pose = {
      x: currentState.x,
      y: currentState.y,
      angle: currentState.angle,
    };

    const posFinal: Pose = {
      x: targetState.x,
      y: targetState.y,
      angle: toDeg(
        Math.atan2(
          (targetState.y ?? 0) - (startState.y ?? 0),
          (targetState.x ?? 0) - (startState.x ?? 0),
        ),
      ),
    };

    const error: Pose = to_relative(posCurrent, posFinal);

    const longitudinalDistance = -(error.x ?? 0) - dropEarly;

    if (longitudinalDistance < 0) {
      this.stopLastState = "BRAKE";
      return this.harshThreshold > 1 ? "BRAKE" : "EXIT";
    }

    if (
      longitudinalSpeed * (this.harshThreshold / 1000) > longitudinalDistance ||
      this.stopLastState === "BRAKE"
    ) {
      this.stopLastState = "BRAKE";
      return "BRAKE";
    }

    if (
      longitudinalSpeed * (this.coastThreshold / 1000) > longitudinalDistance ||
      this.stopLastState === "COAST"
    ) {
      this.stopLastState = "COAST";
      return "COAST";
    }

    return "GO";
  }
}