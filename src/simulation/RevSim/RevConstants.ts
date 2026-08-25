import { getUnequalKeys, normalizeDeg, roundOff } from "../../core/Util";
import { type CycleButtonField, type FormatDef, type NumberInputGroup, type SegmentKind } from "../FormatDefinition";
import type { Pose } from "../../core/Types/Pose";
import ccw from "../../assets/ccw.svg";
import cw from "../../assets/cw.svg";
import cwccw from "../../assets/cwwcw.svg";
import fwd from "../../assets/fwd.svg";
import rev from "../../assets/reverse.svg";
import fastest from "../../assets/fwdrev.svg";
import leftswing from "../../assets/leftswing.svg";
import rightswing from "../../assets/rightswing.svg";
import { drive_to_pose, reset_drive_to_pose } from "./DriveMotions/DriveToPose";
import { drive_to_point, reset_drive_to_point } from "./DriveMotions/DriveToPoint";
import { drive_distance, reset_drive_distance } from "./DriveMotions/DriveDistance";
import { turn_to_angle, reset_turn_to_angle } from "./DriveMotions/TurnToAngle";
import { turn_to_point, reset_turn_to_point } from "./DriveMotions/TurnToPoint";
import { swing_to_angle, reset_swing_to_angle } from "./DriveMotions/SwingToAngle";
import { swing_to_point, reset_swing_to_point } from "./DriveMotions/SwingToPoint";
import { drive_on_path, reset_drive_on_path } from "./DriveMotions/DriveOnPath";
import { turnLockButton } from "../TurnFields";
import { addControlButton } from "../BezierFields";

export interface revConstants {
    max_speed: number;
    min_speed: number;

    kp: number;
    ki: number;
    kd: number;
    kf: number;
    start_i: number;
    slew: number;

    settle_error: number;
    settle_time: number;
    large_settle_error: number;
    large_settle_time: number;
    exit_error: number;
    stall_timeout: number;
    timeout: number;

    lead: number;
    max_slip: number;
    lookahead: number;

    drive_direction: "fastest" | "forwards" | "reversed";
    turn_direction: "shortest" | "cw" | "ccw";
    swing_side: "SwingSide::LEFT" | "SwingSide::RIGHT";
    opposite_speed: number;
}

export const kRevDrive: revConstants = {
    max_speed: 0.8,
    min_speed: 0,

    kp: 0.125,
    ki: 0,
    kd: 0.85,
    kf: 0,
    start_i: 0,
    slew: 0,

    settle_error: 1,
    settle_time: 100,
    large_settle_error: 3,
    large_settle_time: 500,
    exit_error: 0,
    stall_timeout: 0,
    timeout: 5000,

    lead: 0.5,
    max_slip: 0.17,
    lookahead: 8,

    drive_direction: "fastest",
    turn_direction: "shortest",
    swing_side: "SwingSide::LEFT",
    opposite_speed: 0,
};

export const kRevHeading: revConstants = {
    ...kRevDrive,

    max_speed: 1,

    kp: 0.036,
    ki: 0,
    kd: 0.25,
    kf: 0,
    start_i: 0,
    slew: 0,

    settle_error: 1,
    settle_time: 100,
    large_settle_error: 3,
    large_settle_time: 500,
    timeout: 3000,
};

export const kRevTurn: revConstants = {
    ...kRevHeading,

    max_speed: 1,
    min_speed: 0,

    exit_error: 0,
    stall_timeout: 0,
    timeout: 3000,
};

export const kRevTranslational: revConstants = {
    ...kRevDrive,

    kp: 0.1,
    ki: 0,
    kd: 0,
    kf: 0,
    start_i: 0,
};

type Fields = NumberInputGroup<"ReveilLib">["fields"];

