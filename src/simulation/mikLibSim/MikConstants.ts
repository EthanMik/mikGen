import { getUnequalKeys, roundOff } from "../../core/Util";
import { type FormatDef, type NumberInputGroup, type CycleButtonField, type SegmentKind } from "../FormatDefinition";
import type { Pose } from "../../core/Types/Pose";
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import cwccw from "../../assets/cwwcw.svg";
import fwd from "../../assets/fwd.svg";
import rev from "../../assets/reverse.svg";
import fastest from "../../assets/fwdrev.svg"
import leftswing from "../../assets/leftswing.svg";
import rightswing from "../../assets/rightswing.svg";
import { drive_to_pose } from "./DriveMotions/DriveToPose";
import { drive_distance } from "./DriveMotions/DriveDistance";
import { drive_to_point } from "./DriveMotions/DriveToPoint";
import { turn_to_point } from "./DriveMotions/TurnToPoint";
import { turn_to_angle } from "./DriveMotions/TurnToAngle";
import { swing_to_angle } from "./DriveMotions/SwingToAngle";
import { swing_to_point } from "./DriveMotions/SwingToPoint";

export interface mikConstants {
    max_voltage: number;
    min_voltage: number;

    kp: number,
    ki: number,
    kd: number,
    starti: number,

    exit_error: number,
    settle_error: number,
    settle_time: number,
    timeout: number

    drift: number,
    slew: number,
    lead: number,

    turn_direction: "fastest" | "cw" | "ccw",
    drive_direction: "fastest" | "forwards" | "reversed",
    swing_direction: "left" | "right",
    opposite_voltage: number,

    wait: boolean;
}

export const kMikDrive: mikConstants = {
    max_voltage: 8,
    min_voltage: 0,

    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,

    exit_error: 0,
    settle_error: 2,
    settle_time: 200,
    timeout: 5000,

    slew: 2,
    drift: 3,
    lead: 0.5,

    turn_direction: "fastest",
    drive_direction: "fastest",
    swing_direction: "left",
    opposite_voltage: 0,
    wait: true,
}

export const kMikHeading: mikConstants = {
    ...kMikDrive,

    max_voltage: 10,
    min_voltage: 0,

    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,

    exit_error: 0,
    settle_error: 1,
    settle_time: 200,
    timeout: 3000,
}

export const kMikTurn: mikConstants = {
    ...kMikDrive,

    max_voltage: 12,
    min_voltage: 0,

    kp: .4,
    ki: 0.03,
    kd: 3,
    starti: 15,

    exit_error: 0,
    settle_error: 1,
    settle_time: 200,
    timeout: 3000,
}

export const kMikSwing: mikConstants = {
    ...kMikDrive,
    
    max_voltage: 8,
    min_voltage: 0,

    kp: .4,
    ki: 0.01,
    kd: 2,
    starti: 15,

    exit_error: 0,
    settle_error: 1,
    settle_time: 200,
    timeout: 3000,
}

type Fields = NumberInputGroup<"mikLib">["fields"];

