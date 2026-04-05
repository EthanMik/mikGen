// import { roundOff } from "../core/Util";
// import type { Format } from "../hooks/useFormat";
// import { type SegmentKind } from "./InitialDefaults";
// import type { LemConstants, LemAngularConstants, LemMoveConstants } from "./LemLibSim/LemConstants";
// import { moveToPoint, resetMoveToPoint } from "./LemLibSim/DriveMotions/MoveToPoint";
// import { moveToPose, resetMoveToPose } from "./LemLibSim/DriveMotions/MoveToPose";
// import { turnToPoint, resetTurnToPoint } from "./LemLibSim/DriveMotions/TurnToPoint";
// import { turnToHeading, resetTurnToHeading } from "./LemLibSim/DriveMotions/TurnToHeading";
// import { swingToPoint, resetSwingToPoint } from "./LemLibSim/DriveMotions/SwingToPoint";
// import { swingToHeading, resetSwingToHeading } from "./LemLibSim/DriveMotions/SwingToHeading";
// import type { mikConstants } from "./mikLibSim/MikConstants";
// import type { ReveilLibConstants } from "./ReveiLibSim/RevConstants";
// import type { RevMecanumConstants, TurnDirection } from "./RevMecanumSim/RevMecanumConstant";
// import type { Robot } from "../core/Robot";
// import { toDeg } from "../core/Util";
// import { angle_error } from "./mikLibSim/Util";
// import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";

// type FormatSpecificConstants = {
//     mikLib: mikConstants;
//     ReveilLib: ReveilLibConstants;
//     "JAR-Template": mikConstants;
//     LemLib: LemConstants;
//     RevMecanum: RevMecanumConstants;
//     "RW-Template": mikConstants;
// }

// export type SimFn = (robot: Robot, dt: number) => [boolean, SegmentKind, number];

// export type SimFactory<C> = (
//     x: number,
//     y: number,
//     angle: number,
//     constants: C,
//     path: Path,
//     idx: number,
// ) => SimFn;

// interface FormatKeyToString<F extends Format = Format> {
//     kind: SegmentKind;
//     toStringTemplate: string;
//     toSimFactory: SimFactory<FormatSpecificConstants[F]>;
//     kBuilder: (constants: Partial<FormatSpecificConstants[F]>) => string;
// }

// const LemLibStringFromKeyBuilder = (constants: Partial<LemConstants>): string => {
//     const LemLibKeyMap = (key: string, value: LemConstants[keyof LemConstants]) => {
//         switch (key) {
//             case "forwards": return value === "forward" ? ".forwards = true" : ".forwards = false";
//             case "direction": {
//                 switch (value as TurnDirection) {
//                     case "clockwise": return ".direction = AngularDirection::CW_CLOCKWISE";
//                     case "counterclockwise": return ".direction = AngularDirection::CCW_COUNTERCLOCKWISE";
//                 }
//                 return "";
//             }
//             case "horizontalDrift": return `.horizontalDrift = ${roundOff(value, 1)}`;
//             case "lead": return `.lead = ${roundOff(value, 2)}`;
//             case "maxSpeed": return `.maxSpeed = ${roundOff(value, 0)}`;
//             case "minSpeed": return `.minSpeed = ${roundOff(value, 0)}`;
//             case "earlyExitRange": return `.earlyExitRange = ${roundOff(value, 1)}`;
//         }
//         return "";
//     }

//     const constantsList: string[] = [];
//     for (const k of Object.keys(constants)) {
//         const value = constants[k as keyof LemConstants];
//         if (value === undefined) continue;
//         const c = LemLibKeyMap(k, value);
//         if (c !== "") constantsList.push(c);
//     }
//     return constantsList.map((c) => ` ${c}`).join(", ");
// }