export const revDriveExitConditionsSettings: Fields = [
    { key: "settle_error", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
    { key: "settle_time", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "large_settle_error", units: "in", label: "Large Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
    { key: "large_settle_time", units: "ms", label: "Large Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "exit_error", units: "in", label: "Exit Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
    { key: "stall_timeout", units: "ms", label: "Stall Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
    { key: "min_speed", units: "", label: "Min Speed", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } },
];

export const revTurnExitConditionsSettings: Fields = [
    { key: "settle_error", units: "deg", label: "Settle Error", input: { bounds: [0, 360], stepSize: 0.5, roundTo: 2 } },
    { key: "settle_time", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "large_settle_error", units: "deg", label: "Large Settle Error", input: { bounds: [0, 360], stepSize: 0.5, roundTo: 2 } },
    { key: "large_settle_time", units: "ms", label: "Large Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "exit_error", units: "deg", label: "Exit Error", input: { bounds: [0, 360], stepSize: 5, roundTo: 2 } },
    { key: "stall_timeout", units: "ms", label: "Stall Timeout", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
    { key: "min_speed", units: "", label: "Min Speed", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } },
];

export const revLateralPIDSettings: Fields = [
    { key: "max_speed", units: "", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } },
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.005, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.001, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.05, roundTo: 5 } },
    { key: "kf", label: "kF", units: "", input: { bounds: [0, 1], stepSize: 0.01, roundTo: 5 } },
    { key: "start_i", units: "in", label: "Start I", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
    { key: "slew", units: "/tick", label: "Slew", input: { bounds: [0, 1], stepSize: 0.01, roundTo: 3 } },
];

export const revAngularPIDSettings: Fields = [
    { key: "max_speed", units: "", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } },
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.005, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.001, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.05, roundTo: 5 } },
    { key: "kf", label: "kF", units: "", input: { bounds: [0, 1], stepSize: 0.01, roundTo: 5 } },
    { key: "start_i", units: "deg", label: "Start I", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
    { key: "slew", units: "/tick", label: "Slew", input: { bounds: [0, 1], stepSize: 0.01, roundTo: 3 } },
];

export const revTranslationalPIDSettings: Fields = [
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.005, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.001, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.05, roundTo: 5 } },
    { key: "kf", label: "kF", units: "", input: { bounds: [0, 1], stepSize: 0.01, roundTo: 5 } },
    { key: "start_i", units: "in", label: "Start I", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
];

export const revLeadField: Fields[number] =
    { key: "lead", label: "Lead", units: "", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } };

export const revMaxSlipField: Fields[number] =
    { key: "max_slip", label: "Max Slip", units: "", input: { bounds: [0, 1], stepSize: 0.01, roundTo: 3 } };

export const revLookaheadField: Fields[number] =
    { key: "lookahead", label: "Lookahead", units: "in", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } };

export const revOppositeSpeedField: Fields[number] =
    { key: "opposite_speed", label: "Opposite Speed", units: "", input: { bounds: [0, 1], stepSize: 0.05, roundTo: 2 } };

type CycleButton = Omit<CycleButtonField<"ReveilLib">, "constantsIdx">;

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
        { srcImg: cwccw, value: "shortest" },
    ],
};

const swingSideButton: CycleButton = {
    key: "swing_side",
    keyValues: [
        { srcImg: rightswing, value: "SwingSide::RIGHT" },
        { srcImg: leftswing, value: "SwingSide::LEFT" },
    ],
};

