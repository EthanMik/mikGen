import { getUnequalKeys, roundOff } from "../../core/Util";
import { type FormatDef, type NumberInputGroup, type CycleButtonField, type SegmentKind } from "../FormatDefinition";
import type { Pose } from "../../core/Types/Pose";
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import cwccw from "../../assets/cwwcw.svg";
import fwd from "../../assets/fwd.svg";
import rev from "../../assets/reverse.svg";
import leftswing from "../../assets/leftswing.svg";
import rightswing from "../../assets/rightswing.svg";
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

type Fields = NumberInputGroup<"LemLib">["fields"];

const motionSettingsFields: Fields = [
    { key: "maxSpeed", label: "Max Speed", units: "", input: { bounds: [0, 127], stepSize: 10, roundTo: 0 } },
    { key: "minSpeed", label: "Min Speed", units: "", input: { bounds: [0, 127], stepSize: 10, roundTo: 0 } },
    { key: "timeout",  label: "Timeout",   units: "ms", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
    { key: "earlyExitRange", label: "Early Exit", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
];

const lateralSettingsFields: Fields = [
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "antiWindup", label: "Anti Windup", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
    { key: "smallError", label: "Small Error", units: "in", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
    { key: "smallErrorTimeout", label: "Sml Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "largeError", label: "Large Error", units: "in", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
    { key: "largeErrorTimeout", label: "Lge Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "slew", label: "Slew", units: "", input: { bounds: [0, 127], stepSize: 1, roundTo: 1 } },
];

const angularSettingsFields: Fields = [
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "antiWindup", label: "Anti Windup", units: "deg", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
    { key: "smallError", label: "Small Error", units: "in", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
    { key: "smallErrorTimeout", label: "Sml Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "largeError", label: "Large Error", units: "in", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 2 } },
    { key: "largeErrorTimeout", label: "Lge Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "slew", label: "Slew", units: "", input: { bounds: [0, 127], stepSize: 1, roundTo: 1 } },
];

type CycleButton = Omit<CycleButtonField<"LemLib">, "constantsIdx">;

const forwardsButton: CycleButton = {
    key: "forwards",
    keyValues: [
        { srcImg: fwd, value: true },
        { srcImg: rev, value: false },
    ],
};

const directionButton: CycleButton = {
    key: "direction",
    keyValues: [
        { srcImg: cw,    value: "AngularDirection::CW_CLOCKWISE" },
        { srcImg: ccw,   value: "AngularDirection::CCW_COUNTERCLOCKWISE" },
        { srcImg: cwccw, value: "AngularDirection::AUTO" },
    ],
};

const lockedSideButton: CycleButton = {
    key: "lockedSide",
    keyValues: [
        { srcImg: rightswing, value: "DriveSide::RIGHT" },
        { srcImg: leftswing,  value: "DriveSide::LEFT" },
    ],
};

export const LemLibDef = {
    constants: [kLemLinear],
    kMaxSpeed: 127,
    formatPathName: "LemLib Path",
    kBuilder: kLemBuilder,
    kParser: kLemParser,
    slider: { key: "maxSpeed", bounds: [0, 127], roundTo: 1 },

    segments: {
        start: {
            name: "Start",
            exists: true,
            defaults: [kLemLinear],
            toStringTemplate: "chassis.setPose(${x}, ${y}, ${angle});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle ?? 0),
            cycleButtons: [],
            numberInputs: [],
        },

        poseDrive: {
            name: "Move to Pose",
            exists: true,
            defaults: [kLemLinear, kLemAngular],
            toStringTemplate: "chassis.moveToPose(${x}, ${y}, ${angle}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => moveToPose(robot, dt, x, y, angle ?? 0, constants),
            cycleButtons: [
                { constantsIdx: 0, ...forwardsButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [
                    ...motionSettingsFields,
                    { key: "horizontalDrift", label: "Drift", units: "", input: { bounds: [0, 30], stepSize: 1, roundTo: 1 } },
                    { key: "lead", label: "Lead", units: "in", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 1 } },
                ]},
                { constantsIdx: 0, headerName: "Lateral Settings", fields: [...lateralSettingsFields] },
                { constantsIdx: 1, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },

        distanceDrive: {
            name: "Move to Point",
            exists: false,
            defaults: [kLemLinear, kLemAngular],
            toStringTemplate: "chassis.moveToPoint(${x}, ${y}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => moveToPoint(robot, dt, x, y, constants),
            cycleButtons: [
                { constantsIdx: 0, ...forwardsButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...motionSettingsFields] },
                { constantsIdx: 0, headerName: "Lateral Settings", fields: [...lateralSettingsFields] },
                { constantsIdx: 1, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },

        pointDrive: {
            name: "Move to Point",
            exists: true,
            defaults: [kLemLinear, kLemAngular],
            toStringTemplate: "chassis.moveToPoint(${x}, ${y}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => moveToPoint(robot, dt, x, y, constants),
            cycleButtons: [
                { constantsIdx: 0, ...forwardsButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...motionSettingsFields] },
                { constantsIdx: 0, headerName: "Lateral Settings", fields: [...lateralSettingsFields] },
                { constantsIdx: 1, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },

        pointTurn: {
            name: "Turn to Point",
            exists: true,
            defaults: [kLemAngular],
            toStringTemplate: "chassis.turnToPoint(${x}, ${y}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => turnToPoint(robot, dt, x, y, constants),
            cycleButtons: [
                { constantsIdx: 0, ...forwardsButton, poseEffect: (val) => ({ angle: (val as boolean) ? 0 : 180 }) },
                { constantsIdx: 0, ...directionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...motionSettingsFields] },
                { constantsIdx: 0, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },

        angleTurn: {
            name: "Turn to Heading",
            exists: true,
            defaults: [kLemAngular],
            toStringTemplate: "chassis.turnToHeading(${angle}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => turnToHeading(robot, dt, angle ?? 0, constants),
            cycleButtons: [
                { constantsIdx: 0, ...directionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...motionSettingsFields] },
                { constantsIdx: 0, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },

        angleSwing: {
            name: "Swing to Angle",
            exists: true,
            defaults: [kLemAngular],
            toStringTemplate: "chassis.swingToHeading(${angle}, ${lockedSide}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => swingToHeading(robot, dt, angle ?? 0, constants),
            cycleButtons: [
                { constantsIdx: 0, ...lockedSideButton },
                { constantsIdx: 0, ...directionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...motionSettingsFields] },
                { constantsIdx: 0, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },

        pointSwing: {
            name: "Swing to Point",
            exists: true,
            defaults: [kLemAngular],
            toStringTemplate: "chassis.swingToPoint(${x}, ${y}, ${lockedSide}, ${timeout}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => swingToPoint(robot, dt, x, y, angle ?? 0, constants),
            cycleButtons: [
                { constantsIdx: 0, ...lockedSideButton },
                { constantsIdx: 0, ...directionButton },
                { constantsIdx: 0, ...forwardsButton, poseEffect: (val) => ({ angle: (val as boolean) ? 0 : 180 }) },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...motionSettingsFields] },
                { constantsIdx: 0, headerName: "Angular Settings", fields: [...angularSettingsFields] },
            ],
        },
    },
} satisfies FormatDef<"LemLib">;

function kLemBuilder(kDefault: LemConstants[], constants: LemConstants[], pose?: Pose): string {
    void pose;
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
    let i = 0;
    const constantsList: string[] = [];
    for (const k of Object.keys(kUnequal)) {
        const value = kUnequal[k as keyof LemConstants];
        if (value === undefined) continue;
        let c = keyToLemConstant(k as keyof LemConstants, value);
        if (c !== "") {
            if (i === 0) c = "{" + c;
            constantsList.push(c);
        }
        ++i;
    }
    if (constantsList.length > 0) constantsList[constantsList.length - 1] += "}";
    return constantsList.map((c) => `${c}`).join(", ");
}

function kLemParser(kDefault: LemConstants[], kBuilderStr: string, kind: SegmentKind): [[LemConstants, ...LemConstants[]], Partial<Pose>?] {
    const constants = kDefault.map(k => ({ ...k })) as [LemConstants, ...LemConstants[]];
    if (!kBuilderStr.trim()) return [constants];

    const inner = kBuilderStr.trim().slice(1, -1);
    const entries = inner.split(/,\s*(?=\.)/);

    for (const entry of entries) {
        const match = entry.trim().match(/^\.(.+?)\s*=\s*(.+)$/);
        if (!match) continue;
        const [, rawKey, rawValue] = match;
        const num = parseFloat(rawValue);

        if      (rawKey === "forwards")        constants[0].forwards = rawValue.trim() === "true";
        else if (rawKey === "direction")       constants[0].direction = rawValue.trim() as LemConstants["direction"];
        else if (rawKey === "horizontalDrift") constants[0].horizontalDrift = num;
        else if (rawKey === "lead")            constants[0].lead = num;
        else if (rawKey === "maxSpeed")        constants[0].maxSpeed = num;
        else if (rawKey === "minSpeed")        constants[0].minSpeed = num;
        else if (rawKey === "earlyExitRange")  constants[0].earlyExitRange = num;
    }

    const isTurn = kind === "pointTurn" || kind === "pointSwing";
    const poseOverride: Partial<Pose> | undefined = isTurn
        ? { angle: constants[0].forwards ? 0 : 180 }
        : undefined;

    return [constants, poseOverride];
}
