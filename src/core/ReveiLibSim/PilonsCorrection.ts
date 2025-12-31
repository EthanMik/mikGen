import type { Pose } from "../Types/Pose";
import { toDeg, toRad } from "../Util";
import { to_relative } from "./Util";

export class PilonsCorrection {
  kCorrection: number;
  maxError: number;

  constructor(kCorrection: number, maxError: number) {
    this.kCorrection = kCorrection;
    this.maxError = maxError;
  }

  private nearSemicircleDeg(angleDeg: number, referenceDeg: number): number {
    return Math.round((referenceDeg - angleDeg) / 180) * 180 + angleDeg;
  }

  applyCorrection(currentState: Pose, targetState: Pose, startState: Pose, powers: [number, number]): [number, number] {
    const posCurrent: Pose = { ...currentState };
    const posFinal: Pose = { ...targetState };

    const dy = (posFinal.y ?? 0) - (startState.y ?? 0);
    const dx = (posFinal.x ?? 0) - (startState.x ?? 0);
    posFinal.angle = toDeg(Math.atan2(dx, dy));

    posFinal.angle = this.nearSemicircleDeg(posFinal.angle ?? 0, startState.angle ?? 0);

    const error: Pose = to_relative(posCurrent, posFinal);
    let errorAngleDeg = -(error.angle ?? 0) + toDeg(Math.atan2(error.x ?? 0, error.y ?? 0));

    errorAngleDeg = this.nearSemicircleDeg(errorAngleDeg, 0);

    const lineError = -(error.x ?? 0) + (error.y ?? 0) * Math.tan(toRad(error.angle ?? 0));
    let correction =
      Math.abs(lineError) > Math.abs(this.maxError)
        ? this.kCorrection * toRad(errorAngleDeg)
        : 0;

    if (powers[0] < 0) correction = -correction;

    if (correction > 0) return [powers[0], powers[1] * Math.exp(-correction)];
    if (correction < 0) return [powers[0] * Math.exp(correction), powers[1]];
    return powers;
  }
}