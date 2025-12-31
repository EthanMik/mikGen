import type { Robot } from "../../Robot";
import type { ReveilLibConstants } from "../Constants";
import { copysign1, wrapDeg180 } from "../Util";

type TurnState = "FULLPOWER" | "COAST" | "BRAKE";

type TurnSegmentValues = {
  angleGoal: number;
  startAngle: number;
  targetRelativeOriginal: number;
  leftDirection: number;
  rightDirection: number;
  brakeElapsed: number | null;
  status: TurnState;
};

const initTurnSegment = (startAngle: number, angleGoal: number): TurnSegmentValues => {
  const startDeg = wrapDeg180(startAngle);
  const goalDeg  = wrapDeg180(angleGoal);

  const angleDiff = goalDeg - startAngle;
  const targetRelO = wrapDeg180(angleDiff);

  const leftDir  = targetRelO < 0 ? -1 : 1;
  const rightDir = targetRelO < 0 ?  1 : -1;

  return {
    angleGoal: goalDeg,
    startAngle: startDeg,
    targetRelativeOriginal: targetRelO,
    leftDirection: leftDir,
    rightDirection: rightDir,
    brakeElapsed: null,
    status: "FULLPOWER",
  };
};

let turnSegmentValues: TurnSegmentValues | undefined;

export function turnSegment(robot: Robot, dt: number, angle: number, constants: ReveilLibConstants) {
  if (!turnSegmentValues) turnSegmentValues = initTurnSegment(robot.getAngle(), angle);
  const t = turnSegmentValues;

  const theta = wrapDeg180(robot.getAngle());
  const angleDiff = t.angleGoal - theta;
  const targetRel = wrapDeg180(angleDiff);

  if (Math.abs(t.targetRelativeOriginal) < 5) {
    robot.tankDrive(0, 0, dt);
    turnSegmentValues = undefined;
    return true;
  }

  if (copysign1(targetRel) !== copysign1(t.targetRelativeOriginal)) {
    robot.tankDrive(0, 0, dt);
    turnSegmentValues = undefined;
    return true;
  }

  const angVel = Math.abs(robot.getAngularVelocity());

  const coastCoeffSec = (constants.stopCoastThreshold ?? 0) / 1000;
  const harshCoeffSec = (constants.stopHarshThreshold ?? 0) / 1000;

  if (
    Math.abs(targetRel) <= Math.abs(angVel * coastCoeffSec) &&
    t.status !== "BRAKE" &&
    t.status !== "COAST"
  ) {
    t.status = "COAST";
  }

  if (
    Math.abs(targetRel) < Math.abs(angVel * harshCoeffSec) &&
    t.status !== "BRAKE"
  ) {
    t.status = "BRAKE";
  }

  switch (t.status) {
    case "COAST": {
      const coastPower = constants.stopCoastPower ?? 0;
      robot.tankDrive(t.leftDirection * coastPower, t.rightDirection * coastPower, dt);
      return false;
    }

    case "BRAKE": {
      const brakeTime = constants.brakeTime ?? 0;

      if (t.brakeElapsed === null) {
        t.brakeElapsed = 0;
      } else if ((t.brakeElapsed * 1000) > brakeTime || angVel <= 0.25) {
        robot.tankDrive(0, 0, dt);
        turnSegmentValues = undefined;
        return true;
      }

      t.brakeElapsed += dt;

      robot.tankDrive(0, 0, dt);
      return false;
    }

    case "FULLPOWER":
    default: {
      const speed = constants.maxSpeed ?? 0;
      robot.tankDrive(speed * t.leftDirection, speed * t.rightDirection, dt);
      return false;
    }
  }
}