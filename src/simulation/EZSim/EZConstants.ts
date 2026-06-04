import type { CycleButtonField, FormatDef, NumberInputGroup } from "../FormatDefinition"
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import fastest from "../../assets/fastest_turn.svg";
import slowest from "../../assets/slowest_turn.svg";
import fwd from "../../assets/fwd.svg";
import rev from "../../assets/reverse.svg";
import leftswing from "../../assets/leftswing.svg";
import rightswing from "../../assets/rightswing.svg";
import stop from "../../assets/stop_speed.svg"
import slow from "../../assets/slow_speed.svg"
import fast from "../../assets/fast_speed.svg"
import { pid_drive_set } from "./DriveMotions/set_drive_pid";
import { pid_turn_set } from "./DriveMotions/set_turn_pid";
import { pid_odom_turn_set } from "./DriveMotions/set_odom_turn_pid";
import { pid_swing_set } from "./DriveMotions/set_swing_pid";
import { pid_odom_set } from "./DriveMotions/pid_odom_set";
import { pid_odom_boomerang_set } from "./DriveMotions/pid_odom_boomerang_set";

export interface EZconstants {
    speed: number,
    opposite_speed: number,
    chain_constant: number,

    // PID
    p: number,
    i: number,
    d: number,
    start_i: number,

    // Exit conditions
    small_exit_time: number
    small_error: number,
    big_exit_time: number,
    big_error: number,
    velocity_exit_time: number,

    // Slew
    slew_distance: number,
    slew_min_speed: number,

    // Other
    odom_turn_bias: number,
    dlead: number,
    boomerang_distance: number,
    lookahead: number,

    angle_behavior: "shortest" | "longest" | "ccw" | "cw"
    drive_directions: "fwd" | "rev"
    swing: "LEFT_SWING" | "RIGHT_SWING"
    wait: "wait" | "wait_quick" | "wait_quick_chain"
    slew: boolean,
}

const driveConstants: EZconstants = {
    speed: 110,
    chain_constant: 3,
    opposite_speed: 0,

    p: 20,
    i: 0,
    d: 100,
    start_i: 0,

    small_exit_time: 90,
    small_error: 1,
    big_exit_time: 250,
    big_error: 3,
    velocity_exit_time: 500,

    slew_distance: 3,
    slew_min_speed: 70,

    odom_turn_bias: 0.9,
    dlead: 0.625,
    boomerang_distance: 16,
    lookahead: 7,

    angle_behavior: "shortest",
    drive_directions: "fwd",
    swing: "LEFT_SWING",
    wait: "wait",
    slew: true
}

const headingConstants: EZconstants = {
    ...driveConstants,
    p: 11,
    i: 0,
    d: 20,
    start_i: 0
}

const angularConstants: EZconstants = {
    ...driveConstants,
    p: 6.5,
    i: 0,
    d: 52.5,
    start_i: 0
}

const boomerangConstants: EZconstants = {
    ...driveConstants,
    p: 5.8,
    i: 0,
    d: 32.5,
    start_i: 0
}

const turnConstants: EZconstants = {
    ...driveConstants,

    speed: 90,
    chain_constant: 3,
    opposite_speed: 0,

    p: 3,
    i: 0.05,
    d: 20,
    start_i: 15,

    small_exit_time: 90,
    small_error: 3,
    big_exit_time: 250,
    big_error: 7,
    velocity_exit_time: 500,

    slew_distance: 3,
    slew_min_speed: 70,
}

const swingConstants: EZconstants = {
    ...driveConstants,

    speed: 110,
    chain_constant: 5,
    opposite_speed: 0,

    p: 6,
    i: 0,
    d: 65,
    start_i: 0,

    small_exit_time: 90,
    small_error: 3,
    big_exit_time: 250,
    big_error: 7,
    velocity_exit_time: 500,

    slew_distance: 3,
    slew_min_speed: 80,
}

type Fields = NumberInputGroup<"EZ-Template">["fields"];

type Type = "TURN" | "DRIVE";