// export const LemLibFormatDef: FormatKeyToString<"LemLib">[] = [
//     {
//         kind: "pointDrive",
//         toStringTemplate: "chassis.moveToPoint(${x}, ${y}, ${timeout}${kBuilder?})",
//         toSimFactory: (x, y, _angle, constants, _path, _idx) => {
//             let started = false;
//             let targetDist = 0;
//             resetMoveToPoint();
//             return (robot, dt) => {
//                 if (!started) {
//                     targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
//                     started = true;
//                 }
//                 const output = moveToPoint(robot, dt, x, y, constants as LemMoveConstants);
//                 return [output, "pointDrive", targetDist];
//             };
//         },
//         kBuilder: (k) => LemLibStringFromKeyBuilder(k as Partial<LemConstants>),
//     },
//     {
//         kind: "poseDrive",
//         toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout}${kBuilder?})",
//         toSimFactory: (x, y, angle, constants, _path, _idx) => {
//             let started = false;
//             let targetDist = 0;
//             resetMoveToPose();
//             return (robot, dt) => {
//                 if (!started) {
//                     targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
//                     started = true;
//                 }
//                 const output = moveToPose(robot, dt, x, y, angle, constants as LemMoveConstants);
//                 return [output, "poseDrive", targetDist];
//             };
//         },
//         kBuilder: (k) => LemLibStringFromKeyBuilder(k as Partial<LemConstants>),
//     },
//     {
//         kind: "pointTurn",
//         toStringTemplate: "chassis.turnToPoint(${x}, ${y}, ${timeout}${kBuilder?})",
//         toSimFactory: (x, y, angle, constants, path, idx) => {
//             const previousPos = getBackwardsSnapPose(path, idx - 1);
//             const turnToPos = getForwardSnapPose(path, idx);
//             const pos = turnToPos
//                 ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
//                 : previousPos
//                 ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
//                 : { x: 0, y: 5 };
//             let started = false;
//             let targetDist = 0;
//             resetTurnToPoint();
//             return (robot, dt) => {
//                 if (!started) {
//                     const targetAngle = toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle;
//                     targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
//                     started = true;
//                 }
//                 const output = turnToPoint(robot, dt, pos.x, pos.y, angle, constants as LemAngularConstants);
//                 return [output, "pointTurn", targetDist];
//             };
//         },
//         kBuilder: (k) => LemLibStringFromKeyBuilder(k as Partial<LemConstants>),
//     },
//     {
//         kind: "angleTurn",
//         toStringTemplate: "chassis.turnToHeading(${angle}, ${timeout}${kBuilder?})",
//         toSimFactory: (_x, _y, angle, constants, _path, _idx) => {
//             let started = false;
//             let targetDist = 0;
//             resetTurnToHeading();
//             return (robot, dt) => {
//                 if (!started) {
//                     targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
//                     started = true;
//                 }
//                 const output = turnToHeading(robot, dt, angle, constants as LemAngularConstants);
//                 return [output, "angleTurn", targetDist];
//             };
//         },
//         kBuilder: (k) => LemLibStringFromKeyBuilder(k as Partial<LemConstants>),
//     },
//     {
//         kind: "pointSwing",
//         toStringTemplate: "chassis.swingToPoint(${x}, ${y}, ${side}, ${timeout}${kBuilder?})",
//         toSimFactory: (x, y, angle, constants, path, idx) => {
//             const previousPos = getBackwardsSnapPose(path, idx - 1);
//             const turnToPos = getForwardSnapPose(path, idx);
//             const pos = turnToPos
//                 ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
//                 : previousPos
//                 ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
//                 : { x: 0, y: 5 };
//             let started = false;
//             let targetDist = 0;
//             resetSwingToPoint();
//             return (robot, dt) => {
//                 if (!started) {
//                     const targetAngle = toDeg(Math.atan2(pos.x - robot.getX(), pos.y - robot.getY())) + angle;
//                     targetDist = Math.abs(angle_error(targetAngle - robot.getAngle(), null)!);
//                     started = true;
//                 }
//                 const output = swingToPoint(robot, dt, pos.x, pos.y, angle, constants as LemAngularConstants);
//                 return [output, "pointSwing", targetDist];
//             };
//         },
//         kBuilder: (k) => LemLibStringFromKeyBuilder(k as Partial<LemConstants>),
//     },
//     {
//         kind: "angleSwing",
//         toStringTemplate: "chassis.swingToHeading(${angle}, ${side}, ${timeout}${kBuilder?})",
//         toSimFactory: (_x, _y, angle, constants, _path, _idx) => {
//             let started = false;
//             let targetDist = 0;
//             resetSwingToHeading();
//             return (robot, dt) => {
//                 if (!started) {
//                     targetDist = Math.abs(angle_error(angle - robot.getAngle(), null)!);
//                     started = true;
//                 }
//                 const output = swingToHeading(robot, dt, angle, constants as LemAngularConstants);
//                 return [output, "angleSwing", targetDist];
//             };
//         },
//         kBuilder: (k) => LemLibStringFromKeyBuilder(k as Partial<LemConstants>),
//     },
// ];
