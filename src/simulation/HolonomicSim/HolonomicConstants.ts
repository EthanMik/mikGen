import type { FormatDef } from "../FormatDefinition";
import { kMikDrive, kMikHeading, mikDriveExitConditionsSettings, mikLibDef, mikPIDConstantsSettings } from "../mikLibSim/MikConstants";
import { holonomic_to_pose } from "./DriveMotions/HolonomicToPose";
import { strafe_distance } from "./DriveMotions/StrafeDistance";

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
            slider: { key: "max_voltage", bounds: [0, 12], roundTo: 0.1, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
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
            ],
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