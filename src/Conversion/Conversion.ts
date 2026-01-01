import type { Robot } from "../core/Robot";
import type { Path } from "../core/Types/Path";
import type { Format } from "../hooks/useFormat";
import { mikLibToSim } from "./mikLibToSim";
import { mikLibToString } from "./mikLibToString";
import { reveilLibToSim } from "./ReveilLibToSim";


export function convertPathToSim(path: Path, format: Format): ((robot: Robot, dt: number) => boolean)[] {
    if (format === "mikLib") {
        return mikLibToSim(path);   
    }
    if (format === "ReveilLib") {
        const out = reveilLibToSim(path); 
        return out;
    }

    const emptyAuton: ((robot: Robot, dt: number) => boolean)[] = [];
    return emptyAuton
}

export function convertPathToString(path: Path, format: Format, selected = false) {
    if (format === "mikLib") {
        return mikLibToString(path, selected);
    }
}