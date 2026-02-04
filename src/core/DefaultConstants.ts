/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SetStateAction } from "react";
import type { ConstantListField } from "../components/PathMenu/MotionList";
import type { Format } from "../hooks/appStateDefaults";
import { getmikLibConstantsConfig, getMikLibDirectionConfig } from "./mikLibSim/MikConstantsConfig";
import type { ConstantsByFormat, SegmentKind } from "./Types/Segment";
import type { Path } from "./Types/Path";
import type { CycleImageButtonProps } from "../components/Util/CycleButton";
import { getRevConstantsConfig } from "./ReveiLibSim/RevConstantsConfig";
import { INITIAL_DEFAULTS, type DefaultConstant, globalDefaultsStore, getDefaultConstants } from "./InitialDefaults";

export { INITIAL_DEFAULTS, type DefaultConstant, globalDefaultsStore, getDefaultConstants };

export function updateDefaultConstants<F extends Format, K extends keyof ConstantsByFormat[F] & SegmentKind>(format: F, kind: K, patch: Partial<ConstantsByFormat[F][K]>) {
    globalDefaultsStore.setState((prev) => {
        const currentFormatDefaults = prev[format];
        const currentSegmentDefaults = currentFormatDefaults[kind];

        const mergedSegment: any = { ...currentSegmentDefaults };

        const keys = Object.keys(patch) as Array<keyof typeof patch>;

        for (const key of keys) {
            const patchValue = patch[key];
            const existingValue = mergedSegment[key];

            if (
                typeof patchValue === 'object' && patchValue !== null &&
                typeof existingValue === 'object' && existingValue !== null
            ) {
                mergedSegment[key] = { ...existingValue, ...patchValue };
            } else {
                mergedSegment[key] = patchValue;
            }
        }

        return {
            ...prev,
            [format]: {
                ...prev[format],
                [kind]: mergedSegment
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

export function getFormatConstantsConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): ConstantListField[] | undefined {
    switch (format) {
        case "mikLib": return getmikLibConstantsConfig(format, path, setPath, segmentId);
        case "ReveilLib": return getRevConstantsConfig(format, path, setPath, segmentId);
    }
    return [];
}

export function getFormatDirectionConfig(format: Format, path: Path, setPath: React.Dispatch<SetStateAction<Path>>, segmentId: string): CycleImageButtonProps[] | undefined {
    switch (format) {
        case "mikLib": return getMikLibDirectionConfig(path, setPath, segmentId);
    }
    return [];
}

export function getFormatPathName(format: Format) {
    switch (format) {
        case "mikLib": return "mikLib Path";
        case "ReveilLib": return "ReveilLib Path";
        case "JAR-Template": return "JAR-Template Path";
        case "LemLib": return "LemLib Path";
        case "RW-Template": return "RW-Template Path"
    }
}

export function getFormatSpeed(format: Format): number {
    switch (format) {
        case "mikLib": return 12;
        case "ReveilLib": return 1;
        case "JAR-Template": return 12;
        case "RW-Template": return 12;
        case "LemLib": return 127;
    }
}

export function segmentAllowed(format: Format, segment: SegmentKind): boolean {
    switch (format) {
        case "mikLib": {
            switch (segment) {
                case "pointDrive": return true;
                case "poseDrive": return true;
                case "pointTurn": return true;
                case "angleTurn": return true;
                case "angleSwing": return true;
                case "pointSwing": return true;
                case "distanceDrive": return true;
            }
            break;
        }
        case "ReveilLib": {
            switch (segment) {
                case "pointDrive": return true;
                case "poseDrive": return true;
                case "pointTurn": return true;
                case "angleTurn": return true;
                case "angleSwing": return false;
                case "pointSwing": return false;
                case "distanceDrive": return false;
            }
            break;
        }
        case "JAR-Template": {
            switch (segment) {
                case "pointDrive": return true;
                case "poseDrive": return true;
                case "pointTurn": return true;
                case "angleTurn": return true;
                case "angleSwing": return true;
                case "pointSwing": return false;
                case "distanceDrive": return true;
            }
            break;
        }
        case "RW-Template": {
            switch (segment) {
                case "pointDrive": return true;
                case "poseDrive": return true;
                case "pointTurn": return true;
                case "angleTurn": return true;
                case "angleSwing": return true;
                case "pointSwing": return true;
                case "distanceDrive": return true;
            }
            break;
        }
        case "LemLib": {
            switch (segment) {
                case "pointDrive": return true;
                case "poseDrive": return true;
                case "pointTurn": return true;
                case "angleTurn": return true;
                case "angleSwing": return true;
                case "pointSwing": return true;
                case "distanceDrive": return false;
            }
            break;
        }
    }
    return false;
}

export function getSegmentName(format: Format, segment: SegmentKind): string {
    switch (format) {
        case "mikLib": {
            switch (segment) {
                case "pointDrive": return "Drive to Point";
                case "poseDrive": return "Drive to Pose";
                case "pointTurn": return "Turn to Point";
                case "angleTurn": return "Turn to Angle";
                case "angleSwing": return "Swing to Angle";
                case "pointSwing": return "Swing to Point";
                case "distanceDrive": return "Drive Distance";
            }
            break;
        }
        case "ReveilLib": {
            switch (segment) {
                case "pointDrive": return "Pilons Segment";
                case "poseDrive": return "Boomerang Segment";
                case "pointTurn": return "Look At";
                case "angleTurn": return "Turn Segment";
            }
            break;
        }
        case "JAR-Template": {
            switch (segment) {
                case "pointDrive": return "Drive to Point";
                case "poseDrive": return "Drive to Pose";
                case "pointTurn": return "Turn to Point";
                case "angleTurn": return "Turn to Angle";
                case "angleSwing": return "Swing to Angle";
                case "distanceDrive": return "Drive Distance";

            }
            break;
        }
        case "RW-Template": {
            switch (segment) {
                case "pointDrive": return "Move To Point";
                case "poseDrive": return "Boomerang";
                case "pointTurn": return "Turn To Point";
                case "angleTurn": return "Turn To Angle";
                case "angleSwing": return "Swing";
                case "distanceDrive": return "Drive To";
            }
            break;
        }
        case "LemLib": {
            switch (segment) {
                case "pointDrive": return "Move To Point";
                case "poseDrive": return "Move To Pose";
                case "pointTurn": return "Turn To Point";
                case "angleTurn": return "Turn To Heading";
                case "angleSwing": return "Swing To Angle";
                case "pointSwing": return "Swing To Point";
            }
            break;
        }
    }
    return "";
}