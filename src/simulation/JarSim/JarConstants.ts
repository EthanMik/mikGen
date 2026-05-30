import type { CycleButtonField, FormatDef, NumberInputGroup, SegmentKind } from "../FormatDefinition";
import type { Pose } from "../../core/Types/Pose";
import { roundOff } from "../../core/Util";
import leftswing from "../../assets/leftswing.svg";
import rightswing from "../../assets/rightswing.svg";
import { drive_distance, drive_to_point, drive_to_pose, swing_to_angle, turn_to_angle, turn_to_point } from "./drive";

export interface JarConstants {
    max_voltage: number;
    min_voltage: number;

    kp: number,
    ki: number,
    kd: number,
    starti: number,

    settle_error: number,
    settle_time: number,
    timeout: number

    setback: number,
    lead: number,

    swing_direction: "left" | "right",
}

export const kJarDrive: JarConstants = {
    max_voltage: 8,
    min_voltage: 0,

    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,

    settle_error: 3,
    settle_time: 300,
    timeout: 5000,

    setback: 0,
    lead: 0.5,
    swing_direction: "left",
}

export const kJarHeading: JarConstants = {
    max_voltage: 10,
    min_voltage: 0,

    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,

    settle_error: 0,
    settle_time: 0,
    timeout: 0,

    setback: 0,
    lead: 0.5,
    swing_direction: "left",
}

export const kJarTurn: JarConstants = {
    max_voltage: 12,
    min_voltage: 0,

    kp: .4,
    ki: 0.03,
    kd: 3,
    starti: 15,

    settle_error: 1,
    settle_time: 300,
    timeout: 3000,

    setback: 0,
    lead: 0.5,
    swing_direction: "left",
}

export const kJarSwing: JarConstants = {
    max_voltage: 12,
    min_voltage: 0,

    kp: .4,
    ki: 0.01,
    kd: 2,
    starti: 15,

    settle_error: 1,
    settle_time: 300,
    timeout: 3000,

    setback: 0,
    lead: 0.5,
    swing_direction: "left",
}

type Fields = NumberInputGroup<"JAR-Template">["fields"];

