import { getUnequalKeys, roundOff } from "../../core/Util";
import { type FormatDef, type NumberInputGroup, type CycleButtonField } from "../FormatDefinition";
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

    turn_direction: "FASTEST" | "CW" | "CCW",
    drive_direction: "FASTEST" | "FWD" | "REV",
    swing_direction: "LEFT" | "RIGHT",
    opposite_voltage: number,
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
    drift: 2,
    lead: 0.5,

    turn_direction: "FASTEST",
    drive_direction: "FASTEST",
    swing_direction: "LEFT",
    opposite_voltage: 0,
}

export const kMikHeading: mikConstants = {
    max_voltage: 10,
    min_voltage: 0,

    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,

    exit_error: 0,
    settle_error: 0,
    settle_time: 0,
    timeout: 0,

    drift: 0,
    slew: 0,
    lead: 0,

    turn_direction: "FASTEST",
    drive_direction: "FASTEST",
    swing_direction: "LEFT",
    opposite_voltage: 0,
}

export const kMikTurn: mikConstants = {
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

    slew: 0,
    drift: 0,
    lead: 0,

    turn_direction: "FASTEST",
    drive_direction: "FASTEST",
    swing_direction: "LEFT",
    opposite_voltage: 0,
}

export const kMikSwing: mikConstants = {
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

    drift: 0,
    slew: 0,
    lead: 0,

    turn_direction: "FASTEST",
    drive_direction: "FASTEST",
    swing_direction: "LEFT",
    opposite_voltage: 0,
}

type Fields = NumberInputGroup<"mikLib">["fields"];

const exitConditionsSettings: Fields = [
    { key: "settle_error", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
    { key: "settle_time", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
    { key: "min_voltage", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
    { key: "exit_error", units: "in", label: "Exit Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
];

const PIDConstantsSettings: Fields = [
    { key: "max_voltage", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "starti", units: "in",  label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
    { key: "slew", units: "volt/10ms",  label: "Slew", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
];

type CycleButton = Omit<CycleButtonField<"mikLib">, "constantsIdx">;

const driveDirectionButton: CycleButton = {
    key: "drive_direction",
    keyValues: [
        { srcImg: fastest, value: "FASTEST" },
        { srcImg: fwd, value: "FWD" },
        { srcImg: rev, value: "REV" },
    ],
};

const turnDirectionButton: CycleButton = {
    key: "turn_direction",
    keyValues: [
        { srcImg: cw, value: "CW" },
        { srcImg: ccw, value: "CCW" },
        { srcImg: cwccw, value: "FASTEST" },
    ],
};

const swingDirectionButton: CycleButton = {
    key: "swing_direction",
    keyValues: [
        { srcImg: rightswing, value: "RIGHT" },
        { srcImg: leftswing, value: "LEFT" },
    ],
};

export const mikLibDef = {
    constants: [kMikDrive],
    kMaxSpeed: 12,
    formatPathName: "mikLib Path",
    kBuilder: kMikBuilder,
    slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1 },

    segments: {
        start: {
            name: "Start",
            exists: true,
            defaults: [kMikDrive],
            toStringTemplate: "chassis.set_position(${x}, ${y}, ${angle});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle),
            cycleButtons: [],
            numberInputs: [],
        },

        poseDrive: {
            name: "Drive to Pose",
            exists: true,
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.drive_to_pose(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => drive_to_pose(robot, dt, x, y, angle, constants),
            cycleButtons: [
                { constantsIdx: 0, ...driveDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [
                    ...exitConditionsSettings,
                    { key: "drift", label: "Drift", units: "", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
                    { key: "lead", label: "Lead", units: "in", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 1 } },
                ]},
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...PIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...PIDConstantsSettings] },
            ],
        },

        distanceDrive: {
            name: "Drive to Distance",
            exists: false,
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.drive_distance(${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => drive_distance(robot, dt, x, y, constants),
            cycleButtons: [
                { constantsIdx: 0, ...driveDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...exitConditionsSettings]},
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...PIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...PIDConstantsSettings] },
            ],
        },

        pointDrive: {
            name: "Drive to Point",
            exists: true,
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.drive_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => drive_to_point(robot, dt, x, y, constants),
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...exitConditionsSettings]},
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...PIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...PIDConstantsSettings] },
            ],
        },

        pointTurn: {
            name: "Turn to Point",
            exists: true,
            defaults: [kMikTurn],
            toStringTemplate: "chassis.turn_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => turn_to_point(robot, dt, x, y, angle, constants),
            cycleButtons: [
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...exitConditionsSettings] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...PIDConstantsSettings] },
            ],
        },

        angleTurn: {
            name: "Turn to Angle",
            exists: true,
            defaults: [kMikTurn],
            toStringTemplate: "chassis.turn_to_angle(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => turn_to_angle(robot, dt, angle, constants),
            cycleButtons: [
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...exitConditionsSettings] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...PIDConstantsSettings] },
            ],
        },

        angleSwing: {
            name: "Swing to Angle",
            exists: true,
            defaults: [kMikSwing],
            toStringTemplate: "chassis.swing_to_angle(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => swing_to_angle(robot, dt, angle, constants),
            cycleButtons: [
                { constantsIdx: 0, ...swingDirectionButton },
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...exitConditionsSettings] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...PIDConstantsSettings] },
            ],
        },

        pointSwing: {
            name: "Swing to Point",
            exists: true,
            defaults: [kMikSwing],
            toStringTemplate: "chassis.swing_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => swing_to_point(robot, dt, x, y, angle, constants),
            cycleButtons: [
                { constantsIdx: 0, ...swingDirectionButton },
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...exitConditionsSettings] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...PIDConstantsSettings] },
            ],
        },
    },
} satisfies FormatDef<"mikLib">;

