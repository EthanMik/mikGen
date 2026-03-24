import {
  boomerangSegment,
  cleanupBoomerangSegment,
} from "../core/ReveiLibSim/DriveMotions/BoomerangSegment";
import { cleanUplookAt, lookAt } from "../core/ReveiLibSim/DriveMotions/LookAt";
import {
  cleanupPilonsSegment,
  pilonsSegment,
} from "../core/ReveiLibSim/DriveMotions/PilonsSegment";
import {
  cleanupTurnSegment,
  turnSegment,
} from "../core/ReveiLibSim/DriveMotions/TurnSegment";
import { cloneKRev, type revDriveConstants, type revTurnConstants } from "../core/ReveiLibSim/RevConstants";
import { wrapDeg180 } from "../core/ReveiLibSim/Util";
import type { SegmentKind } from "../core/Types/Segment";
import type { Robot } from "../core/Robot";
import { toDeg } from "../core/Util";
import type { Coordinate } from "../core/Types/Coordinate";
import {
  getBackwardsSnapPose,
  getForwardSnapPose,
  type Path,
} from "../core/Types/Path";

export function reveilLibToSim(path: Path) {
  const auton: ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] = [];

  for (let idx = 0; idx < path.segments.length; idx++) {
    const control = path.segments[idx];
    const x = control.pose.x ?? 0;
    const y = control.pose.y ?? 0;
    const angle = control.pose.angle ?? 0;

    if (idx === 0) {
      auton.push((robot: Robot, dt: number): [boolean, SegmentKind, number] => {
        return [robot.setPose(x, y, angle), "start", 0];
      });
      continue;
    }

    if (control.kind === "pointDrive") {
      const kPilon = cloneKRev((control.constants as revDriveConstants).drive);
      cleanupPilonsSegment();
      let started = false;
      let targetDist = 0;
      auton.push((robot: Robot, dt: number): [boolean, SegmentKind, number] => {
        if (!started) {
          targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
          started = true;
        }
        return [pilonsSegment(robot, dt, x, y, kPilon), "pointDrive", targetDist];
      });
    }

    if (control.kind === "poseDrive") {
      const kBoomerang = cloneKRev((control.constants as revDriveConstants).drive);
      cleanupBoomerangSegment();
      let started = false;
      let targetDist = 0;
      auton.push((robot: Robot, dt: number): [boolean, SegmentKind, number] => {
        if (!started) {
          targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
          started = true;
        }
        return [boomerangSegment(robot, dt, x, y, angle, kBoomerang), "poseDrive", targetDist];
      });
    }

    if (control.kind === "pointTurn" || control.kind === "pointSwing") {
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);

      const pos: Coordinate = turnToPos
        ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
        : previousPos
          ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
          : { x: 0, y: 5 };

      const kLook = cloneKRev((control.constants as revTurnConstants).turn);
      const kind = control.kind;
      cleanUplookAt();
      let started = false;
      let targetDist = 0;
      auton.push((robot: Robot, dt: number): [boolean, SegmentKind, number] => {
        if (!started) {
          const targetAngle = wrapDeg180(toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle);
          targetDist = Math.abs(wrapDeg180(targetAngle - robot.getAngle()));
          started = true;
        }
        return [lookAt(robot, dt, pos.x, pos.y, angle ?? 0, kLook), kind, targetDist];
      });
    }

    if (control.kind === "angleTurn" || control.kind === "pointSwing") {
      const kTurn = cloneKRev((control.constants as revTurnConstants).turn);
      const kind = control.kind;
      cleanupTurnSegment();
      let started = false;
      let targetDist = 0;
      auton.push((robot: Robot, dt: number): [boolean, SegmentKind, number] => {
        if (!started) {
          targetDist = Math.abs(wrapDeg180(angle - robot.getAngle()));
          started = true;
        }
        return [turnSegment(robot, dt, angle, kTurn), kind, targetDist];
      });
    }
  }

  return auton;
}
