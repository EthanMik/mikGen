import type { Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";
import type { SegmentKind } from "../core/Types/Segment";
import type { Format } from "../hooks/useFormat";
import { LemLibToSim } from "./LemLibSim/LemLibToSim";
import { LemLibToString } from "./LemLibSim/LemLibToString";
import { mikLibToSim } from "./mikLibSim/mikLibToSim";
import { mikLibToString } from "./mikLibSim/mikLibToString";
import { reveilLibToSim } from "./ReveiLibSim/ReveilLibToSim";
import { revToString } from "./ReveiLibSim/ReveilLibToString";
import { RevMecanumToSim } from "./RevMecanumSim/RevMecanumToSim";
import { RevMecanumToString } from "./RevMecanumSim/RevMecanumToString";


export function convertPathToSim(path: Path, format: Format): ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] {
    if (format === "mikLib") {
        return mikLibToSim(path);
    }
    if (format === "ReveilLib") {
        const out = reveilLibToSim(path);
        return out;
    }
    if (format === "LemLib") {
        const out = LemLibToSim(path);
        return out;
    }
    if (format === "RevMecanum") {
        const out = RevMecanumToSim(path);
        return out;
    }

    const emptyAuton: ((robot: Robot, dt: number) => [boolean, SegmentKind, number])[] = [];
    return emptyAuton;
}

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