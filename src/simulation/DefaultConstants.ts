import type { SetStateAction } from "react";
import type { ConstantListField } from "../components/PathMenu/MotionList";
import type { Format } from "../hooks/appStateDefaults";
import { getmikLibConstantsConfig, getMikLibDirectionConfig } from "./mikLibSim/MikConstantsConfig";
import type { ConstantsByFormat, SegmentKind } from "../core/Types/Segment";
import type { Path } from "../core/Types/Path";
import type { CycleImageButtonProps } from "../components/Util/CycleButton";
import { getRevConstantsConfig } from "./ReveiLibSim/RevConstantsConfig";
import { INITIAL_DEFAULTS, type DefaultConstant, globalDefaultsStore, getDefaultConstants } from "./InitialDefaults";
import { getLemLibConstantsConfig, getLemLibDirectionConfig } from "./LemLibSim/LemConstantsConfig";
import { getRevMecanumConstantsConfig, getRevMecanumDirectionConfig } from "./RevMecanumSim/RevMecamumConstantsConfig";

export { INITIAL_DEFAULTS, type DefaultConstant, globalDefaultsStore, getDefaultConstants };

export function updateDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K, patch: Partial<ConstantsByFormat[F][K]>) {
    globalDefaultsStore.setState((prev) => {
        const currentFormatDefaults = prev[format];
        const currentSegmentDefaults = currentFormatDefaults[kind];

        const merged = { ...currentSegmentDefaults as object } as Record<string, unknown>;
        const updates = patch as Record<string, unknown>;

        for (const key of Object.keys(updates)) {
            const pv = updates[key];
            const ev = merged[key];
            merged[key] = (typeof pv === 'object' && pv !== null && typeof ev === 'object' && ev !== null)
                ? { ...ev as object, ...pv as object }
                : pv;
        }

        return {
            ...prev,
            [format]: {
                ...prev[format],
                [kind]: merged as ConstantsByFormat[F][K]
            }
        };
    });
}


export function updatePathConstants(
    setPath: React.Dispatch<React.SetStateAction<Path>>,
    segmentId: string,
    partial: any
) {
    setPath((prev) => ({
        ...prev,
        segments: prev.segments.map((s) => {
            if (s.id !== segmentId) return s;

            const key = Object.keys(partial)[0];

            if (key && typeof partial[key] === 'object' && !Array.isArray(partial[key])) {
                return {
                    ...s,
                    constants: {
                        ...s.constants,
                        [key]: {
                            ...(s.constants as any)[key],
                            ...partial[key],
                        },
                    } as any,
                };
            }

            return {
                ...s,
                constants: {
                    ...s.constants,
                    ...partial,
                } as any,
            };
        }),
    }));
}

export function updatePathConstantsByKind(
    setPath: React.Dispatch<React.SetStateAction<Path>>,
    segmentKind: SegmentKind,
    partial: any
) {
    setPath((prev) => ({
        ...prev,
        segments: prev.segments.map((s) => {
            if (s.kind !== segmentKind) return s;

            const key = Object.keys(partial)[0];

            if (key && typeof partial[key] === 'object' && !Array.isArray(partial[key])) {
                return {
                    ...s,
                    constants: {
                        ...s.constants,
                        [key]: {
                            ...(s.constants as any)[key],
                            ...partial[key],
                        },
                    } as any,
                };
            }

            return {
                ...s,
                constants: {
                    ...s.constants,
                    ...partial,
                } as any,
            };
        }),
    }));
}

// export function getFormatConstantsConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): ConstantListField[] | undefined {
//     switch (format) {
//         case "mikLib": return getmikLibConstantsConfig(format, path, setPath, segmentId);
//         case "ReveilLib": return getRevConstantsConfig(format, path, setPath, segmentId);
//         case "LemLib": return getLemLibConstantsConfig(format, path, setPath, segmentId);
//         case "RevMecanum": return getRevMecanumConstantsConfig(format, path, setPath, segmentId);
//     }
//     return [];
// }

// export function getFormatDirectionConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): CycleImageButtonProps[] | undefined {
//     switch (format) {
//         case "mikLib": return getMikLibDirectionConfig(path, setPath, segmentId);
//         case "LemLib": return getLemLibDirectionConfig(path, setPath, segmentId);
//         case "RevMecanum": return getRevMecanumDirectionConfig(path, setPath, segmentId);
//     }
//     return [];
// }

// export function getFormatPathName(format: Format) {
//     switch (format) {
//         case "mikLib": return "mikLib Path";
//         case "ReveilLib": return "ReveilLib Path";
//         case "JAR-Template": return "JAR-Template Path";
//         case "LemLib": return "LemLib Path";
//         case "RW-Template": return "RW-Template Path"
//         case "RevMecanum": return "RevMecanum Path";
//     }
// }

