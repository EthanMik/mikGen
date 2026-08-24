import type { FormatDef } from "../FormatDefinition";
import {
    kRevDrive, kRevHeading, kRevTranslational, reveilLibDef,
    revAngularPIDSettings, revDriveExitConditionsSettings, revLateralPIDSettings,
    revTranslationalPIDSettings,
} from "../RevSim/RevConstants";
import { reset_strafe_to_pose, strafe_to_pose } from "./DriveMotions/StrafeToPose";
import { reset_strafe_distance, strafe_distance } from "./DriveMotions/StrafeDistance";

export const reveilLibHolonomicDef = {
    ...reveilLibDef,
    formatPathName: "ReveilLib Holonomic Path",
    segments: {
        ...reveilLibDef.segments,

        poseDrive2: {
            name: "Strafe to Pose",
            defaults: [kRevDrive, kRevHeading, kRevTranslational],
            toStringTemplate: "reckless.go(StrafeToPose({${x}_in, ${y}_in, ${angle}_deg})${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => strafe_to_pose(robot, dt, x, y, angle ?? 0, constants),
            simReset: reset_strafe_to_pose,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revDriveExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...revLateralPIDSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...revAngularPIDSettings] },
                { constantsIdx: 2, headerName: "Translational Constants", fields: [...revTranslationalPIDSettings] },
            ],
        },

        strafeDrive: {
            name: "Strafe Distance",
            defaults: [kRevDrive, kRevHeading],
            toStringTemplate: "reckless.go(StrafeDistance(${distance}_in, ${angle}_deg)${kBuilder});",
            simFn: (robot, dt, distance, _y, angle, constants) => strafe_distance(robot, dt, distance, angle, constants),
            simReset: reset_strafe_distance,
            slider: { key: "max_speed", bounds: [0, 1], roundTo: 0.01, constantsIdx: 0 },
            cycleButtons: [],
            numberInputs: [
                { constantsIdx: 0, headerName: "Exit Conditions", fields: [...revDriveExitConditionsSettings] },
                { constantsIdx: 0, headerName: "Drive Constants", fields: [...revLateralPIDSettings] },
                { constantsIdx: 1, headerName: "Heading Constants", fields: [...revAngularPIDSettings] },
            ],
        },
    },
} satisfies FormatDef<"ReveilLib Holonomic">;
