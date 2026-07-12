import { getUnequalKeys, normalizeDeg, roundOff } from "../../core/Util";
import { type CycleButtonField, type FormatDef, type NumberInputGroup } from "../FormatDefinition";
import { boomerangSegment } from "./DriveMotions/BoomerangSegment";
import { pilonsSegment } from "./DriveMotions/PilonsSegment";
import { turnSegment } from "./DriveMotions/TurnSegment";
import { lookAt } from "./DriveMotions/LookAt";
import type { Pose } from "../../core/Types/Pose";
import fwd from "../../assets/fwd.svg";
import rev from "../../assets/reverse.svg";

export interface ReveilLibConstants {
    maxSpeed: number;

    kCorrection: number;
    maxError: number;

    stopHarshThreshold: number;
    stopCoastThreshold: number;
    stopCoastPower: number;
    stopTimeout: number;
    brakeTime: number;

    dropEarly: number;

    lead: number;
}

export const kRevDrive: ReveilLibConstants = {
    maxSpeed: 1,

    kCorrection: 2,
    maxError: 0.5,

    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    stopTimeout: 5000,
    brakeTime: 250,

    dropEarly: 0,

    lead: 0.5,
};

export const kRevTurn: ReveilLibConstants = {
    maxSpeed: 0.75,

    kCorrection: 2,
    maxError: 0.5,

    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    stopTimeout: 5000,
    brakeTime: 100,

    dropEarly: 0,

    lead: 0.5,
};

type Fields = NumberInputGroup<"ReveilLib">["fields"];

// Pose-backed: cycles the point turn angle offset stored in pose.angle
const turnFaceButton: Omit<CycleButtonField<"ReveilLib">, "constantsIdx"> = {
    key: "angle_offset",
    keyValues: [
        { srcImg: fwd, value: "0" },
        { srcImg: rev, value: "180" },
    ],
    poseValue: (pose) => normalizeDeg(pose.angle ?? 0) === 180 ? "180" : "0",
    poseEffect: (val) => ({ angle: val === "180" ? 180 : 0 }),
};

const driveSettingsFields: Fields = [
    { key: "maxSpeed",            label: "Max Speed",       units: "",   input: { bounds: [0, 1],    stepSize: 0.05, roundTo: 2 } },
    { key: "stopCoastPower",      label: "Coast Power",     units: "",   input: { bounds: [0, 1],    stepSize: 0.05, roundTo: 2 } },
    { key: "stopCoastThreshold",  label: "Coast Threshold", units: "ms", input: { bounds: [0, 9999], stepSize: 10,   roundTo: 0 } },
    { key: "stopHarshThreshold",  label: "Harsh Threshold", units: "ms", input: { bounds: [0, 9999], stepSize: 10,   roundTo: 0 } },
    { key: "brakeTime",           label: "Brake Time",      units: "ms", input: { bounds: [0, 9999], stepSize: 10,   roundTo: 0 } },
    { key: "dropEarly",           label: "Drop Early",      units: "in", input: { bounds: [0, 100],  stepSize: 0.5,  roundTo: 2 } },
];

const correctionFields: Fields = [
    { key: "kCorrection", label: "kCorrection", units: "",   input: { bounds: [0, 10],  stepSize: 0.1, roundTo: 2 } },
    { key: "maxError",    label: "Max Error",   units: "in", input: { bounds: [0, 10],  stepSize: 0.1, roundTo: 2 } },
];

const turnSettingsFields: Fields = [
    { key: "maxSpeed",           label: "Max Speed",       units: "",   input: { bounds: [0, 1],    stepSize: 0.05, roundTo: 2 } },
    { key: "stopCoastPower",     label: "Coast Power",     units: "",   input: { bounds: [0, 1],    stepSize: 0.05, roundTo: 2 } },
    { key: "stopCoastThreshold", label: "Coast Threshold", units: "ms", input: { bounds: [0, 9999], stepSize: 10,   roundTo: 0 } },
    { key: "stopHarshThreshold", label: "Harsh Threshold", units: "ms", input: { bounds: [0, 9999], stepSize: 10,   roundTo: 0 } },
    { key: "brakeTime",          label: "Brake Time",      units: "ms", input: { bounds: [0, 9999], stepSize: 10,   roundTo: 0 } },
];

