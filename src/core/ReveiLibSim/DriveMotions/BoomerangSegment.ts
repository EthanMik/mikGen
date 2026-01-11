import type { Robot } from "../../Robot";
import type { Pose, PoseState } from "../../Types/Pose";
import { toRad } from "../../Util";
import { getConstantMotionPower } from "../ConstantMotion";
import type { ReveilLibConstants } from "../RevConstants";
import { PilonsCorrection } from "../PilonsCorrection";
import { SimpleStop, type StopState } from "../SimpleStop";
import { dist } from "../Util";

type boomerangStatus = "DRIVE" | "BRAKE" | "EXIT";

let boomerangStartPoint: Pose | null = null;
let boomerangDirection: number = 1;

let boomerangClose: boolean = false;
let boomerangCarrot: Pose;

let boomerangLastStatus: boomerangStatus = "DRIVE";

let stop: SimpleStop | null = null;
let brakeElapsed: number | null = null;

function cleanupBoomerangSegment() {
    boomerangLastStatus = "DRIVE";
    boomerangDirection = 1;
    boomerangClose = false;
    boomerangStartPoint = null;
    brakeElapsed = null;
    stop?.reset();
    stop = null;
}

export function boomerangSegment(robot: Robot, dt: number, x: number, y: number, angle: number, constants: ReveilLibConstants) : boolean {                                                
    const dropEarly = constants.dropEarly ?? 0;
    const speed = constants.maxSpeed ?? 0;
    const correction = new PilonsCorrection(constants.kCorrection ?? 0, constants.maxError ?? 0);
    const lead = constants.lead ?? 0;

    // Initialize values
    if (stop === null) {
        stop = new SimpleStop(constants.stopHarshThreshold ?? 0, constants.stopCoastThreshold ?? 0, constants.stopCoastPower ?? 0, constants.stopTimeout);
    }

    if (boomerangStartPoint === null) {
        boomerangStartPoint = { x: robot.getX(), y: robot.getY(), angle: robot.getAngle() };
        const xFacing = Math.sin(toRad(robot.getAngle()));
        const yFacing = Math.cos(toRad(robot.getAngle()));
    
        const initialLongDistance = xFacing * (x - robot.getX()) + yFacing * (y - robot.getY());
    
        if (initialLongDistance < 0) boomerangDirection = -1;
    }

    const currentState: PoseState = { x: robot.getX(), y: robot.getY(), angle: robot.getAngle(), xVel: robot.getXVelocity(), yVel: robot.getYVelocity() };
    const currentPose: Pose = { x: robot.getX(), y: robot.getY(), angle: robot.getAngle() };
    const targetPoint: Pose = { x: x, y: y, angle: angle };
    const startPoint = { ...boomerangStartPoint };

    const currentD = dist(robot.getX(), robot.getY(), x, y)

    let newState: StopState;

    if (boomerangClose) {
        newState = stop.getStopState(currentState, targetPoint, boomerangCarrot, dropEarly)
    } else {
        newState = "GO";

        if (Math.abs(currentD) < 7.5) {
            boomerangClose = true;
            boomerangCarrot = { ...currentPose };
        }
    }

    console.log(newState)
    

    const carrotX = x - boomerangDirection * lead * currentD * Math.sin(toRad(angle));
    const carrotY = y - boomerangDirection * lead * currentD * Math.cos(toRad(angle));

    const carrotPoint: Pose = { x: carrotX, y: carrotY, angle: 0 };

    if (boomerangLastStatus == "EXIT" || newState == "EXIT") {
        robot.tankDrive(0, 0, dt);
        cleanupBoomerangSegment();
        return true;
    }

    if (boomerangLastStatus === "BRAKE" || newState === "BRAKE") {
        if (brakeElapsed === null) brakeElapsed = 0;
        brakeElapsed += dt;

        robot.tankDrive(0, 0, dt);
        boomerangLastStatus = "BRAKE";

        if ((brakeElapsed * 1000) >= (constants.brakeTime ?? 0)) {
            cleanupBoomerangSegment();
            brakeElapsed = null;
            return true;
        }
        return false;
    }

    const pows: [number, number] = getConstantMotionPower(speed, startPoint, carrotPoint);

    if (newState == "COAST") {
        let power = stop.getCoastPower();
        const left = pows[0];
        const right = pows[1];

        if (left + right < 0) power *= -1;

        boomerangLastStatus = "DRIVE";
        robot.tankDrive(power, power, dt);
        return false;
    }

    const correctedPows = correction.applyCorrection(currentState, carrotPoint, startPoint, pows);

    boomerangLastStatus = "DRIVE";
    robot.tankDrive(correctedPows[0], correctedPows[1], dt);
    return false;
}