const exitConditions = (type: Type): Fields => {
    const distUnit = type === "TURN" ? "deg" : "in";
    return [
        { key: "chain_constant", units: distUnit, label: "Chain Constant", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "small_error", units: distUnit, label: "Small Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "small_exit_time", units: "ms", label: "Small Exit Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "big_error", units: distUnit, label: "Big Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "big_exit_time", units: "ms", label: "Big Exit Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "velocity_exit_time", units: "ms", label: "Velocity Exit Time", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
    ];
};

const pidSettings = (type: Type): Fields => {
    const distUnit = type === "TURN" ? "deg" : "in";
    return [
        { key: "p", label: "P", units: "", input: { bounds: [0, 999], stepSize: 0.1, roundTo: 5 } },
        { key: "i", label: "I", units: "", input: { bounds: [0, 999], stepSize: 0.01, roundTo: 5 } },
        { key: "d", label: "D", units: "", input: { bounds: [0, 999], stepSize: 0.1, roundTo: 5 } },
        { key: "start_i", units: distUnit, label: "Start i", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
    ];
};

const pidSlewSettings = (type: Type): Fields => [
    ...pidSettings(type),
    { key: "speed", units: "", label: "Max Speed", input: { bounds: [0, 127], stepSize: 10, roundTo: 1 } },
    { key: "slew_distance", units: type === "TURN" ? "deg" : "in", label: "Slew Distance", input: { bounds: [0, 100], stepSize: .1, roundTo: 2 } },
    { key: "slew_min_speed", units: "", label: "Slew Min Speed", input: { bounds: [0, 127], stepSize: 1, roundTo: 1 } },
    { key: "slew", units: "", label: "Slew Enabled 0-1", input: { bounds: [0, 1], stepSize: 1, roundTo: 0 } },
];

type CycleButton = Omit<CycleButtonField<"EZ-Template">, "constantsIdx">;

const driveDirectionButton: CycleButton = {
    key: "drive_directions",
    keyValues: [
        { srcImg: fwd, value: "fwd" },
        { srcImg: rev, value: "rev" },
    ],
};

const turnDirectionButton: CycleButton = {
    key: "angle_behavior",
    keyValues: [
        { srcImg: cw, value: "cw" },
        { srcImg: ccw, value: "ccw" },
        { srcImg: slowest, value: "longest" },
        { srcImg: fastest, value: "shortest" },
    ],
};

const swingDirectionButton: CycleButton = {
    key: "swing",
    keyValues: [
        { srcImg: rightswing, value: "RIGHT_SWING" },
        { srcImg: leftswing, value: "LEFT_SWING" },
    ],
};

const waitButton: CycleButton = {
    key: "wait",
    keyValues: [
        { srcImg: stop, value: "wait" },
        { srcImg: slow, value: "wait_quick" },
        { srcImg: fast, value: "wait_quick_chain" },
    ],
};

export const EZTemplateDef = {
    constants: [driveConstants],
    kMaxSpeed: 127,
    formatPathName: "EZ-Template Path",
    // kBuilder: kMikBuilder,
    // kParser: kMikParser,
    segments: {
        start: {
            name: "Start",
            defaults: [driveConstants],
            toStringTemplate: "chassis.set_coordinates(${x}, ${y}, ${angle});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle ?? 0),
            cycleButtons: [],
            numberInputs: [],
        },

        wait: {
            name: "Wait",
            defaults: [driveConstants],
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
        distanceDrive: {
            name: "Drive",
            defaults: [driveConstants, headingConstants],
            toStringTemplate: "chassis.set_drive_pid(${distance});",
            simFn: (robot, dt, distance, _y, _angle, constants) => pid_drive_set(robot, dt, distance, constants),
            slider: { key: "speed", bounds: [0, 127], roundTo: 1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...waitButton }
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: exitConditions("DRIVE") },
                { constantsIdx: 0, headerName: "Drive Constants", fields: pidSlewSettings("DRIVE") },
                { constantsIdx: 1, headerName: "Heading Constants", fields: pidSettings("DRIVE") },
            ],
        },
        poseDrive: {
            name: "Odom Boomerang",
            defaults: [driveConstants, boomerangConstants],
            toStringTemplate: "chassis.set_drive_pid(${distance});",
            simFn: (robot, dt, x, y, angle, constants) => pid_odom_boomerang_set(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "speed", bounds: [0, 127], roundTo: 1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...waitButton },
                { constantsIdx: 0, ...driveDirectionButton },

            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: exitConditions("DRIVE"), },
                {
                    constantsIdx: 0, headerName: "Drive Constants", fields: [
                        ...pidSlewSettings("DRIVE"),
                        { key: "odom_turn_bias", label: "Turn Bias", units: "", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
                        { key: "dlead", label: "Lead", units: "", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 3 } },
                        { key: "boomerang_distance", label: "Distance", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
                        { key: "lookahead", label: "Lookahead", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },

                    ]
                },
                { constantsIdx: 1, headerName: "Heading Constants", fields: pidSettings("DRIVE") },
            ],
        },

        pointDrive: {
            name: "Odom Drive",
            defaults: [driveConstants, angularConstants],
            toStringTemplate: "chassis.set_drive_pid(${distance});",
            simFn: (robot, dt, x, y, _angle, constants) => pid_odom_set(robot, dt, x, y, constants),
            slider: { key: "speed", bounds: [0, 127], roundTo: 1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...waitButton },
                { constantsIdx: 0, ...driveDirectionButton },

            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: exitConditions("DRIVE") },
                {
                    constantsIdx: 0, headerName: "Drive Constants", fields: [
                        ...pidSlewSettings("DRIVE"),
                        { key: "odom_turn_bias", label: "Turn Bias", units: "", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
                    ]
                },
                { constantsIdx: 1, headerName: "Heading Constants", fields: pidSettings("DRIVE") },
            ],
        },

        pointTurn: {
            name: "Odom Turn",
            defaults: [turnConstants],
            toStringTemplate: "chassis.set_turn_pid(${x}, ${y});",
            simFn: (robot, dt, x, y, _angle, constants) => pid_odom_turn_set(robot, dt, x, y, constants),
            slider: { key: "speed", bounds: [0, 127], roundTo: 1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...waitButton },
                { constantsIdx: 0, ...driveDirectionButton, poseEffect: (val) => ({ angle: (val as EZconstants["drive_directions"] === "fwd") ? 0 : 180 }) },
                { constantsIdx: 0, ...turnDirectionButton }
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: exitConditions("TURN") },
                { constantsIdx: 0, headerName: "Turn Constants", fields: pidSlewSettings("TURN") },
            ],
        },

        angleTurn: {
            name: "Turn",
            defaults: [turnConstants],
            toStringTemplate: "chassis.set_turn_pid(${angle});",
            simFn: (robot, dt, _x, _y, angle, constants) => pid_turn_set(robot, dt, angle ?? 0, constants),
            slider: { key: "speed", bounds: [0, 127], roundTo: 1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...waitButton },
                { constantsIdx: 0, ...turnDirectionButton }
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: exitConditions("TURN") },
                { constantsIdx: 0, headerName: "Turn Constants", fields: pidSlewSettings("TURN") },
            ],
        },

        angleSwing: {
            name: "Swing",
            defaults: [swingConstants],
            toStringTemplate: "chassis.set_swing_pid(${angle});",
            simFn: (robot, dt, _x, _y, angle, constants) => pid_swing_set(robot, dt, angle ?? 0, constants),
            slider: { key: "speed", bounds: [0, 127], roundTo: 1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...swingDirectionButton },
                { constantsIdx: 0, ...waitButton },
                { constantsIdx: 0, ...turnDirectionButton }
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: exitConditions("TURN") },
                { constantsIdx: 0, headerName: "Swing Constants", fields: pidSlewSettings("TURN") },
            ],
        },

        pointSwing: {
            castTo: "angleSwing"
        },

        strafeDrive: {
            castTo: "distanceDrive"
        }


    },
} satisfies FormatDef<"EZ-Template">;