export const reveilLibDef = {
    constants: [kRevDrive],
    kMaxSpeed: 1,
    formatPathName: "ReveilLib Path",
    kBuilder: kRevBuilder,
    kParser: kRevParser,
    segments: {
        start: {
            name: "Start",
            defaults: [kRevDrive],
            toStringTemplate: "set_pose(${x}, ${y}, ${angle});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle ?? 0),
            cycleButtons: [],
            numberInputs: [],
        },

        poseDrive: {
            name: "Pose Drive",
            defaults: [kRevDrive],
            toStringTemplate: "pose(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => boomerangSegment(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "maxSpeed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [
                    ...driveSettingsFields,
                    { key: "lead", label: "Lead", units: "", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } },
                ]},
                { constantsIdx: 0, headerName: "Correction", fields: [...correctionFields] },
            ],
        },

        distanceDrive: {
            castTo: "pointDrive"
        },

        pointDrive: {
            name: "Move to Point",
            defaults: [kRevDrive],
            toStringTemplate: "move(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => pilonsSegment(robot, dt, x, y, constants),
            slider: { key: "maxSpeed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Motion Settings", fields: [...driveSettingsFields] },
                { constantsIdx: 0, headerName: "Correction", fields: [...correctionFields] },
            ],
        },

        pointTurn: {
            name: "Look At",
            defaults: [kRevTurn],
            toStringTemplate: "look(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => lookAt(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "maxSpeed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...turnFaceButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Turn Settings", fields: [
                    ...turnSettingsFields,
                    { key: "dropEarly", label: "Drop Early", units: "deg", input: { bounds: [0, 90], stepSize: 0.5, roundTo: 2 } },
                ]},
            ],
        },

        angleTurn: {
            name: "Turn to Angle",
            defaults: [kRevTurn],
            toStringTemplate: "turn(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => turnSegment(robot, dt, angle ?? 0, constants),
            slider: { key: "maxSpeed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Turn Settings", fields: [...turnSettingsFields] },
            ],
        },

        wait: {
            name: "Wait",
            defaults: [kRevTurn],
            toStringTemplate: "pros::delay(${time});",
            simFn: (robot, dt, time) => robot.wait(time, dt),
            slider: { key: "time", bounds: [0, 1000], roundTo: 10, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [{
                constantsIdx: 0, headerName: "Wait Settings", fields: [
                    { key: "time", label: "Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
                ]
            }],
        },

        strafeDrive: {
            castTo: "pointDrive"
        },

        angleSwing: {
            castTo: "angleTurn"
        },

        pointSwing: {
            castTo: "pointTurn"
        },
    },
} satisfies FormatDef<"ReveilLib">;

function kRevBuilder(kDefault: ReveilLibConstants[], constants: ReveilLibConstants[]): string {
    const keyToRevConstant = (key: keyof ReveilLibConstants, value: ReveilLibConstants[keyof ReveilLibConstants]): string => {
        switch (key) {
            case "maxSpeed":           return `.speed = ${roundOff(value as number, 2)}`;
            case "stopCoastPower":     return `.min = ${roundOff(value as number, 2)}`;
            case "kCorrection":        return `.correction = ${roundOff(value as number, 1)}`;
            case "maxError":           return `.error = ${roundOff(value as number, 2)}`;
            case "stopCoastThreshold": return `.coast = ${roundOff(value as number, 0)}`;
            case "stopHarshThreshold": return `.harsh = ${roundOff(value as number, 0)}`;
            case "brakeTime":          return `.time = ${roundOff(value as number, 0)}`;
            case "lead":               return `.lead = ${roundOff(value as number, 2)}`;
            case "dropEarly":          return `.drop_early = ${roundOff(value as number, 2)}`;
            case "stopTimeout":        return "";
        }
    };

    const unequal = getUnequalKeys(kDefault[0], constants[0]);
    const constantsList: string[] = [];
    for (const key of Object.keys(unequal)) {
        const value = unequal[key as keyof ReveilLibConstants];
        if (value === undefined) continue;
        const c = keyToRevConstant(key as keyof ReveilLibConstants, value);
        if (c !== "") constantsList.push(c);
    }

    if (constantsList.length === 0) return "";

    constantsList[0] = "{" + constantsList[0];
    constantsList[constantsList.length - 1] += "}";
    return constantsList.join(", ");
}

function kRevParser(kDefault: ReveilLibConstants[], kBuilderStr: string): [[ReveilLibConstants, ...ReveilLibConstants[]], Partial<Pose>?] {
    const constants = kDefault.map(k => ({ ...k })) as [ReveilLibConstants, ...ReveilLibConstants[]];
    if (!kBuilderStr.trim()) return [constants];

    const inner = kBuilderStr.trim().slice(1, -1);
    const entries = inner.split(/,\s*(?=\.)/);

    for (const entry of entries) {
        const match = entry.trim().match(/^\.(.+?)\s*=\s*(.+)$/);
        if (!match) continue;
        const [, rawKey, rawValue] = match;
        const num = parseFloat(rawValue);

        if      (rawKey === "speed")      constants[0].maxSpeed = num;
        else if (rawKey === "min")        constants[0].stopCoastPower = num;
        else if (rawKey === "correction") constants[0].kCorrection = num;
        else if (rawKey === "error")      constants[0].maxError = num;
        else if (rawKey === "coast")      constants[0].stopCoastThreshold = num;
        else if (rawKey === "harsh")      constants[0].stopHarshThreshold = num;
        else if (rawKey === "time")       constants[0].brakeTime = num;
        else if (rawKey === "lead")       constants[0].lead = num;
        else if (rawKey === "drop_early") constants[0].dropEarly = num;
    }

    return [constants];
}

