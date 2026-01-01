import { getDefaultConstants } from "../core/Constants";
import { getUnequalPIDConstants, type PIDConstants } from "../core/mikLibSim/Constants";
import type { Coordinate } from "../core/Types/Coordinate";
import { getBackwardsSnapPose, getForwardSnapPose, type Path } from "../core/Types/Path";
import { trimZeros } from "../core/Util";

const roundOff = (val: number | undefined | null, digits: number) => {
    if (val === null || val === undefined) return "";
    return trimZeros(val.toFixed(digits));
}

type ConstantType = "Drive" | "Heading" | "Turn";

const keyToMikLibConstant = (key: string, value: number, constantType: ConstantType): string => {
    if (constantType === "Drive") {
        switch (key) {
            case "kp" : return `.drive_k.p = ${roundOff(value, 3)}`  
            case "ki" : return `.drive_k.i = ${roundOff(value, 5)}`
            case "kd" : return `.drive_k.d = ${roundOff(value, 3)}`
            case "starti" : return `.drive_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed" : return `.max_voltage = ${roundOff(value, 1)}`  
        }
    } else if (constantType === "Heading") {
        switch (key) {
            case "kp" : return `.heading_k.p = ${roundOff(value, 3)}`  
            case "ki" : return `.heading_k.i = ${roundOff(value, 5)}`
            case "kd" : return `.heading_k.d = ${roundOff(value, 3)}`
            case "starti" : return `.heading_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed" : return `.heading_max_voltage = ${roundOff(value, 1)}`  
        }
    } else if (constantType === "Turn") {
        switch (key) {
            case "kp" : return `.k.p = ${roundOff(value, 3)}`  
            case "ki" : return `.k.i = ${roundOff(value, 5)}`
            case "kd" : return `.k.d = ${roundOff(value, 3)}`
            case "starti" : return `.k.starti = ${roundOff(value, 2)}`
            case "maxSpeed" : return `.max_voltage = ${roundOff(value, 1)}`  
        }
    }

    switch (key) {
        case "minSpeed" : return `.min_voltage = ${roundOff(value, 1)}`  
        case "settleTime" : return `.settle_time = ${roundOff(value, 0)}`
        case "settleError" : return `.settle_error = ${roundOff(value, 2)}`
        case "timeout" : return `.timeout = ${roundOff(value, 0)}`
        case "lead" : return `.lead = ${roundOff(value, 2)}`
        case "setback": return `.setback = ${roundOff(value, 2)}`

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

        const commandName = control.command.name;
        const commandPercent = roundOff(control.command.percent, 0);
        
        if (idx === 0) {
            pathString += (
                `    chassis.set_coordinates(${x}, ${y}, ${angle});`
            )        
            continue;
        }
        
        if (kind === "angleTurn") {
            const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).turn, control.constants.turn);
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

            pathString += constantsList.length === 0
            ? `\n    chassis.turn_to_point(${turnX}, ${turnY});`
            : constantsList.length === 1 
            ? `\n    chassis.turn_to_point(${turnX}, ${turnY}, { ${constantsList[0]} });`
            : `\n    chassis.turn_to_point(${turnX}, ${turnY}, {\n${formattedConstants}\n    });`
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
            console.log(driveConstants)
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