import type { FormatDef, NumberInputGroup } from "../FormatDefinition";
import { kMikDrive, kMikHeading, mikDriveExitConditionsSettings, mikLibDef, mikPIDConstantsSettings } from "../mikLibSim/MikConstants";
import { holonomic_follow_path, reset_holonomic_follow_path } from "./DriveMotions/HolonomicFollowPath";
import { holonomic_to_pose, reset_holonomic_to_pose } from "./DriveMotions/HolonomicToPose";
import { strafe_distance } from "./DriveMotions/StrafeDistance";

/** Exit conditions and PID groups are shared by every holonomic drive segment. */
const holonomicNumberInputs = [
    {
        constantsIdx: 0, headerName: "Exit Conditions", fields: [
            { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
            { key: "min_voltage", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
            { key: "exit_error", units: "in", label: "Exit Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        ]
    },
    {
        constantsIdx: 0, headerName: "Drive Constants", fields: [
            ...mikPIDConstantsSettings,
            { key: "settle_error", label: "Settle Error", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
            { key: "settle_time", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 1 } },
        ]
    },
    {
        constantsIdx: 1, headerName: "Heading Constants", fields: [
            ...mikPIDConstantsSettings,
            { key: "settle_error", label: "Settle Error", units: "in", input: { bounds: [0, 100], stepSize: 1, roundTo: 1 } },
            { key: "settle_time", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 1 } },
        ]
    },
] satisfies NumberInputGroup<"Holonomic">[];

export const holonomicDef = {
    ...mikLibDef,
    formatPathName: "Holonomic Path",
    segments: {
        ...mikLibDef.segments,
        poseDrive: {
            name: "Holonomic to Pose",
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.holonomic_to_pose(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => holonomic_to_pose(robot, dt, x, y, angle ?? 0, constants),
            simReset: reset_holonomic_to_pose,
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [...holonomicNumberInputs],
        },

        bezierCurve: {
            // Inherits the bezier control handles; the drive direction cycle is meaningless on mecanum
            ...mikLibDef.segments.bezierCurve,
            name: "Holonomic Follow Path",
            defaults: [kMikDrive, kMikHeading],
            // Mecanum holds a heading through the curve, so a new one starts square rather than tangential
            defaultHeading: 0,
            toStringTemplate: "chassis.holonomic_follow_path({${c1x}, ${c1y}}, {${c2x}, ${c2y}}, {${x}, ${y}}, ${kBuilder});",
            simFn: (robot, dt, _x, _y, angle, constants, points) => holonomic_follow_path(robot, dt, points ?? [], angle, constants),
            simReset: reset_holonomic_follow_path,
            cycleButtons: [],
            numberInputs: [...holonomicNumberInputs],
        },

        strafeDrive: {
            name: "Strafe Distance",
            defaults: [kMikDrive, kMikHeading],
            toStringTemplate: "chassis.strafe_distance(${distance}, ${kBuilder});",
            simFn: (robot, dt, distance, _y, angle, constants) => strafe_distance(robot, dt, distance, angle, constants),
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...mikDriveExitConditionsSettings,] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...mikPIDConstantsSettings,] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...mikPIDConstantsSettings,] },
            ],
        },
    },
} satisfies FormatDef<"Holonomic">;