export const mikExitConditionsSettings: Fields = [
    { key: "settle_error", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
    { key: "settle_time", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
    { key: "min_voltage", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
    { key: "exit_error", units: "in", label: "Exit Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
];

export const mikPIDConstantsSettings: Fields = [
    { key: "max_voltage", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "starti", units: "in", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
    { key: "slew", units: "volt/10ms", label: "Slew", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
];

type CycleButton = Omit<CycleButtonField<"mikLib">, "constantsIdx">;

const driveDirectionButton: CycleButton = {
    key: "drive_direction",
    keyValues: [
        { srcImg: fastest, value: "fastest" },
        { srcImg: fwd, value: "forwards" },
        { srcImg: rev, value: "reversed" },
    ],
};

const turnDirectionButton: CycleButton = {
    key: "turn_direction",
    keyValues: [
        { srcImg: cw, value: "cw" },
        { srcImg: ccw, value: "ccw" },
        { srcImg: cwccw, value: "fastest" },
    ],
};

const swingDirectionButton: CycleButton = {
    key: "swing_direction",
    keyValues: [
        { srcImg: rightswing, value: "right" },
        { srcImg: leftswing, value: "left" },
    ],
};

export const mikLibDef = {
    constants: [kMikDrive],
    kMaxSpeed: 12,
    formatPathName: "mikLib Path",
    kBuilder: kMikBuilder,
    kParser: kMikParser,
    segments: {
        start: {
            name: "Start",
            defaults: [kMikDrive],
            toStringTemplate: "chassis.set_coordinates(${x}, ${y}, ${angle});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle ?? 0),
            cycleButtons: [],
            numberInputs: [],
        },

        wait: {
            name: "Wait",
            defaults: [kMikDrive],
            toStringTemplate: "task::sleep(${time});",
            simFn: (robot, dt, time) => robot.wait(time, dt),
            slider: { key: "time", bounds: [0, 1000], roundTo: 10, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [{
                constantsIdx: 0, headerName: "Wait Settings", fields: [
                    { key: "time", label: "Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
                ]
            }],
        },

        poseDrive: {
            name: "Drive to Pose",
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.drive_to_pose(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => drive_to_pose(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...driveDirectionButton },
            ],
            numberInputs: [
                {
                    constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings]
                },
                {
                    constantsIdx: 0, headerName: "Drive Constants", fields: [
                        ...mikPIDConstantsSettings,
                        { key: "drift", label: "Drift", units: "", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
                        { key: "lead", label: "Lead", units: "in", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 1 } },
                    ]
                },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        distanceDrive: {
            name: "Drive to Distance",
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.drive_distance(${distance}, ${kBuilder});",
            simFn: (robot, dt, distance, _y, angle, constants) => drive_distance(robot, dt, distance, angle, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...mikPIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        pointDrive: {
            name: "Drive to Point",
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.drive_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => drive_to_point(robot, dt, x, y, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...mikPIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        pointTurn: {
            name: "Turn to Point",
            defaults: [kMikTurn],
            toStringTemplate: "chassis.turn_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => turn_to_point(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        angleTurn: {
            name: "Turn to Angle",
            defaults: [kMikTurn],
            toStringTemplate: "chassis.turn_to_angle(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => turn_to_angle(robot, dt, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        angleSwing: {
            name: "Swing to Angle",
            defaults: [kMikSwing],
            toStringTemplate: "chassis.${swing_direction}_swing_to_angle(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => swing_to_angle(robot, dt, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...swingDirectionButton },
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        pointSwing: {
            name: "Swing to Point",
            defaults: [kMikSwing],
            toStringTemplate: "chassis.${swing_direction}_swing_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => swing_to_point(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...swingDirectionButton },
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...mikPIDConstantsSettings] },
            ],
        },

        strafeDrive: {
            castTo: "distanceDrive"
        }


    },
} satisfies FormatDef<"mikLib">;

function kMikBuilder(kDefault: mikConstants[], constants: mikConstants[], pose?: Pose, kind?: SegmentKind): string {
    const keyToDriveConstant = (key: keyof mikConstants, value: mikConstants[keyof mikConstants]): string => {
        switch (key) {
            case "kp": return `.drive_k.p = ${roundOff(value as number, 3)}`;
            case "ki": return `.drive_k.i = ${roundOff(value as number, 5)}`;
            case "kd": return `.drive_k.d = ${roundOff(value as number, 3)}`;
            case "starti": return `.drive_k.starti = ${roundOff(value as number, 2)}`;
            case "max_voltage": return `.max_voltage = ${roundOff(value as number, 1)}`;
            case "min_voltage": return `.min_voltage = ${roundOff(value as number, 1)}`;
            case "drift": return `.drift = ${roundOff(value as number, 2)}`;
            case "lead": return `.lead = ${roundOff(value as number, 2)}`;
            case "settle_error": return `.settle_error = ${roundOff(value as number, 2)}`;
            case "settle_time": return `.settle_time = ${roundOff(value as number, 0)}`;
            case "timeout": return `.timeout = ${roundOff(value as number, 0)}`;
            case "slew": return `.slew = ${roundOff(value as number, 2)}`;
            case "exit_error": return `.exit_error = ${roundOff(value as number, 2)}`;
            case "drive_direction":
                if (value === "fastest") return "";
                return `.direction = ${value}`;
            case "wait": return `.wait = ${value ? "true" : "false"}`;
        }
        return "";
    };

    const keyToHeadingConstant = (key: keyof mikConstants, value: mikConstants[keyof mikConstants]): string => {
        switch (key) {
            case "kp": return `.heading_k.p = ${roundOff(value as number, 3)}`;
            case "ki": return `.heading_k.i = ${roundOff(value as number, 5)}`;
            case "kd": return `.heading_k.d = ${roundOff(value as number, 3)}`;
            case "starti": return `.heading_k.starti = ${roundOff(value as number, 2)}`;
            case "settle_error": return `.turn_settle_error = ${roundOff(value as number, 2)}`;
            case "settle_time": return `.turn_settle_time = ${roundOff(value as number, 0)}`;
            case "max_voltage": return `.heading_max_voltage = ${roundOff(value as number, 1)}`;
            case "slew": return `.heading_slew = ${roundOff(value as number, 2)}`;
        }
        return "";
    };

    const keyToTurnConstant = (key: keyof mikConstants, value: mikConstants[keyof mikConstants]): string => {
        switch (key) {
            case "kp": return `.k.p = ${roundOff(value as number, 3)}`;
            case "ki": return `.k.i = ${roundOff(value as number, 5)}`;
            case "kd": return `.k.d = ${roundOff(value as number, 3)}`;
            case "starti": return `.k.starti = ${roundOff(value as number, 2)}`;
            case "max_voltage": return `.max_voltage = ${roundOff(value as number, 1)}`;
            case "min_voltage": return `.min_voltage = ${roundOff(value as number, 1)}`;
            case "settle_error": return `.settle_error = ${roundOff(value as number, 2)}`;
            case "settle_time": return `.settle_time = ${roundOff(value as number, 0)}`;
            case "timeout": return `.timeout = ${roundOff(value as number, 0)}`;
            case "exit_error": return `.exit_error = ${roundOff(value as number, 2)}`;
            case "slew": return `.slew = ${roundOff(value as number, 2)}`;
            case "opposite_voltage": return `.opposite_voltage = ${roundOff(value as number, 1)}`;
            case "turn_direction":
                if (value === "fastest") return "";
                return `.direction = ${value}`;
            case "wait": return `.wait = ${value ? "true" : "false"}`;
        }
        return "";
    };

    const buildList = (
        kDef: mikConstants,
        k: mikConstants,
        mapper: (key: keyof mikConstants, val: mikConstants[keyof mikConstants]) => string
    ): string[] => {
        const unequal = getUnequalKeys(kDef, k);
        const list: string[] = [];
        for (const key of Object.keys(unequal)) {
            const value = unequal[key as keyof mikConstants];
            if (value === undefined) continue;
            const c = mapper(key as keyof mikConstants, value);
            if (c !== "") list.push(c);
        }

        return list;
    };


    let constantsList: string[] = [];

    if (pose?.angle !== null && (kind === "distanceDrive" || kind === "strafeDrive")) {
        constantsList.push(`.heading = ${roundOff(pose?.angle, 2)}`);
    }

    const isDrive = kDefault.length >= 2;
    constantsList = isDrive
        ? [
            ...constantsList,
            ...buildList(kDefault[0], constants[0], keyToDriveConstant),
            ...buildList(kDefault[1], constants[1], keyToHeadingConstant),
        ]
        : buildList(kDefault[0], constants[0], keyToTurnConstant);

    if (!isDrive && pose?.angle && kind !== "angleSwing" && kind !== "angleTurn") {
        constantsList.push(`.angle_offset = ${roundOff(pose.angle, 2)}`);
    }

    if (constantsList.length === 0) return "";

    constantsList[0] = "{" + constantsList[0];
    constantsList[constantsList.length - 1] += "}";
    return constantsList.join(", ");
}

function kMikParser(kDefault: mikConstants[], kBuilderStr: string, kind: SegmentKind): [[mikConstants, ...mikConstants[]], Partial<Pose>?] {
    const constants = kDefault.map(k => ({ ...k })) as [mikConstants, ...mikConstants[]];
    if (!kBuilderStr.trim()) return [constants];
    void kind;

    const inner = kBuilderStr.trim().slice(1, -1);
    const entries = inner.split(/,\s*(?=\.)/);

    const isDrive = kDefault.length >= 2;
    let poseAngle: number | undefined;

    for (const entry of entries) {
        const match = entry.trim().match(/^\.(.+?)\s*=\s*(.+)$/);
        if (!match) continue;
        const [, rawKey, rawValue] = match;
        const num = parseFloat(rawValue);

        if (isDrive) {
            if (rawKey === "drive_k.p") constants[0].kp = num;
            else if (rawKey === "drive_k.i") constants[0].ki = num;
            else if (rawKey === "drive_k.d") constants[0].kd = num;
            else if (rawKey === "drive_k.starti") constants[0].starti = num;
            else if (rawKey === "max_voltage") constants[0].max_voltage = num;
            else if (rawKey === "min_voltage") constants[0].min_voltage = num;
            else if (rawKey === "drift") constants[0].drift = num;
            else if (rawKey === "lead") constants[0].lead = num;
            else if (rawKey === "settle_error") constants[0].settle_error = num;
            else if (rawKey === "settle_time") constants[0].settle_time = num;
            else if (rawKey === "timeout") constants[0].timeout = num;
            else if (rawKey === "slew") constants[0].slew = num;
            else if (rawKey === "exit_error") constants[0].exit_error = num;
            else if (rawKey === "direction") constants[0].drive_direction = rawValue as mikConstants["drive_direction"];
            else if (rawKey === "heading_k.p") constants[1].kp = num;
            else if (rawKey === "heading_k.i") constants[1].ki = num;
            else if (rawKey === "heading_k.d") constants[1].kd = num;
            else if (rawKey === "heading_k.starti") constants[1].starti = num;
            else if (rawKey === "heading_max_voltage") constants[1].max_voltage = num;
            else if (rawKey === "turn_settle_error") constants[1].settle_error = num;
            else if (rawKey === "turn_settle_time") constants[1].settle_time = num;
            else if (rawKey === "heading") poseAngle = num;
            else if (rawKey === "wait") constants[0].wait = rawValue === "true";
        } else {
            if (rawKey === "k.p") constants[0].kp = num;
            else if (rawKey === "k.i") constants[0].ki = num;
            else if (rawKey === "k.d") constants[0].kd = num;
            else if (rawKey === "k.starti") constants[0].starti = num;
            else if (rawKey === "max_voltage") constants[0].max_voltage = num;
            else if (rawKey === "min_voltage") constants[0].min_voltage = num;
            else if (rawKey === "settle_error") constants[0].settle_error = num;
            else if (rawKey === "settle_time") constants[0].settle_time = num;
            else if (rawKey === "timeout") constants[0].timeout = num;
            else if (rawKey === "slew") constants[0].slew = num;
            else if (rawKey === "opposite_voltage") constants[0].opposite_voltage = num;
            else if (rawKey === "direction") constants[0].turn_direction = rawValue as mikConstants["turn_direction"];
            else if (rawKey === "wait") constants[0].wait = rawValue === "true";
            else if (rawKey === "angle_offset") poseAngle = num;
        }
    }

    return poseAngle !== undefined ? [constants, { angle: poseAngle }] : [constants];
}