const turnFaceButton: CycleButton = {
    key: "angle_offset",
    keyValues: [
        { srcImg: fwd, value: "0" },
        { srcImg: rev, value: "180" },
    ],
    turnPoseValue: (pose) => normalizeDeg(pose.angle ?? 0) === 180 ? "180" : "0",
    turnPoseEffect: (val) => ({ angle: val === "180" ? 180 : 0 }),
};

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
            toStringTemplate: "odom.set_pose({${x}_in, ${y}_in, ${angle}_deg});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle ?? 0),
            cycleButtons: [],
            numberInputs: [],
        },

        wait: {
            name: "Wait",
            defaults: [kRevDrive],
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

        poseDrive: {
            name: "Drive to Pose",
            defaults: [kRevDrive, kRevHeading],
            toStringTemplate: "reckless.go(DriveToPose({${x}_in, ${y}_in, ${angle}_deg})${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => drive_to_pose(robot, dt, x, y, angle ?? 0, constants),
            simReset: reset_drive_to_pose,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...driveDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revDriveExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...revLateralPIDSettings, revLeadField, revMaxSlipField] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...revAngularPIDSettings] },
            ],
        },

        pointDrive: {
            name: "Drive to Point",
            defaults: [kRevDrive, kRevHeading],
            toStringTemplate: "reckless.go(DriveToPoint({${x}_in, ${y}_in})${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => drive_to_point(robot, dt, x, y, constants),
            simReset: reset_drive_to_point,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...driveDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revDriveExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...revLateralPIDSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...revAngularPIDSettings] },
            ],
        },

        distanceDrive: {
            name: "Drive Distance",
            defaults: [kRevDrive, kRevHeading],
            toStringTemplate: "reckless.go(DriveDistance(${distance}_in, ${angle}_deg)${kBuilder});",
            simFn: (robot, dt, distance, _y, angle, constants) => drive_distance(robot, dt, distance, angle, constants),
            simReset: reset_drive_distance,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revDriveExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...revLateralPIDSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...revAngularPIDSettings] },
            ],
        },

        pointTurn: {
            name: "Turn to Point",
            defaults: [kRevTurn],
            toStringTemplate: "reckless.go(Turn({${x}_in, ${y}_in})${kBuilder});",
            actionButtons: [turnLockButton],
            simFn: (robot, dt, x, y, angle, constants) => turn_to_point(robot, dt, x, y, angle ?? 0, constants),
            simReset: reset_turn_to_point,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...turnDirectionButton },
                { constantsIdx: 0, ...turnFaceButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revTurnExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...revAngularPIDSettings] },
            ],
        },

        angleTurn: {
            name: "Turn to Angle",
            defaults: [kRevTurn],
            toStringTemplate: "reckless.go(Turn(${angle}_deg)${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => turn_to_angle(robot, dt, angle ?? 0, constants),
            simReset: reset_turn_to_angle,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revTurnExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...revAngularPIDSettings] },
            ],
        },

        pointSwing: {
            name: "Swing to Point",
            defaults: [kRevTurn],
            toStringTemplate: "reckless.go(Swing(${swing_side}, {${x}_in, ${y}_in})${kBuilder});",
            actionButtons: [turnLockButton],
            simFn: (robot, dt, x, y, angle, constants) => swing_to_point(robot, dt, x, y, angle ?? 0, constants),
            simReset: reset_swing_to_point,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...swingSideButton },
                { constantsIdx: 0, ...turnDirectionButton },
                { constantsIdx: 0, ...turnFaceButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revTurnExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...revAngularPIDSettings, revOppositeSpeedField] },
            ],
        },

        angleSwing: {
            name: "Swing to Angle",
            defaults: [kRevTurn],
            toStringTemplate: "reckless.go(Swing(${swing_side}, ${angle}_deg)${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => swing_to_angle(robot, dt, angle ?? 0, constants),
            simReset: reset_swing_to_angle,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...swingSideButton },
                { constantsIdx: 0, ...turnDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revTurnExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...revAngularPIDSettings, revOppositeSpeedField] },
            ],
        },

        bezierCurve: {
            name: "Drive on Path",
            defaults: [kRevDrive, kRevHeading],
            toStringTemplate: "reckless.go(DriveOnPath({${c1x}_in, ${c1y}_in}, {${c2x}_in, ${c2y}_in}, {${x}_in, ${y}_in}, ${angle}_deg)${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants, points) => drive_on_path(robot, dt, points ?? [], angle, constants),
            simReset: reset_drive_on_path,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...driveDirectionButton },
            ],
            actionButtons: [addControlButton],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revDriveExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...revLateralPIDSettings, revLookaheadField, revMaxSlipField] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...revAngularPIDSettings] },
            ],
        },

        strafeDrive: {
            castTo: "distanceDrive"
        },

        poseDrive2: {
            castTo: "poseDrive"
        },
    },
} satisfies FormatDef<"ReveilLib">;

