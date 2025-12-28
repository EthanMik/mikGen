import type { Robot } from "../core/Robot";
import type { Coordinate } from "../core/Types/Coordinate";
import type { Path } from "../core/Types/Path";
import type { Format } from "../hooks/useFormat";
import { mikLibToString } from "./mikLibFormat";

export function convertPathToSim(path: Path, format: Format): ((robot: Robot, dt: number) => boolean)[] {
    
}

export function convertPathToString(path: Path, format: Format, selected = false) {
    if (format === "mikLib") {
        return mikLibToString(path, selected);
    }
}