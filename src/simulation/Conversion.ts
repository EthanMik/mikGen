import { SIM_CONSTANTS } from "../core/ComputePathSim";
import type { Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";
import type { Format } from "../hooks/useFormat";
import type { FormatDef, SegmentDef, SegmentKind, SimFn } from "./FormatDefinition";
import { LemLibToString } from "./LemLibSim/LemLibToString";
import { driveToPose } from "./mikLibSim/DriveMotions/DriveToPose";
import { mikLibToString } from "./mikLibSim/mikLibToString";
import { revToString } from "./ReveiLibSim/ReveilLibToString";
import { RevMecanumToString } from "./RevMecanumSim/RevMecanumToString";


// export function convertPathToSim(path: Path, format: Format): ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] {
//     if (format === "mikLib") {
//         return mikLibToSim(path);
//     }
//     if (format === "ReveilLib") {
//         const out = reveilLibToSim(path);
//         return out;
//     }
//     if (format === "LemLib") {
//         const out = LemLibToSim(path);
//         return out;
//     }
//     if (format === "RevMecanum") {
//         const out = RevMecanumToSim(path);
//         return out;
//     }

//     const emptyAuton: ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] = [];
//     return emptyAuton;
// }

export function convertPathToString(path: Path, format: Format, selected = false) {
    if (format === "mikLib") {
        return mikLibToString(path, selected);
    }
    if (format === "ReveilLib") {
        return revToString(path, selected);
    }
    if (format === "LemLib") {
        return LemLibToString(path, selected);
    }
    if (format === "RevMecanum") {
        return RevMecanumToString(path, selected);
    }
}

const LOG_SEGMENT_START_AND_END = true;
const LOG_ROBOT_STATE = true;
const LOG_SIMULATION_NUMBER = true;

SIM_CONSTANTS.seconds = 99;
let currentPathTime = -2 / 60;
let simComputed = 0;

export function convertPathToSim<F extends Format, Segs extends Record<SegmentKind, SegmentDef<F>>>(formatDef: FormatDef<F, Segs>, path: Path): SimFn[] {
    const auton: SimFn[] = [];

    for (let idx = 0; idx < path.segments.length; idx++) {
        const seg = path.segments[idx];
        const x = seg.pose.x ?? 0;
        const y = seg.pose.y ?? 0;
        const angle = seg.pose.angle ?? 0;
        const k = seg.constants as typeof formatDef.constants;
        const kind = seg.kind as SegmentKind;

        if (idx === 0) {
            auton.push(

                formatDef.segments[kind].toSim(x, y, angle, k)
            );
            continue;
        }

        let started = false;
        let targetDist = 0;

        switch (seg.kind) {
            case "poseDrive":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        return [output, "poseDrive", targetDist];
                    }
                );
                break;

            case "pointDrive":
                auton.push(
                    (robot: Robot, dt: number): [boolean, SegmentKind, number] => {
                        if (!started) {
                            DEBUG_printSegmentStart(idx, formatDef, kind);
                            targetDist = Math.hypot(x - robot.getX(), y - robot.getY());
                            started = true;
                        }
                        DEBUG_printRobotState(robot, dt);
                        const output = driveToPose(robot, dt, x, y, angle, k);
                        if (output) DEBUG_printSegmentEnd(idx, formatDef, kind);
                        return [output, "poseDrive", targetDist];
                    }
                );
                break;
        }
    }
}

function DEBUG_printSegmentStart<F extends Format>(idx: number, formatDef: FormatDef<F>, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cStarting ${formatDef.segments[kind]?.name} ${idx}`, "color: lime; font-weight: bold");
}

function DEBUG_printSegmentEnd<F extends Format>(idx: number, formatDef: FormatDef<F>, kind: SegmentKind) {
    if (!LOG_SEGMENT_START_AND_END) return;
    console.log(`%cEnding ${formatDef.segments[kind]?.name} ${idx}`, "color: #ff6b6b; font-weight: bold");
}

function DEBUG_printRobotState(robot: Robot, dt: number) {
    if (!LOG_ROBOT_STATE) return;
    currentPathTime += dt;
    console.log(`%cx: ${robot.getX().toFixed(2)}, y: ${robot.getY().toFixed(2)}, θ: ${robot.getAngle().toFixed(2)} dt: ${currentPathTime.toFixed(2)}s`, "color: cyan");
}

function DEBUG_printSimulationStart() {
    if (!LOG_SIMULATION_NUMBER) return;
    simComputed += 1;
    console.log(`%cSTARTING SIMULATION COMPUTE #${simComputed}`, "color: violet; font-weight: bold");
}
