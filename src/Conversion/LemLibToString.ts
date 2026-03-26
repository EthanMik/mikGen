import { getDefaultConstants } from "../core/DefaultConstants";
import { getUnequalLemConstants, type LemAngularConstants, type LemMoveConstants } from "../core/LemLibSim/LemConstants";
import { getUnequalPIDConstants, type PIDConstants, type TurnDirection } from "../core/mikLibSim/MikConstants";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";
import { findPointToFace, trimZeros } from "../core/Util";

const roundOff = (val: number | undefined | null | string, digits: number) => {
    if (val === null || val === undefined || typeof val === "string") return "";
    return trimZeros(val.toFixed(digits));
}

const keyToLemConstant = (key: string, value: number | string): string => {
    switch (key) {
        case "forwards": return value === "forward" ? ".forwards = true" : ".forwards = false"; 
        case "horizontalDrift": return `.horizontalDrift = ${roundOff(value, 1)}`; 
        case "lead": return `.lead = ${roundOff(value, 2)}`; 
        case "maxSpeed": return `.maxSpeed = ${roundOff(value, 0)}`; 
        case "minSpeed": return `.minSpeed = ${roundOff(value, 0)}`; 
        case "earlyExitRange": return `.earlyExitRange = ${roundOff(value, 1)}`; 
        case "direction": 
            switch (value as TurnDirection) {
                case "clockwise": return ".direction = AngularDirection::CW_CLOCKWISE"
                case "counterclockwise": return ".direction = AngularDirection::CCW_COUNTERCLOCKWISE"
            } 
    }

    return ""
}

export function mikLibToString(path: Path, selected: boolean = false) {
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
                `chassis.set_pose(${x}, ${y}, ${angle});`
            )        
            continue;
        }
        
        if (kind === "angleTurn") {
            const constantsList: string[] = [];
            for (const k of Object.keys(kUnequalAngular)) {
                const c = keyToMikLibConstant(k, constants[k], "Turn");
                if (c !== "") constantsList.push(c);
            }

            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");     

            pathString += constantsList.length === 0
            ? `\n    chassis.turn_to_angle(${angle});`
            : constantsList.length === 1 
            ? `\n    chassis.turn_to_angle(${angle}, { ${constantsList[0]} });`
            : `\n    chassis.turn_to_angle(${angle}, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointTurn") {
            const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).turn, control.constants.turn);
            const constantsList: string[] = [];

            if (Number(angle) !== 0) constantsList.push(`.angle_offset = ${angle}`)
            for (const k of Object.keys(constants)) {
                const c = keyToMikLibConstant(k, constants[k], "Turn");
                if (c !== "") constantsList.push(c);
            }

            const pos = findPointToFace(path, idx);
            const turnX = roundOff(pos.x, 2);
            const turnY = roundOff(pos.y, 2);

            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");     

            pathString += constantsList.length === 0
            ? `\n    chassis.turn_to_point(${turnX}, ${turnY});`
            : constantsList.length === 1 
            ? `\n    chassis.turn_to_point(${turnX}, ${turnY}, { ${constantsList[0]} });`
            : `\n    chassis.turn_to_point(${turnX}, ${turnY}, {\n${formattedConstants}\n    });`
        }
        
        if (kind === "angleSwing") {
            const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).swing, control.constants.swing);
            const constantsList: string[] = [];
            for (const k of Object.keys(constants)) {
                const c = keyToMikLibConstant(k, constants[k], "Turn");
                if (c !== "") constantsList.push(c);
            }

            if (commandName !== "") {
                constantsList.push(`.callback = [](){ ${commandName} }`);
                if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
            }

            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");     

            const direction = control.constants.swing.swingDirection;

            pathString += constantsList.length === 0
            ? `\n    chassis.${direction}_swing_to_angle(${angle});`
            : constantsList.length === 1 
            ? `\n    chassis.${direction}_swing_to_angle(${angle}, { ${constantsList[0]} });`
            : `\n    chassis.${direction}_swing_to_angle(${angle}, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointSwing") {
            const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).swing, control.constants.swing);
            const constantsList: string[] = [];

            if (Number(angle) !== 0) constantsList.push(`.angle_offset = ${angle}`)
            for (const k of Object.keys(constants)) {
                const c = keyToMikLibConstant(k, constants[k], "Turn");
                if (c !== "") constantsList.push(c);
            }

            const previousPos = getBackwardsSnapPose(path, idx - 1);
            const turnToPos = getForwardSnapPose(path, idx);

            const pos: Coordinate =
            turnToPos
                ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 }
                : previousPos
                ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 }
                : { x: 0, y: 5 };
            
            const turnX = roundOff(pos.x, 2);
            const turnY = roundOff(pos.y, 2);

            if (commandName !== "") {
                constantsList.push(`.callback = [](){ ${commandName} }`);
                if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
            }

            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");     

            const direction = control.constants.swing.swingDirection;

            pathString += constantsList.length === 0
            ? `\n    chassis.${direction}_swing_to_point(${turnX}, ${turnY});`
            : constantsList.length === 1 
            ? `\n    chassis.${direction}_swing_to_point(${turnX}, ${turnY}, { ${constantsList[0]} });`
            : `\n    chassis.${direction}_swing_to_point(${turnX}, ${turnY}, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointDrive") {
            const driveConstants: Partial<PIDConstants> = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).drive, control.constants.drive);
            const headingConstants: Partial<PIDConstants> = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).heading, control.constants.heading);
            const constantsList: string[] = [];

            for (const k of Object.keys(driveConstants)) {
            const driveC = keyToMikLibConstant(k, driveConstants[k], "Drive");
                if (driveC !== "") constantsList.push(driveC);
            }
            for (const k of Object.keys(headingConstants)) {
                const headingC = keyToMikLibConstant(k, headingConstants[k], "Heading");
                if (headingC !== "") constantsList.push(headingC);
            }

            if (commandName !== "") {
                constantsList.push(`.callback = [](){ ${commandName} }`);
                if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
            }

            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");     

            pathString += constantsList.length === 0
            ? `\n    chassis.drive_to_point(${x}, ${y});`
            : constantsList.length === 1 
            ? `\n    chassis.drive_to_point(${x}, ${y}, { ${constantsList[0]} });`
            : `\n    chassis.drive_to_point(${x}, ${y}, {\n${formattedConstants}\n    });`
        }

        if (kind === "poseDrive") {
            const driveConstants: Partial<PIDConstants> = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).drive, control.constants.drive);
            const headingConstants: Partial<PIDConstants> = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).heading, control.constants.heading);
            const constantsList: string[] = [];

            for (const k of Object.keys(driveConstants)) {
                const driveC = keyToMikLibConstant(k, driveConstants[k], "Drive");
                if (driveC !== "") constantsList.push(driveC);
            }
            for (const k of Object.keys(headingConstants)) {
                const headingC = keyToMikLibConstant(k, headingConstants[k], "Heading");
                if (headingC !== "") constantsList.push(headingC);
            }

            if (commandName !== "") {
                constantsList.push(`.callback = [](){ ${commandName} }`);
                if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
            }

            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");     

            pathString += constantsList.length === 0
            ? `\n    chassis.drive_to_pose(${x}, ${y}, ${angle});`
            : constantsList.length === 1 
            ? `\n    chassis.drive_to_pose(${x}, ${y}, ${angle}, { ${constantsList[0]} });`
            : `\n    chassis.drive_to_pose(${x}, ${y}, ${angle}, {\n${formattedConstants}\n    });`
        }
    }

    if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
    return pathString;
}