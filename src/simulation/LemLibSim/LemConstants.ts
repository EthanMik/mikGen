import { getUnequalKeys, roundOff } from "../../core/Util";
import { forSegments, type FormatDef } from "../FormatDefinition";
import { moveToPoint } from "./DriveMotions/MoveToPoint";
import { moveToPose } from "./DriveMotions/MoveToPose";
import { swingToHeading } from "./DriveMotions/SwingToHeading";
import { swingToPoint } from "./DriveMotions/SwingToPoint";
import { turnToHeading } from "./DriveMotions/TurnToHeading";
import { turnToPoint } from "./DriveMotions/TurnToPoint";

export interface LemConstants {
    horizontalDrift: number,
    kp: number,
    ki: number,
    kd: number,
    antiWindup: number,
    smallError: number,
    smallErrorTimeout: number,
    largeError: number,
    largeErrorTimeout: number,
    slew: number,
    timeout: number,

    maxSpeed: number,
    minSpeed: number,

    lead: number,
    earlyExitRange: number

    forwards: boolean,
    direction: "AngularDirection::AUTO" | "AngularDirection::CW_CLOCKWISE" | "AngularDirection::CCW_COUNTERCLOCKWISE",
    lockedSide: "DriveSide::LEFT" | "DriveSide::RIGHT",
}

export const kLemLinear: LemConstants = {
    maxSpeed: 127,
    minSpeed: 0,
    lead: 0.6,
    forwards: true,
    direction: "AngularDirection::AUTO",
    lockedSide: "DriveSide::LEFT",
    earlyExitRange: 0,
    timeout: 5000,
    horizontalDrift: 2,

    kp: 10,
    ki: 0,
    kd: 3,
    antiWindup: 3,
    smallError: 1,
    smallErrorTimeout: 100,
    largeError: 5,
    largeErrorTimeout: 500,
    slew: 20
}

export const kLemAngular: LemConstants = {
    maxSpeed: 127,
    minSpeed: 0,
    lead: 0.6,
    forwards: true,
    direction: "AngularDirection::AUTO",
    lockedSide: "DriveSide::LEFT",
    earlyExitRange: 0,
    timeout: 5000,
    horizontalDrift: 2,

    kp: 2,
    ki: 0,
    kd: 10,
    antiWindup: 3,
    smallError: 1,
    smallErrorTimeout: 100,
    largeError: 5,
    largeErrorTimeout: 500,
    slew: 0  
}

export const LemLibDef = {
    constants: [kLemLinear],
    kMaxSpeed: 127,
    formatPathName: "LemLib Path",
    kBuilder: kLemBuilder,

    segments: {
        start: {
            name: "Start",
            defaults: [kLemLinear],
            toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout}, ${kBuilder})",
            simFn: (robot, _dt, x, y, angle) => {
                return robot.setPose(x, y, angle);
            },
        },      
        poseDrive: {
            name: "Move to Pose",
            defaults: [kLemLinear, kLemAngular],
            toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout}, ${kBuilder})",
            simFn: (robot, dt, x, y, angle, constants) => {
                return moveToPose(robot, dt, x, y, angle, constants);
            },
        },
        ...forSegments(["distanceDrive", "pointDrive"], {
            name: "Move to Point",
            defaults: [kLemLinear, kLemAngular],
            toStringTemplate: "chassis.moveToPoint(${x}, ${y}, ${timeout}, ${kBuilder})",
            simFn: (robot, dt, x, y, _angle, constants) => {
                return moveToPoint(robot, dt, x, y, constants);
            },
        }),
        pointTurn: {
            name: "Turn to Point",
            defaults: [kLemAngular],
            toStringTemplate: "chassis.turnToPoint(${x}, ${y}, ${timeout}, ${kBuilder})",
            simFn: (robot, dt, x, y, angle, constants) => {
                return turnToPoint(robot, dt, x, y, angle, constants);
            },
        },
        angleTurn: {
            name: "Turn to Angle",
            defaults: [kLemAngular],
            toStringTemplate: "chassis.turnToHeading(${angle}, ${timeout}, ${kBuilder})",
            simFn: (robot, dt, _x, _y, angle, constants) => {
                return turnToHeading(robot, dt, angle, constants);
            },
        },
        angleSwing: {
            name: "Swing to Angle",
            defaults: [kLemAngular],
            toStringTemplate: "chassis.swingToHeading(${angle}, ${lockedSide}, ${timeout}, ${kBuilder})",
            simFn: (robot, dt, _x, _y, angle, constants) => {
                return swingToHeading(robot, dt, angle, constants);
            },
        },
        pointSwing: {
            name: "Swing to Point",
            defaults: [kLemAngular],
            toStringTemplate: "chassis.swingToPoint(${x}, ${y}, ${lockedSide}, ${timeout}, ${kBuilder})",
            simFn: (robot, dt, x, y, angle, constants) => {
                return swingToPoint(robot, dt, x, y, angle, constants);
            },
        },
    },
    motionListFields: {
        slider: {
            key: "maxSpeed",
            bounds: [0, 127],
            roundTo: 1
        },
        cycleButtons: [],
        numberInputs: [],
        constants: [kLemLinear],
    }
} satisfies FormatDef<"LemLib">;

function kLemBuilder(kDefault: LemConstants[], constants: LemConstants[]): string {
    const keyToLemConstant = (key: keyof LemConstants, value: LemConstants[keyof LemConstants]): string => {
        switch (key) {
            case "forwards": return `.forwards = ${value}`;
            case "direction": return `.direction = ${value}`;
            case "horizontalDrift": return `.horizontalDrift = ${roundOff(value as number, 1)}`; 
            case "lead": return `.lead = ${roundOff(value as number, 2)}`; 
            case "maxSpeed": return `.maxSpeed = ${roundOff(value as number, 0)}`; 
            case "minSpeed": return `.minSpeed = ${roundOff(value as number, 0)}`; 
            case "earlyExitRange": return `.earlyExitRange = ${roundOff(value as number, 1)}`; 
        }
        return ""
    }

    const kUnequal = getUnequalKeys(kDefault[0], constants[0]);
    if (kUnequal === undefined) return "";

    const constantsList: string[] = [];
    for (const k of Object.keys(kUnequal)) {        
        const value = kUnequal[k as keyof LemConstants];
        if (value === undefined) continue;
        const c = keyToLemConstant(k as keyof LemConstants, value);
        if (c !== "") constantsList.push(c);
    }
    return constantsList.map((c) => ` ${c}`).join(", ");
}