const DRIVE_DIRECTION_LITERALS: Record<string, revConstants["drive_direction"]> = {
    "DriveDirection::FASTEST": "fastest",
    "DriveDirection::FWD": "forwards",
    "DriveDirection::FORWARD": "forwards",
    "DriveDirection::REV": "reversed",
    "DriveDirection::REVERSE": "reversed",
};

const TURN_DIRECTION_LITERALS: Record<string, revConstants["turn_direction"]> = {
    "TurnDirection::SHORTEST": "shortest",
    "TurnDirection::CW": "cw",
    "TurnDirection::CLOCKWISE": "cw",
    "TurnDirection::CCW": "ccw",
    "TurnDirection::COUNTERCLOCKWISE": "ccw",
};

export function kRevBuilder(kDefault: revConstants[], constants: revConstants[], pose?: Pose, kind?: SegmentKind): string {
    const isStrafePose = kind === "poseDrive2";

    const keyToLateral = (key: keyof revConstants, value: revConstants[keyof revConstants]): string => {
        switch (key) {
            case "max_speed": return `.max_speed(${roundOff(value as number, 3)})`;
            case "min_speed": return `.min_speed(${roundOff(value as number, 3)})`;
            case "kp": return `.lateral_kp(${roundOff(value as number, 5)})`;
            case "ki": return `.lateral_ki(${roundOff(value as number, 5)})`;
            case "kd": return `.lateral_kd(${roundOff(value as number, 5)})`;
            case "kf": return `.lateral_kf(${roundOff(value as number, 5)})`;
            case "start_i": return `.lateral_start_i(${roundOff(value as number, 2)}_in)`;
            case "slew": return `.lateral_slew(${roundOff(value as number, 3)})`;
            case "settle_error": return `.settle_error(${roundOff(value as number, 2)}_in)`;
            case "settle_time": return `.settle_time(${roundOff(value as number, 0)}_ms)`;
            case "large_settle_error": return `.large_settle_error(${roundOff(value as number, 2)}_in)`;
            case "large_settle_time": return `.large_settle_time(${roundOff(value as number, 0)}_ms)`;
            case "exit_error": return `.exit_error(${roundOff(value as number, 2)}_in)`;
            case "stall_timeout": return `.stall_timeout(${roundOff(value as number, 0)}_ms)`;
            case "timeout": return `.timeout(${roundOff(value as number, 0)}_ms)`;
            case "lead": return `.lead(${roundOff(value as number, 3)})`;
            case "max_slip": return `.max_slip(${roundOff(value as number, 3)})`;
            case "lookahead": return `.lookahead(${roundOff(value as number, 2)}_in)`;
            case "drive_direction":
                if (value === "fastest") return "";
                return `.direction(DriveDirection::${value === "reversed" ? "REV" : "FWD"})`;
        }
        return "";
    };

    const keyToAngular = (key: keyof revConstants, value: revConstants[keyof revConstants]): string => {
        switch (key) {
            case "max_speed": return `.angular_max_speed(${roundOff(value as number, 3)})`;
            case "kp": return `.angular_kp(${roundOff(value as number, 5)})`;
            case "ki": return `.angular_ki(${roundOff(value as number, 5)})`;
            case "kd": return `.angular_kd(${roundOff(value as number, 5)})`;
            case "kf": return `.angular_kf(${roundOff(value as number, 5)})`;
            case "start_i": return `.angular_start_i(${roundOff(value as number, 2)}_deg)`;
            case "slew": return `.angular_slew(${roundOff(value as number, 3)})`;
            case "settle_error": return isStrafePose ? `.angular_settle_error(${roundOff(value as number, 2)}_deg)` : "";
            case "settle_time": return isStrafePose ? `.angular_settle_time(${roundOff(value as number, 0)}_ms)` : "";
            case "large_settle_error": return isStrafePose ? `.angular_large_settle_error(${roundOff(value as number, 2)}_deg)` : "";
            case "large_settle_time": return isStrafePose ? `.angular_large_settle_time(${roundOff(value as number, 0)}_ms)` : "";
        }
        return "";
    };

    const keyToTranslational = (key: keyof revConstants, value: revConstants[keyof revConstants]): string => {
        switch (key) {
            case "kp": return `.translational_kp(${roundOff(value as number, 5)})`;
            case "ki": return `.translational_ki(${roundOff(value as number, 5)})`;
            case "kd": return `.translational_kd(${roundOff(value as number, 5)})`;
            case "kf": return `.translational_kf(${roundOff(value as number, 5)})`;
            case "start_i": return `.translational_start_i(${roundOff(value as number, 2)}_in)`;
        }
        return "";
    };

    const keyToTurn = (key: keyof revConstants, value: revConstants[keyof revConstants]): string => {
        switch (key) {
            case "max_speed": return `.max_speed(${roundOff(value as number, 3)})`;
            case "min_speed": return `.min_speed(${roundOff(value as number, 3)})`;
            case "kp": return `.angular_kp(${roundOff(value as number, 5)})`;
            case "ki": return `.angular_ki(${roundOff(value as number, 5)})`;
            case "kd": return `.angular_kd(${roundOff(value as number, 5)})`;
            case "kf": return `.angular_kf(${roundOff(value as number, 5)})`;
            case "start_i": return `.angular_start_i(${roundOff(value as number, 2)}_deg)`;
            case "slew": return `.angular_slew(${roundOff(value as number, 3)})`;
            case "settle_error": return `.settle_error(${roundOff(value as number, 2)}_deg)`;
            case "settle_time": return `.settle_time(${roundOff(value as number, 0)}_ms)`;
            case "large_settle_error": return `.large_settle_error(${roundOff(value as number, 2)}_deg)`;
            case "large_settle_time": return `.large_settle_time(${roundOff(value as number, 0)}_ms)`;
            case "exit_error": return `.exit_error(${roundOff(value as number, 2)}_deg)`;
            case "stall_timeout": return `.stall_timeout(${roundOff(value as number, 0)}_ms)`;
            case "timeout": return `.timeout(${roundOff(value as number, 0)}_ms)`;
            case "opposite_speed": return `.opposite_speed(${roundOff(value as number, 3)})`;
            case "turn_direction":
                if (value === "shortest") return "";
                return `.direction(TurnDirection::${value === "cw" ? "CW" : "CCW"})`;
        }
        return "";
    };

    const buildList = (
        kDef: revConstants,
        k: revConstants,
        mapper: (key: keyof revConstants, val: revConstants[keyof revConstants]) => string
    ): string[] => {
        const unequal = getUnequalKeys(kDef, k);
        const list: string[] = [];
        for (const key of Object.keys(unequal)) {
            const value = unequal[key as keyof revConstants];
            if (value === undefined) continue;
            const c = mapper(key as keyof revConstants, value);
            if (c !== "") list.push(c);
        }
        return list;
    };

    const isDrive = kDefault.length >= 2;
    const constantsList: string[] = [];

    if (isDrive) {
        constantsList.push(...buildList(kDefault[0], constants[0], keyToLateral));
        constantsList.push(...buildList(kDefault[1], constants[1], keyToAngular));
        if (kDefault.length >= 3 && constants[2]) {
            constantsList.push(...buildList(kDefault[2], constants[2], keyToTranslational));
        }
    } else {
        constantsList.push(...buildList(kDefault[0], constants[0], keyToTurn));
        if (pose?.angle && kind !== "angleSwing" && kind !== "angleTurn") {
            constantsList.push(`.offset(${roundOff(pose.angle, 2)}_deg)`);
        }
    }

    return constantsList.join("");
}