// export function getFormatSpeed(format: Format): number {
//     switch (format) {
//         case "mikLib": return 12;
//         case "ReveilLib": return 1;
//         case "JAR-Template": return 12;
//         case "RW-Template": return 12;
//         case "LemLib": return 127;
//         case "RevMecanum": return 12;
//     }
// }

// export function segmentAllowed(format: Format, segment: SegmentKind): boolean {
//     switch (format) {
//         case "mikLib": {
//             switch (segment) {
//                 case "pointDrive": return true;
//                 case "poseDrive": return true;
//                 case "pointTurn": return true;
//                 case "angleTurn": return true;
//                 case "angleSwing": return true;
//                 case "pointSwing": return true;
//                 case "distanceDrive": return true;
//             }
//             break;
//         }
//         case "ReveilLib": {
//             switch (segment) {
//                 case "pointDrive": return true;
//                 case "poseDrive": return true;
//                 case "pointTurn": return true;
//                 case "angleTurn": return true;
//                 case "angleSwing": return false;
//                 case "pointSwing": return false;
//                 case "distanceDrive": return false;
//             }
//             break;
//         }
//         case "RevMecanum": {
//             switch (segment) {
//                 case "pointDrive": return true;
//                 case "poseDrive": return true;
//                 case "pointTurn": return true;
//                 case "angleTurn": return true;
//                 case "angleSwing": return false;
//                 case "pointSwing": return false;
//                 case "distanceDrive": return false;
//             }
//             break;
//         }
//         case "JAR-Template": {
//             switch (segment) {
//                 case "pointDrive": return true;
//                 case "poseDrive": return true;
//                 case "pointTurn": return true;
//                 case "angleTurn": return true;
//                 case "angleSwing": return true;
//                 case "pointSwing": return false;
//                 case "distanceDrive": return true;
//             }
//             break;
//         }
//         case "RW-Template": {
//             switch (segment) {
//                 case "pointDrive": return true;
//                 case "poseDrive": return true;
//                 case "pointTurn": return true;
//                 case "angleTurn": return true;
//                 case "angleSwing": return true;
//                 case "pointSwing": return true;
//                 case "distanceDrive": return true;
//             }
//             break;
//         }
//         case "LemLib": {
//             switch (segment) {
//                 case "pointDrive": return true;
//                 case "poseDrive": return true;
//                 case "pointTurn": return true;
//                 case "angleTurn": return true;
//                 case "angleSwing": return true;
//                 case "pointSwing": return true;
//                 case "distanceDrive": return false;
//             }
//             break;
//         }
//     }
//     return false;
// }

// export function getSegmentName(format: Format, segment: SegmentKind): string {
//     switch (format) {
//         case "mikLib": {
//             switch (segment) {
//                 case "pointDrive": return "Drive to Point";
//                 case "poseDrive": return "Drive to Pose";
//                 case "pointTurn": return "Turn to Point";
//                 case "angleTurn": return "Turn to Angle";
//                 case "angleSwing": return "Swing to Angle";
//                 case "pointSwing": return "Swing to Point";
//                 case "distanceDrive": return "Drive Distance";
//             }
//             break;
//         }
//         case "ReveilLib": {
//             switch (segment) {
//                 case "pointDrive": return "Pilons Segment";
//                 case "poseDrive": return "Boomerang";
//                 case "pointTurn": return "Look At";
//                 case "angleTurn": return "Turn Segment";
//             }
//             break;
//         }
//         case "RevMecanum": {
//             switch (segment) {
//                 case "pointDrive": return "Point Drive";
//                 case "poseDrive": return "Arc Drive";
//                 case "pointTurn": return "Point Turn";
//                 case "angleTurn": return "Angle Turn";
//                 case "angleSwing": return "Angle Swing";
//                 case "pointSwing": return "Point Swing";
//             }
//             break;
//         }
//         case "JAR-Template": {
//             switch (segment) {
//                 case "pointDrive": return "Drive to Point";
//                 case "poseDrive": return "Drive to Pose";
//                 case "pointTurn": return "Turn to Point";
//                 case "angleTurn": return "Turn to Angle";
//                 case "angleSwing": return "Swing to Angle";
//                 case "distanceDrive": return "Drive Distance";

//             }
//             break;
//         }
//         case "RW-Template": {
//             switch (segment) {
//                 case "pointDrive": return "Move To Point";
//                 case "poseDrive": return "Boomerang";
//                 case "pointTurn": return "Turn To Point";
//                 case "angleTurn": return "Turn To Angle";
//                 case "angleSwing": return "Swing";
//                 case "distanceDrive": return "Drive To";
//             }
//             break;
//         }
//         case "LemLib": {
//             switch (segment) {
//                 case "pointDrive": return "Move To Point";
//                 case "poseDrive": return "Move To Pose";
//                 case "pointTurn": return "Turn To Point";
//                 case "angleTurn": return "Turn To Heading";
//                 case "angleSwing": return "Swing To Angle";
//                 case "pointSwing": return "Swing To Point";
//             }
//             break;
//         }
//     }
//     return "";
// }