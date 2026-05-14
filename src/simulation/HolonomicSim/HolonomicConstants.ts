import type { FormatDef } from "../FormatDefinition";
import { mikLibDef } from "../mikLibSim/MikConstants";
import { holonomic_to_pose } from "./DriveMotions/HolonomicToPose";
import { strafe_distance } from "./DriveMotions/StrafeDistance";

export const holonomicDef = {
    ...mikLibDef,
    formatPathName: "Holonomic Path",
    segments: {
        ...mikLibDef.segments,
        poseDrive: {
            ...mikLibDef.segments.poseDrive,
            name: "Holonomic to Pose",
            toStringTemplate: "chassis.holonomic_to_pose(${x}, ${y}, ${angle}, ${kBuilder});",
            simFn: (robot, dt, x, y, angle, constants) => holonomic_to_pose(robot, dt, x, y, angle ?? 0, constants),
        },
        distanceDrive: {
            ...mikLibDef.segments.distanceDrive,
            exists: true,
            name: "Strafe Distance",
            simFn: (robot, dt, x, y, _angle, constants) => strafe_distance(robot, dt, x, y, constants),
        },
    },
} satisfies FormatDef<"Holonomic">;