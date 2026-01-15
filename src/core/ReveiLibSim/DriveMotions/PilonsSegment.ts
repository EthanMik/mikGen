import type { Robot } from "../../Robot";
import type { Pose, PoseState } from "../../Types/Pose";
import { getConstantMotionPower } from "../ConstantMotion";
import type { ReveilLibConstants } from "../RevConstants";
import { PilonsCorrection } from "../PilonsCorrection";
import { SimpleStop, type StopState } from "../SimpleStop";
import { toRevCoordinate, toRevVelocity, wrapDeg180 } from "../Util";

type PilonSegmentStatus = "DRIVE" | "BRAKE" | "EXIT";

let pilonsSegmentStartPoint: Pose | null = null;
let pilonsSegmentLastStatus: PilonSegmentStatus = "DRIVE";
let stop: SimpleStop | null = null;
let brakeElapsed: number | null = null;

export function cleanupPilonsSegment() {
    pilonsSegmentLastStatus = "DRIVE";
    pilonsSegmentStartPoint = null;
    brakeElapsed = null;
    stop?.reset();
    stop = null;
}

export function pilonsSegment(robot: Robot, dt: number, x: number, y: number, constants: ReveilLibConstants) : boolean {             
    // Convert to rev coords
    const revCoords = toRevCoordinate(x, y);
    x = revCoords.x;
    y = revCoords.y;

    const dropEarly = constants.dropEarly ?? 0;
    const speed = constants.maxSpeed ?? 0;
    
    const correction = new PilonsCorrection(constants.kCorrection ?? 0, constants.maxError ?? 0);

    if (stop === null) {
        stop = new SimpleStop(constants.stopHarshThreshold ?? 0, constants.stopCoastThreshold ?? 0, constants.stopCoastPower ?? 0, constants.stopTimeout);
    }

    if (pilonsSegmentStartPoint === null) {
        const revRobotPos = toRevCoordinate(robot.getX(), robot.getY());
        pilonsSegmentStartPoint = { x: revRobotPos.x, y: revRobotPos.y, angle: wrapDeg180(robot.getAngle()) };
    }

    const revRobotPos = toRevCoordinate(robot.getX(), robot.getY());
    const revRobotVel = toRevVelocity(robot.getXVelocity(), robot.getYVelocity());

    const currentState: PoseState = { x: revRobotPos.x, y: revRobotPos.y, angle: wrapDeg180(robot.getAngle()), xVel: revRobotVel.xVel, yVel: revRobotVel.yVel } 
    const targetPoint: Pose = { x: x, y: y, angle: 0 };
    const startPoint = { ...pilonsSegmentStartPoint };
    const newState: StopState = stop.getStopState(currentState, targetPoint, startPoint, dropEarly)

    if (pilonsSegmentLastStatus == "EXIT" || newState == "EXIT") {
        robot.tankDrive(0, 0, dt);
        cleanupPilonsSegment();
        // console.log("BREAK")
        return true;
    }

    if (pilonsSegmentLastStatus === "BRAKE" || newState === "BRAKE") {
        if (brakeElapsed === null) brakeElapsed = 0;
        brakeElapsed += dt;

        robot.tankDrive(0, 0, dt);
        pilonsSegmentLastStatus = "BRAKE";

        if ((brakeElapsed * 1000) >= (constants.brakeTime ?? 0)) {
            cleanupPilonsSegment();
            // console.log("BREAK")
            return true;
        }
        return false;
    }

    const pows: [number, number] = getConstantMotionPower(speed, startPoint, targetPoint);

    if (newState == "COAST") {
        let power = stop.getCoastPower();
        const left = pows[0];
        const right = pows[1];

        if (left + right < 0) power *= -1;

        pilonsSegmentLastStatus = "DRIVE";
        robot.tankDrive(power, power, dt);
        return false;
    }

    const correctedPows = correction.applyCorrection(currentState, targetPoint, startPoint, pows);

    pilonsSegmentLastStatus = "DRIVE";
    robot.tankDrive(correctedPows[0], correctedPows[1], dt);
    return false;
}