const JarTurnExitConditions: Fields = [
    { key: "settle_error", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
    { key: "settle_time", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
    { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
];

const JarDriveExitConditions: Fields = [
    ...JarTurnExitConditions,
    { key: "min_voltage", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
]

const JarPIDConstantsSettings: Fields = [
    { key: "max_voltage", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
    { key: "kp", label: "kP", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "ki", label: "kI", units: "", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
    { key: "kd", label: "kD", units: "", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
    { key: "starti", units: "in", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
];

type CycleButton = Omit<CycleButtonField<"JAR-Template">, "constantsIdx">;

const swingDirectionButton: CycleButton = {
    key: "swing_direction",
    keyValues: [
        { srcImg: rightswing, value: "right" },
        { srcImg: leftswing, value: "left" },
    ],
};

export const JarTemplateDef = {
    constants: [kJarDrive],
    kMaxSpeed: 12,
    formatPathName: "JAR-Template Path",
    kBuilder: kJarBuilder,
    kParser: kJarParser,

    segments: {
        start: {
            name: "Start",
            defaults: [kJarDrive],
            toStringTemplate: "chassis.set_coordinates(${x}, ${y}, ${angle});",
            simFn: (robot, _dt, x, y, angle) => robot.setPose(x, y, angle ?? 0),
            cycleButtons: [],
            numberInputs: [],
        },

        wait: {
            name: "Wait",
            defaults: [kJarDrive],
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
            defaults: [kJarDrive, kJarHeading],
            toStringTemplate: "chassis.drive_to_pose(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => drive_to_pose(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                {
                    constantsIdx: 0, headerName: "Exit Conditions", fields: [...JarDriveExitConditions]
                },
                {
                    constantsIdx: 0, headerName: "Drive Constants", fields: [
                        ...JarPIDConstantsSettings,
                        { key: "setback", label: "Setback", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
                        { key: "lead", label: "Lead", units: "in", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 1 } },
                    ]
                },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...JarPIDConstantsSettings] },
            ],
        },

        distanceDrive: {
            name: "Drive to Distance",
            defaults: [kJarDrive, kJarHeading],
            toStringTemplate: "chassis.drive_distance(${distance}, ${kBuilder});",
            simFn: (robot, dt, distance, _y, angle, constants) => drive_distance(robot, dt, distance, angle, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...JarDriveExitConditions] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...JarPIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...JarPIDConstantsSettings] },
            ],
        },

        pointDrive: {
            name: "Drive to Point",
            defaults: [kJarDrive, kJarHeading],
            toStringTemplate: "chassis.drive_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, _angle, constants) => drive_to_point(robot, dt, x, y, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...JarDriveExitConditions] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...JarPIDConstantsSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...JarPIDConstantsSettings] },
            ],
        },

        pointTurn: {
            name: "Turn to Point",
            defaults: [kJarTurn],
            toStringTemplate: "chassis.turn_to_point(${x}, ${y}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => turn_to_point(robot, dt, x, y, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...JarTurnExitConditions] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...JarPIDConstantsSettings] },
            ],
        },

        angleTurn: {
            name: "Turn to Angle",
            defaults: [kJarTurn],
            toStringTemplate: "chassis.turn_to_angle(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => turn_to_angle(robot, dt, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...JarTurnExitConditions] },
                { constantsIdx: 0, headerName: "Turn Constants", fields: [...JarPIDConstantsSettings] },
            ],
        },

        angleSwing: {
            name: "Swing to Angle",
            defaults: [kJarSwing],
            toStringTemplate: "chassis.${swing_direction}_swing_to_angle(${angle}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants) => swing_to_angle(robot, dt, angle ?? 0, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [
                { constantsIdx: 0, ...swingDirectionButton },
            ],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...JarTurnExitConditions] },
                { constantsIdx: 0, headerName: "Swing Constants", fields: [...JarPIDConstantsSettings] },
            ],
        },

        pointSwing: {
            castTo: "angleSwing"
        },

        strafeDrive: {
            castTo: "distanceDrive"
        }


    },
} satisfies FormatDef<"JAR-Template">;