function kMikBuilder(kDefault: mikConstants[], constants: mikConstants[]): string {
    const keyToDriveConstant = (key: keyof mikConstants, value: mikConstants[keyof mikConstants]): string => {
        switch (key) {
            case "kp":             return `.drive_k.p = ${roundOff(value as number, 3)}`;
            case "ki":             return `.drive_k.i = ${roundOff(value as number, 5)}`;
            case "kd":             return `.drive_k.d = ${roundOff(value as number, 3)}`;
            case "starti":         return `.drive_k.starti = ${roundOff(value as number, 2)}`;
            case "max_voltage":    return `.max_voltage = ${roundOff(value as number, 1)}`;
            case "min_voltage":    return `.min_voltage = ${roundOff(value as number, 1)}`;
            case "drift":          return `.drift = ${roundOff(value as number, 2)}`;
            case "lead":           return `.lead = ${roundOff(value as number, 2)}`;
            case "settle_error":   return `.settle_error = ${roundOff(value as number, 2)}`;
            case "settle_time":    return `.settle_time = ${roundOff(value as number, 0)}`;
            case "timeout":        return `.timeout = ${roundOff(value as number, 0)}`;
            case "slew":           return `.slew = ${roundOff(value as number, 2)}`;
            case "exit_error":     return `.exit_error = ${roundOff(value as number, 2)}`;
            case "drive_direction":
                if (value === "FASTEST") return "";
                return `.drive_direction = mik::${value}`;
        }
        return "";
    };

    const keyToHeadingConstant = (key: keyof mikConstants, value: mikConstants[keyof mikConstants]): string => {
        switch (key) {
            case "kp":          return `.heading_k.p = ${roundOff(value as number, 3)}`;
            case "ki":          return `.heading_k.i = ${roundOff(value as number, 5)}`;
            case "kd":          return `.heading_k.d = ${roundOff(value as number, 3)}`;
            case "starti":      return `.heading_k.starti = ${roundOff(value as number, 2)}`;
            case "max_voltage": return `.heading_max_voltage = ${roundOff(value as number, 1)}`;
        }
        return "";
    };

    const keyToTurnConstant = (key: keyof mikConstants, value: mikConstants[keyof mikConstants]): string => {
        switch (key) {
            case "kp":               return `.k.p = ${roundOff(value as number, 3)}`;
            case "ki":               return `.k.i = ${roundOff(value as number, 5)}`;
            case "kd":               return `.k.d = ${roundOff(value as number, 3)}`;
            case "starti":           return `.k.starti = ${roundOff(value as number, 2)}`;
            case "max_voltage":      return `.max_voltage = ${roundOff(value as number, 1)}`;
            case "min_voltage":      return `.min_voltage = ${roundOff(value as number, 1)}`;
            case "settle_error":     return `.settle_error = ${roundOff(value as number, 2)}`;
            case "settle_time":      return `.settle_time = ${roundOff(value as number, 0)}`;
            case "timeout":          return `.timeout = ${roundOff(value as number, 0)}`;
            case "lead":             return `.lead = ${roundOff(value as number, 2)}`;
            case "opposite_voltage": return `.opposite_voltage = ${roundOff(value as number, 1)}`;
            case "turn_direction":
                if (value === "FASTEST") return "";
                return `.turn_direction = mik::${value}`;
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

    const isDrive = kDefault.length >= 2;
    const constantsList = isDrive
        ? [
            ...buildList(kDefault[0], constants[0], keyToDriveConstant),
            ...buildList(kDefault[1], constants[1], keyToHeadingConstant),
          ]
        : buildList(kDefault[0], constants[0], keyToTurnConstant);

    if (constantsList.length === 0) return "";

    constantsList[0] = "{" + constantsList[0];
    constantsList[constantsList.length - 1] += "}";
    return constantsList.join(", ");
}
