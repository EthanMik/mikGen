import type { Pose, PoseState } from "../Types/Pose";
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

  applyCorrection(
    currentState: PoseState,
    targetState: Pose,
    startState: Pose,
    powers: [number, number],
  ): [number, number] {
    const posCurrent: Pose = {
      x: currentState.x,
      y: currentState.y,
      angle: currentState.angle,
    };

    const dy = (targetState.y ?? 0) - (startState.y ?? 0);
    const dx = (targetState.x ?? 0) - (startState.x ?? 0);

    const posFinal: Pose = {
      x: targetState.x,
      y: targetState.y,
      angle: toDeg(Math.atan2(dy, dx)),
    };

    posFinal.angle = this.nearSemicircleDeg(
      posFinal.angle ?? 0,
      startState.angle ?? 0,
    );

    const error: Pose = to_relative(posCurrent, posFinal);

    let errorAngleDeg =
      -(error.angle ?? 0) + toDeg(Math.atan2(error.y ?? 0, error.x ?? 0));

    errorAngleDeg = this.nearSemicircleDeg(errorAngleDeg, 0);

    const thetaRad = toRad(error.angle ?? 0);
    const lineErr = (error.y ?? 0) + (error.x ?? 0) * Math.tan(thetaRad);

    let correction =
      Math.abs(lineErr) > Math.abs(this.maxError)
        ? this.kCorrection * toRad(errorAngleDeg)
        : 0.0;

    if (powers[0] < 0) correction = -correction;

    if (correction > 0) return [powers[0], powers[1] * Math.exp(-correction)];
    if (correction < 0) return [powers[0] * Math.exp(correction), powers[1]];
    return powers;
  }
}