export function kRevParser(kDefault: revConstants[], kBuilderStr: string, kind: SegmentKind): [[revConstants, ...revConstants[]], Partial<Pose>?] {
    const constants = kDefault.map(k => ({ ...k })) as [revConstants, ...revConstants[]];
    if (!kBuilderStr.trim()) return [constants];
    void kind;

    const isDrive = kDefault.length >= 2;
    let poseAngle: number | undefined;

    for (const match of kBuilderStr.matchAll(/\.(\w+)\(([^)]*)\)/g)) {
        const key = match[1];
        const rawValue = match[2].trim();
        const num = parseFloat(rawValue);

        if (isDrive) {
            if (key === "max_speed") constants[0].max_speed = num;
            else if (key === "min_speed") constants[0].min_speed = num;
            else if (key === "lateral_kp") constants[0].kp = num;
            else if (key === "lateral_ki") constants[0].ki = num;
            else if (key === "lateral_kd") constants[0].kd = num;
            else if (key === "lateral_kf") constants[0].kf = num;
            else if (key === "lateral_start_i") constants[0].start_i = num;
            else if (key === "lateral_slew") constants[0].slew = num;
            else if (key === "settle_error") constants[0].settle_error = num;
            else if (key === "settle_time") constants[0].settle_time = num;
            else if (key === "large_settle_error") constants[0].large_settle_error = num;
            else if (key === "large_settle_time") constants[0].large_settle_time = num;
            else if (key === "exit_error") constants[0].exit_error = num;
            else if (key === "stall_timeout") constants[0].stall_timeout = num;
            else if (key === "timeout") constants[0].timeout = num;
            else if (key === "lead") constants[0].lead = num;
            else if (key === "max_slip") constants[0].max_slip = num;
            else if (key === "lookahead") constants[0].lookahead = num;
            else if (key === "direction") constants[0].drive_direction = DRIVE_DIRECTION_LITERALS[rawValue] ?? "fastest";
            else if (key === "angular_max_speed") constants[1].max_speed = num;
            else if (key === "angular_kp") constants[1].kp = num;
            else if (key === "angular_ki") constants[1].ki = num;
            else if (key === "angular_kd") constants[1].kd = num;
            else if (key === "angular_kf") constants[1].kf = num;
            else if (key === "angular_start_i") constants[1].start_i = num;
            else if (key === "angular_slew") constants[1].slew = num;
            else if (key === "angular_settle_error") constants[1].settle_error = num;
            else if (key === "angular_settle_time") constants[1].settle_time = num;
            else if (key === "angular_large_settle_error") constants[1].large_settle_error = num;
            else if (key === "angular_large_settle_time") constants[1].large_settle_time = num;
            else if (constants[2] && key === "translational_kp") constants[2].kp = num;
            else if (constants[2] && key === "translational_ki") constants[2].ki = num;
            else if (constants[2] && key === "translational_kd") constants[2].kd = num;
            else if (constants[2] && key === "translational_kf") constants[2].kf = num;
            else if (constants[2] && key === "translational_start_i") constants[2].start_i = num;
        } else {
            if (key === "max_speed") constants[0].max_speed = num;
            else if (key === "min_speed") constants[0].min_speed = num;
            else if (key === "angular_kp") constants[0].kp = num;
            else if (key === "angular_ki") constants[0].ki = num;
            else if (key === "angular_kd") constants[0].kd = num;
            else if (key === "angular_kf") constants[0].kf = num;
            else if (key === "angular_start_i") constants[0].start_i = num;
            else if (key === "angular_slew") constants[0].slew = num;
            else if (key === "settle_error") constants[0].settle_error = num;
            else if (key === "settle_time") constants[0].settle_time = num;
            else if (key === "large_settle_error") constants[0].large_settle_error = num;
            else if (key === "large_settle_time") constants[0].large_settle_time = num;
            else if (key === "exit_error") constants[0].exit_error = num;
            else if (key === "stall_timeout") constants[0].stall_timeout = num;
            else if (key === "timeout") constants[0].timeout = num;
            else if (key === "opposite_speed") constants[0].opposite_speed = num;
            else if (key === "direction") constants[0].turn_direction = TURN_DIRECTION_LITERALS[rawValue] ?? "shortest";
            else if (key === "offset") poseAngle = num;
        }
    }

    return poseAngle !== undefined ? [constants, { angle: poseAngle }] : [constants];
}
