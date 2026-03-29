import { getDefaultConstants } from "../core/DefaultConstants";
import { getUnequalmikConstants, type mikConstants, type mikDriveConstants, type mikSwingConstants, type mikTurnConstants } from "../core/mikLibSim/MikConstants";
import { type Path } from "../core/Types/Path";
import { findPointToFace, trimZeros } from "../core/Util";

const roundOff = (val: number | undefined | null | string, digits: number) => {
    if (val === null || val === undefined || typeof val === "string") return "";
    return trimZeros(val.toFixed(digits));
}

type ConstantType = "Drive" | "Heading" | "Turn";

const keyToMikLibConstant = (key: string, value: number | string, constantType: ConstantType): string => {
    if (constantType === "Drive") {
        switch (key) {
            case "kp"      : return `.drive_k.p = ${roundOff(value, 3)}`
            case "ki"      : return `.drive_k.i = ${roundOff(value, 5)}`
            case "kd"      : return `.drive_k.d = ${roundOff(value, 3)}`
            case "starti"  : return `.drive_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed": return `.max_voltage = ${roundOff(value, 1)}`
            case "drift"   : return `.drift = ${roundOff(value, 2)}`
        }
    } else if (constantType === "Heading") {
        switch (key) {
            case "kp"      : return `.heading_k.p = ${roundOff(value, 3)}`
            case "ki"      : return `.heading_k.i = ${roundOff(value, 5)}`
            case "kd"      : return `.heading_k.d = ${roundOff(value, 3)}`
            case "starti"  : return `.heading_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed": return `.heading_max_voltage = ${roundOff(value, 1)}`
        }
    } else if (constantType === "Turn") {
        switch (key) {
            case "kp"            : return `.k.p = ${roundOff(value, 3)}`
            case "ki"            : return `.k.i = ${roundOff(value, 5)}`
            case "kd"            : return `.k.d = ${roundOff(value, 3)}`
            case "starti"        : return `.k.starti = ${roundOff(value, 2)}`
            case "maxSpeed"      : return `.max_voltage = ${roundOff(value, 1)}`
            case "turn_direction": return value === null ? "" : `.turn_direction = mik::${value === "clockwise" ? "cw" : "ccw"}`
        }
    }

    switch (key) {
        case "min_voltage"  : return `.min_voltage = ${roundOff(value, 1)}`
        case "settle_time"  : return `.settle_time = ${roundOff(value, 0)}`
        case "settle_error" : return `.settle_error = ${roundOff(value, 2)}`
        case "timeout"      : return `.timeout = ${roundOff(value, 0)}`
        case "lead"         : return `.lead = ${roundOff(value, 2)}`
    }
    return ""
}

const getConstantList = (constants: Partial<mikConstants>, constantType: ConstantType): string[] => {
    const constantsList: string[] = [];
    for (const k of Object.keys(constants)) {
        const value = constants[k as keyof mikConstants];
        if (value === undefined) continue;
        const c = keyToMikLibConstant(k, value as number | string, constantType);
        if (c !== "") constantsList.push(c);
    }
    return constantsList;
}

export function mikLibToString(path: Path, selected: boolean = false) {
    let pathString: string = '';

    const kDefault = {
        angleTurn : getDefaultConstants("mikLib", "angleTurn"),
        pointTurn : getDefaultConstants("mikLib", "pointTurn"),
        angleSwing: getDefaultConstants("mikLib", "angleSwing"),
        pointSwing: getDefaultConstants("mikLib", "pointSwing"),
        pointDrive: getDefaultConstants("mikLib", "pointDrive"),
        poseDrive : getDefaultConstants("mikLib", "poseDrive"),
    };

    for (let idx = 0; idx < path.segments.length; idx++) {
        const control = path.segments[idx];

        if (selected && !control.selected) continue;

        const kind = control.kind;
        const k = control.constants;

        const x = roundOff(control.pose.x, 2)
        const y = roundOff(control.pose.y, 2)
        const angle = roundOff(control.pose.angle, 2)

        if (idx === 0) {
            pathString += `    chassis.set_coordinates(${x}, ${y}, ${angle});`
            continue;
        }

        if (kind === "angleTurn") {
            const { turn } = k as mikTurnConstants;
            const constantsList = getConstantList(getUnequalmikConstants(kDefault.angleTurn.turn, turn), "Turn");
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    chassis.turn_to_angle(${angle});`
            : constantsList.length === 1
            ? `\n    chassis.turn_to_angle(${angle}, { ${constantsList[0]} });`
            : `\n    chassis.turn_to_angle(${angle}, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointTurn") {
            const { turn } = k as mikTurnConstants;
            const constantsList = getConstantList(getUnequalmikConstants(kDefault.pointTurn.turn, turn), "Turn");

            if (Number(angle) !== 0) constantsList.unshift(`.angle_offset = ${angle}`)

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
            const { swing } = k as mikSwingConstants;
            const constantsList = getConstantList(getUnequalmikConstants(kDefault.angleSwing.swing, swing), "Turn");
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    chassis.${swing.swing_direction}_swing_to_angle(${angle});`
            : constantsList.length === 1
            ? `\n    chassis.${swing.swing_direction}_swing_to_angle(${angle}, { ${constantsList[0]} });`
            : `\n    chassis.${swing.swing_direction}_swing_to_angle(${angle}, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointSwing") {
            const { swing } = k as mikSwingConstants;
            const constantsList = getConstantList(getUnequalmikConstants(kDefault.pointSwing.swing, swing), "Turn");

            if (Number(angle) !== 0) constantsList.unshift(`.angle_offset = ${angle}`)

            const pos = findPointToFace(path, idx);

            const turnX = roundOff(pos.x, 2);
            const turnY = roundOff(pos.y, 2);
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    chassis.${swing.swing_direction}_swing_to_point(${turnX}, ${turnY});`
            : constantsList.length === 1
            ? `\n    chassis.${swing.swing_direction}_swing_to_point(${turnX}, ${turnY}, { ${constantsList[0]} });`
            : `\n    chassis.${swing.swing_direction}_swing_to_point(${turnX}, ${turnY}, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointDrive") {
            const { drive, heading } = k as mikDriveConstants;
            const constantsList = [
                ...getConstantList(getUnequalmikConstants(kDefault.pointDrive.drive, drive), "Drive"),
                ...getConstantList(getUnequalmikConstants(kDefault.pointDrive.heading, heading), "Heading"),
            ];
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    chassis.drive_to_point(${x}, ${y});`
            : constantsList.length === 1
            ? `\n    chassis.drive_to_point(${x}, ${y}, { ${constantsList[0]} });`
            : `\n    chassis.drive_to_point(${x}, ${y}, {\n${formattedConstants}\n    });`
        }

        if (kind === "poseDrive") {
            const { drive, heading } = k as mikDriveConstants;
            const constantsList = [
                ...getConstantList(getUnequalmikConstants(kDefault.poseDrive.drive, drive), "Drive"),
                ...getConstantList(getUnequalmikConstants(kDefault.poseDrive.heading, heading), "Heading"),
            ];
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
