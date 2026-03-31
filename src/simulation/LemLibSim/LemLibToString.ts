import { getDefaultConstants } from "../DefaultConstants";
import { getUnequalLemConstants, type LemAngularConstants, type LemConstants, type LemMoveConstants } from "./LemConstants";
import { type DriveDirection, type SwingDirection, type TurnDirection } from "../mikLibSim/MikConstants";
import { type Path } from "../../core/Types/Path";
import { findPointToFace, trimZeros } from "../../core/Util";

const roundOff = (val: number | undefined | null | string, digits: number) => {
    if (val === null || val === undefined || typeof val === "string") return "";
    return trimZeros(val.toFixed(digits));
}

const lockedSideToString = (value: SwingDirection) => {
    switch (value) {
        case "left" : return "DriveSide::LEFT";
        case "right": return "DriveSide::RIGHT";
    }
}

const keyToLemConstant = (key: string, value: number | DriveDirection | TurnDirection | SwingDirection | null): string => {
    switch (key) {
        case "forwards": return value === "forward" ? ".forwards = true" : ".forwards = false"; 
        case "direction": {
            switch (value as TurnDirection) {
                case "clockwise": return ".direction = AngularDirection::CW_CLOCKWISE"
                case "counterclockwise": return ".direction = AngularDirection::CCW_COUNTERCLOCKWISE"
            };
            return "";
        };
        case "horizontalDrift": return `.horizontalDrift = ${roundOff(value, 1)}`; 
        case "lead": return `.lead = ${roundOff(value, 2)}`; 
        case "maxSpeed": return `.maxSpeed = ${roundOff(value, 0)}`; 
        case "minSpeed": return `.minSpeed = ${roundOff(value, 0)}`; 
        case "earlyExitRange": return `.earlyExitRange = ${roundOff(value, 1)}`; 
    }

    return ""
}

const getConstantList = (constants: Partial<LemConstants>): string[] => {
    const constantsList: string[] = [];
    for (const k of Object.keys(constants)) {
        const value = constants[k as keyof LemConstants];
        if (value === undefined) continue;
        const c = keyToLemConstant(k, value);
        if (c !== "") constantsList.push(c);
    }
    return constantsList;
}

export function LemLibToString(path: Path, selected: boolean = false) {
    let pathString: string = '';

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];

        if (selected && !control.selected) continue;

        const kind = control.kind;

        const x = roundOff(control.pose.x, 2)
        const y = roundOff(control.pose.y, 2)
        const angle = roundOff(control.pose.angle, 2)

        const kAngular = (control.constants as LemAngularConstants).angular;
        const kLateral = (control.constants as LemMoveConstants).lateral;
        
        
        const kDefaultAngular = (getDefaultConstants("LemLib", kind) as LemAngularConstants).angular;
        const kDefaultLateral = (getDefaultConstants("LemLib", kind) as LemMoveConstants).lateral;
        
        const kUnequalAngular = getUnequalLemConstants(kDefaultAngular, kAngular);
        const kUnequalLateral = getUnequalLemConstants(kDefaultLateral, kLateral);

        if (idx === 0) {
            pathString += (
                `    chassis.setPose(${x}, ${y}, ${angle});`
            )        
            continue;
        }

        if (kind === "angleTurn") {
            const constantsList = getConstantList(kUnequalAngular);
            const formattedConstants = constantsList.map((c) => ` ${c}`).join(", ");     

            pathString += constantsList.length === 0
            ? `\n    chassis.turnToHeading(${angle}, ${roundOff(kAngular.timeout, 0)});`
            : `\n    chassis.turnToHeading(${angle}, ${roundOff(kAngular.timeout, 0)}, {${formattedConstants}});`
        }

        if (kind === "pointTurn") {
            const constantsList = getConstantList(kUnequalAngular);
            const formattedConstants = constantsList.map((c) => ` ${c}`).join(", ");     

            const point = findPointToFace(path, idx);

            pathString += constantsList.length === 0
            ? `\n    chassis.turnToPoint(${roundOff(point.x, 2)}, ${roundOff(point.y, 2)}, ${roundOff(kAngular.timeout, 0)});`
            : `\n    chassis.turnToPoint(${roundOff(point.x, 2)}, ${roundOff(point.y, 2)}, ${roundOff(kAngular.timeout, 0)}, {${formattedConstants}});`

        }
        
        if (kind === "angleSwing") {
            const constantsList = getConstantList(kUnequalAngular);
            const formattedConstants = constantsList.map((c) => ` ${c}`).join(", ");     

            pathString += constantsList.length === 0
            ? `\n    chassis.swingToHeading(${angle}, ${lockedSideToString(kAngular.lockedSide)}, ${roundOff(kAngular.timeout, 0)});`
            : `\n    chassis.swingToHeading(${angle}, ${lockedSideToString(kAngular.lockedSide)}, ${roundOff(kAngular.timeout, 0)}, {${formattedConstants}});`
        }

        if (kind === "pointSwing") {
            const constantsList = getConstantList(kUnequalAngular);
            const formattedConstants = constantsList.map((c) => ` ${c}`).join(", ");     

            const point = findPointToFace(path, idx);

            pathString += constantsList.length === 0
            ? `\n    chassis.swingToPoint(${roundOff(point.x, 2)}, ${roundOff(point.y, 2)}, ${lockedSideToString(kAngular.lockedSide)}, ${roundOff(kAngular.timeout, 0)});`
            : `\n    chassis.swingToPoint(${roundOff(point.x, 2)}, ${roundOff(point.y, 2)}, ${lockedSideToString(kAngular.lockedSide)}, ${roundOff(kAngular.timeout, 0)}, {${formattedConstants}});`
        }

        if (kind === "pointDrive") {
            const constantsList = getConstantList(kUnequalLateral);
            const formattedConstants = constantsList.map((c) => ` ${c}`).join(", ");     

            pathString += constantsList.length === 0
            ? `\n    chassis.moveToPoint(${x}, ${y}, ${roundOff(kLateral.timeout, 0)});`
            : `\n    chassis.moveToPoint(${x}, ${y}, ${roundOff(kLateral.timeout, 0)}, {${formattedConstants}});`
        }

        if (kind === "poseDrive") {
            const constantsList = getConstantList(kUnequalLateral);
            const formattedConstants = constantsList.map((c) => ` ${c}`).join(", ");     

            pathString += constantsList.length === 0
            ? `\n    chassis.moveToPose(${x}, ${y}, ${angle}, ${roundOff(kLateral.timeout, 0)});`
            : `\n    chassis.moveToPose(${x}, ${y}, ${angle}, ${roundOff(kLateral.timeout, 0)}, {${formattedConstants}});`
        }
    }

    if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
    return pathString;
}