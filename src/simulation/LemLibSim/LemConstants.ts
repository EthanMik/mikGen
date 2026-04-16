import { forSegments, type FormatDef, type SegmentDef } from "../FormatDefinition";
import type { DriveDirection, SwingDirection, TurnDirection } from "../mikLibSim/MikConstants";
import { moveToPose } from "./DriveMotions/MoveToPose";

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

    forwards: DriveDirection,
    direction: TurnDirection | null,
    lockedSide: SwingDirection,
}

export const kLemLinear: LemConstants = {
    maxSpeed: 127,
    minSpeed: 0,
    lead: 0.6,
    forwards: "forward",
    direction: null,
    lockedSide: "left",
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
    forwards: "forward",
    direction: null,
    lockedSide: "left",
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

const LemLibDef = {
    constants: [kLemLinear],
    kMaxSpeed: 127,
    formatPathName: "LemLib Path",

    segments: {
        start: {
            name: "Start",
            initialDefaults: [kLemLinear],
            toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "start", 0];
            },
        },      
        poseDrive: {
            name: "Move to Pose",
            initialDefaults: [kLemLinear],
            toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "poseDrive", 0];
            },
        },
        ...forSegments(["distanceDrive", "pointDrive"], {
            name: "Move to Point",
            initialDefaults: [kLemLinear],
            toStringTemplate: "chassis.moveToPoint(${x}, ${y}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "pointDrive", 0];
            },
        }),
        pointTurn: {
            name: "Turn to Point",
            initialDefaults: [kLemAngular],
            toStringTemplate: "chassis.turnToPoint(${x}, ${y}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "pointTurn", 0];
            },
        },
        angleTurn: {
            name: "Turn to Angle",
            initialDefaults: [kLemAngular],
            toStringTemplate: "chassis.turnToHeading(${angle}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "angleTurn", 0];
            },
        },
        angleSwing: {
            name: "Swing to Angle",
            initialDefaults: [kLemAngular],
            toStringTemplate: "chassis.swingToHeading(${angle}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "angleSwing", 0];
            },
        },
        pointSwing: {
            name: "Swing to Point",
            initialDefaults: [kLemAngular],
            toStringTemplate: "chassis.swingToPoint(${x}, ${y}, ${timeout})",
            toSim: (x, y, angle, constants) => {
                return (robot, dt) => [false, "pointSwing", 0];
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
        constants: [kLemLinear]
    }
} satisfies FormatDef<"LemLib">;
