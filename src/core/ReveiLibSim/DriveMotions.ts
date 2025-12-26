import type { Robot } from "../Robot";
import type { Pose, PoseState } from "../Types/Pose";
import { getConstantMotionPower } from "./ConstantMotion";
import type { PilonsCorrection } from "./PilonsCorrection";
import type { SimpleStop, StopState } from "./SimpleStop";

type SegmentStatus = "DRIVE" | "BRAKE" | "EXIT";

let pilonsSegmentStartPoint: Pose | null = null;
let pilonsSegmentLastStatus: SegmentStatus = "DRIVE";

export function pilonsSegment(robot: Robot, dt: number, speed: number, correction: PilonsCorrection, stop: SimpleStop, x: number, y: number, angle: number, dropEarly: number) : boolean {                                                
    if (pilonsSegmentStartPoint === null) {
        pilonsSegmentStartPoint = { x: robot.getX(), y: robot.getY(), angle: robot.getAngle() };
        pilonsSegmentLastStatus = "DRIVE";
    }

    const currentState: PoseState = { x: robot.getX(), y: robot.getY(), angle: robot.getAngle(), xVel: robot.getXVelocity(), yVel: robot.getYVelocity() } 
    const targetPoint: Pose = { x: x, y: y, angle: angle };
    const newState: StopState = stop.getStopState(currentState, targetPoint, pilonsSegmentStartPoint, dropEarly)

    const startPoint = { ...pilonsSegmentStartPoint };
    // if (pilonsSegmentLastStatus == "EXIT" || newState == "EXIT") {
    //     pilonsSegmentLastStatus = "EXIT";
    //     pilonsSegmentStartPoint = null;
    //     robot.tankDrive(0, 0, dt);
    //     return true;
    // }

    // if (pilonsSegmentLastStatus == "BRAKE" || newState == "BRAKE") {
    //     pilonsSegmentLastStatus = "BRAKE";
    //     robot.tankDrive(0, 0, dt);
    //     return false;
    // }

    const pows: [number, number] = getConstantMotionPower(speed, currentState, targetPoint);

    // if (newState == "COAST") {
    //     let power = stop.getCoastPower();
    //     const left = pows[0];
    //     const right = pows[1];

    //     if (left + right < 0) power *= -1;

    //     pilonsSegmentLastStatus = "DRIVE";
    //     robot.tankDrive(power, power, dt);
    //     return false;
    // }

    const correctedPows = correction.applyCorrection(currentState, targetPoint, startPoint, pows);
    if (correctedPows[0] < 0.6 || correctedPows[1] < 0.6) {
        console.log(correctedPows);
    } 
    pilonsSegmentLastStatus = "DRIVE";
    robot.tankDrive(correctedPows[0], correctedPows[1], dt);
    // robot.tankDrive(.6, .6, dt);
    return false;
}