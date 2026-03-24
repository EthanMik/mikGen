import type { Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";
import type { SegmentKind } from "../core/Types/Segment";
import type { Format } from "../hooks/useFormat";
import { LemLibToSim } from "./LemLibToSim";
import { mikLibToSim } from "./mikLibToSim";
import { mikLibToString } from "./mikLibToString";
import { reveilLibToSim } from "./ReveilLibToSim";
import { reveilLibToString, revToString } from "./ReveilLibToString";


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

    const emptyAuton: ((robot: Robot, dt: number) => [boolean, SegmentKind])[] = [];
    return emptyAuton
}

export function convertPathToString(path: Path, format: Format, selected = false) {
    if (format === "mikLib") {
        return mikLibToString(path, selected);
    }
    if (format === "ReveilLib") {
        return revToString(path, selected);
    }
}