function kJarBuilder(defaultConstants: JarConstants[], constants: JarConstants[], pose?: Pose, kind?: SegmentKind): string {
    const driveDefault = defaultConstants[0];
    const driveConstants = constants[0];

    const pidKeys: (keyof JarConstants)[] = ['kp', 'ki', 'kd', 'starti'];
    const exitKeys: (keyof JarConstants)[] = ['settle_error', 'settle_time', 'timeout'];

    function anyKeyDiffers(defaults: JarConstants, current: JarConstants, keys: (keyof JarConstants)[]): boolean {
        return keys.some(key => defaults[key] !== current[key]);
    }

    function formatDrivePID(k: JarConstants): string {
        return `${roundOff(k.kp, 3)}, ${roundOff(k.ki, 5)}, ${roundOff(k.kd, 3)}, ${roundOff(k.starti, 2)}`;
    }

    function formatExitConditions(k: JarConstants): string {
        return `${roundOff(k.settle_error, 2)}, ${roundOff(k.settle_time, 0)}, ${roundOff(k.timeout, 0)}`;
    }

    // turn_to_angle overloads:
    // (angle)
    // (angle, max_voltage)
    // (angle, max_voltage, settle_error, settle_time, timeout)
    // (angle, max_voltage, settle_error, settle_time, timeout, kp, ki, kd, starti)
    if (kind === 'angleTurn') {
        const pidChanged = anyKeyDiffers(driveDefault, driveConstants, pidKeys);
        const exitChanged = anyKeyDiffers(driveDefault, driveConstants, exitKeys);
        const voltageChanged = driveDefault.max_voltage !== driveConstants.max_voltage;

        if (pidChanged)
            return `${roundOff(driveConstants.max_voltage, 1)}, ${formatExitConditions(driveConstants)}, ${formatDrivePID(driveConstants)}`;
        if (exitChanged)
            return `${roundOff(driveConstants.max_voltage, 1)}, ${formatExitConditions(driveConstants)}`;
        if (voltageChanged)
            return `${roundOff(driveConstants.max_voltage, 1)}`;
        return "";
    }

    // turn_to_point overloads:
    // (x, y)
    // (x, y, extra_angle)
    // (x, y, extra_angle, max_voltage, settle_error, settle_time, timeout)
    // (x, y, extra_angle, max_voltage, settle_error, settle_time, timeout, kp, ki, kd, starti)
    if (kind === 'pointTurn') {
        const extraAngle = pose?.angle ?? 0;
        const pidChanged = anyKeyDiffers(driveDefault, driveConstants, pidKeys);
        const exitOrVoltageChanged = anyKeyDiffers(driveDefault, driveConstants, exitKeys) || driveDefault.max_voltage !== driveConstants.max_voltage;

        if (pidChanged)
            return `${roundOff(extraAngle, 2)}, ${roundOff(driveConstants.max_voltage, 1)}, ${formatExitConditions(driveConstants)}, ${formatDrivePID(driveConstants)}`;
        if (exitOrVoltageChanged)
            return `${roundOff(extraAngle, 2)}, ${roundOff(driveConstants.max_voltage, 1)}, ${formatExitConditions(driveConstants)}`;
        if (extraAngle !== 0)
            return `${roundOff(extraAngle, 2)}`;
        return "";
    }

    // left/right_swing_to_angle overloads:
    // (angle)
    // (angle, max_voltage, settle_error, settle_time, timeout, kp, ki, kd, starti)
    if (kind === 'angleSwing') {
        const anyConstantChanged = anyKeyDiffers(driveDefault, driveConstants, [...pidKeys, ...exitKeys]) || driveDefault.max_voltage !== driveConstants.max_voltage;

        if (anyConstantChanged)
            return `${roundOff(driveConstants.max_voltage, 1)}, ${formatExitConditions(driveConstants)}, ${formatDrivePID(driveConstants)}`;
        return "";
    }

    // All drive functions have two constant groups: drive (k[0]) and heading (k[1])
    if (!defaultConstants[1] || !constants[1]) return "";
    const headingDefault = defaultConstants[1];
    const headingConstants = constants[1];

    const anyPIDChanged = anyKeyDiffers(driveDefault, driveConstants, pidKeys) || anyKeyDiffers(headingDefault, headingConstants, pidKeys);
    const exitConditionsChanged = anyKeyDiffers(driveDefault, driveConstants, exitKeys);
    const anyVoltageChanged = driveDefault.max_voltage !== driveConstants.max_voltage || headingDefault.max_voltage !== headingConstants.max_voltage;

    function formatBothPIDs(): string {
        return `${formatDrivePID(driveConstants)}, ${formatDrivePID(headingConstants)}`;
    }

    function formatDriveVoltages(): string {
        return `${roundOff(driveConstants.max_voltage, 1)}, ${roundOff(headingConstants.max_voltage, 1)}`;
    }

    // drive_to_pose overloads:
    // (x, y, angle)
    // (x, y, angle, lead, setback, min_voltage)
    // (x, y, angle, lead, setback, min_voltage, max_voltage, heading_max_voltage)
    // (x, y, angle, lead, setback, min_voltage, max_voltage, heading_max_voltage, settle_error, settle_time, timeout)
    // (x, y, angle, lead, setback, min_voltage, max_voltage, heading_max_voltage, settle_error, settle_time, timeout, drive_kp, drive_ki, drive_kd, drive_starti, heading_kp, heading_ki, heading_kd, heading_starti)
    if (kind === 'poseDrive') {
        const poseParamsChanged = driveDefault.lead !== driveConstants.lead
            || driveDefault.setback !== driveConstants.setback
            || driveDefault.min_voltage !== driveConstants.min_voltage;

        const poseParams = `${roundOff(driveConstants.lead, 1)}, ${roundOff(driveConstants.setback, 1)}, ${roundOff(driveConstants.min_voltage, 1)}`;

        if (anyPIDChanged)
            return `${poseParams}, ${formatDriveVoltages()}, ${formatExitConditions(driveConstants)}, ${formatBothPIDs()}`;
        if (exitConditionsChanged)
            return `${poseParams}, ${formatDriveVoltages()}, ${formatExitConditions(driveConstants)}`;
        if (anyVoltageChanged)
            return `${poseParams}, ${formatDriveVoltages()}`;
        if (poseParamsChanged)
            return poseParams;
        return "";
    }

    // drive_distance overloads:
    // (distance)
    // (distance, heading)
    // (distance, heading, max_voltage, heading_max_voltage)
    // (distance, heading, max_voltage, heading_max_voltage, settle_error, settle_time, timeout)
    // (distance, heading, max_voltage, heading_max_voltage, settle_error, settle_time, timeout, drive_kp, drive_ki, drive_kd, drive_starti, heading_kp, heading_ki, heading_kd, heading_starti)
    if (kind === 'distanceDrive') {
        const heading = pose?.angle ?? null;

        if (anyPIDChanged)
            return `${roundOff(heading ?? 0, 2)}, ${formatDriveVoltages()}, ${formatExitConditions(driveConstants)}, ${formatBothPIDs()}`;
        if (exitConditionsChanged)
            return `${roundOff(heading ?? 0, 2)}, ${formatDriveVoltages()}, ${formatExitConditions(driveConstants)}`;
        if (anyVoltageChanged)
            return `${roundOff(heading ?? 0, 2)}, ${formatDriveVoltages()}`;
        if (heading !== null)
            return `${roundOff(heading, 2)}`;
        return "";
    }

    // drive_to_point overloads:
    // (x, y)
    // (x, y, min_voltage, max_voltage, heading_max_voltage)
    // (x, y, min_voltage, max_voltage, heading_max_voltage, settle_error, settle_time, timeout)
    // (x, y, min_voltage, max_voltage, heading_max_voltage, settle_error, settle_time, timeout, drive_kp, drive_ki, drive_kd, drive_starti, heading_kp, heading_ki, heading_kd, heading_starti)
    if (kind === 'pointDrive') {
        const minOrMaxVoltageChanged = anyVoltageChanged || driveDefault.min_voltage !== driveConstants.min_voltage;
        const voltageParams = `${roundOff(driveConstants.min_voltage, 1)}, ${formatDriveVoltages()}`;

        if (anyPIDChanged)
            return `${voltageParams}, ${formatExitConditions(driveConstants)}, ${formatBothPIDs()}`;
        if (exitConditionsChanged)
            return `${voltageParams}, ${formatExitConditions(driveConstants)}`;
        if (minOrMaxVoltageChanged)
            return voltageParams;
        return "";
    }

    return "";
}

function kJarParser(kDefault: JarConstants[], kBuilderStr: string, kind: SegmentKind): [[JarConstants, ...JarConstants[]], Partial<Pose>?] {
    const constants = kDefault.map(k => ({ ...k })) as [JarConstants, ...JarConstants[]];
    if (!kBuilderStr.trim()) return [constants];

    const vals = kBuilderStr.split(',').map(s => parseFloat(s.trim()));
    const n = vals.length;

    if (kind === 'angleTurn') {
        // (max_voltage) | (max_voltage, settle_error, settle_time, timeout) | (+kp, ki, kd, starti)
        if (n >= 1) constants[0].max_voltage = vals[0];
        if (n >= 4) { constants[0].settle_error = vals[1]; constants[0].settle_time = vals[2]; constants[0].timeout = vals[3]; }
        if (n >= 8) { constants[0].kp = vals[4]; constants[0].ki = vals[5]; constants[0].kd = vals[6]; constants[0].starti = vals[7]; }
        return [constants];
    }

    if (kind === 'pointTurn') {
        // (extra_angle) | (extra_angle, max_voltage, settle_error, settle_time, timeout) | (+kp, ki, kd, starti)
        const pose: Partial<Pose> = { angle: vals[0] };
        if (n >= 2) constants[0].max_voltage = vals[1];
        if (n >= 5) { constants[0].settle_error = vals[2]; constants[0].settle_time = vals[3]; constants[0].timeout = vals[4]; }
        if (n >= 9) { constants[0].kp = vals[5]; constants[0].ki = vals[6]; constants[0].kd = vals[7]; constants[0].starti = vals[8]; }
        return [constants, pose];
    }

    if (kind === 'angleSwing') {
        // (max_voltage, settle_error, settle_time, timeout, kp, ki, kd, starti)
        if (n >= 8) {
            constants[0].max_voltage = vals[0];
            constants[0].settle_error = vals[1]; constants[0].settle_time = vals[2]; constants[0].timeout = vals[3];
            constants[0].kp = vals[4]; constants[0].ki = vals[5]; constants[0].kd = vals[6]; constants[0].starti = vals[7];
        }
        return [constants];
    }

    if (kind === 'poseDrive') {
        // (lead, setback, min_voltage) | (+max_voltage, heading_max_voltage) | (+settle_error, settle_time, timeout) | (+drive pid x4, heading pid x4)
        if (n >= 3) { constants[0].lead = vals[0]; constants[0].setback = vals[1]; constants[0].min_voltage = vals[2]; }
        if (n >= 5) { constants[0].max_voltage = vals[3]; constants[1].max_voltage = vals[4]; }
        if (n >= 8) { constants[0].settle_error = vals[5]; constants[0].settle_time = vals[6]; constants[0].timeout = vals[7]; }
        if (n >= 16) {
            constants[0].kp = vals[8]; constants[0].ki = vals[9]; constants[0].kd = vals[10]; constants[0].starti = vals[11];
            constants[1].kp = vals[12]; constants[1].ki = vals[13]; constants[1].kd = vals[14]; constants[1].starti = vals[15];
        }
        return [constants];
    }

    if (kind === 'distanceDrive') {
        // (heading) | (heading, max_voltage, heading_max_voltage) | (+settle_error, settle_time, timeout) | (+drive pid x4, heading pid x4)
        const pose: Partial<Pose> = { angle: vals[0] };
        if (n >= 3) { constants[0].max_voltage = vals[1]; constants[1].max_voltage = vals[2]; }
        if (n >= 6) { constants[0].settle_error = vals[3]; constants[0].settle_time = vals[4]; constants[0].timeout = vals[5]; }
        if (n >= 14) {
            constants[0].kp = vals[6]; constants[0].ki = vals[7]; constants[0].kd = vals[8]; constants[0].starti = vals[9];
            constants[1].kp = vals[10]; constants[1].ki = vals[11]; constants[1].kd = vals[12]; constants[1].starti = vals[13];
        }
        return [constants, pose];
    }

    if (kind === 'pointDrive') {
        // (min_voltage, max_voltage, heading_max_voltage) | (+settle_error, settle_time, timeout) | (+drive pid x4, heading pid x4)
        if (n >= 3) { constants[0].min_voltage = vals[0]; constants[0].max_voltage = vals[1]; constants[1].max_voltage = vals[2]; }
        if (n >= 6) { constants[0].settle_error = vals[3]; constants[0].settle_time = vals[4]; constants[0].timeout = vals[5]; }
        if (n >= 14) {
            constants[0].kp = vals[6]; constants[0].ki = vals[7]; constants[0].kd = vals[8]; constants[0].starti = vals[9];
            constants[1].kp = vals[10]; constants[1].ki = vals[11]; constants[1].kd = vals[12]; constants[1].starti = vals[13];
        }
        return [constants];
    }

    return [constants];
}