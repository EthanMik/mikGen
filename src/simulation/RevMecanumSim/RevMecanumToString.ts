import { getDefaultConstants } from "../DefaultConstants";
import { getUnequalRevMecanumConstants, type RevMecanumConstants, type RevMecanumDriveConstants, type RevMecanumTurnConstants } from "./RevMecanumConstant";
import { type Path } from "../../core/Types/Path";
import { findPointToFace, trimZeros } from "../../core/Util";

const roundOff = (val: number | undefined | null | string, digits: number) => {
    if (val === null || val === undefined || typeof val === "string") return "";
    return trimZeros(val.toFixed(digits));
}

type ConstantType = "Drive" | "TurnInDrive" | "Turn";

const keyToRevMecanumConstant = (key: string, value: number | string, constantType: ConstantType): string => {
    if (constantType === "Drive") {
        switch (key) {
            case "kp"              : return `.drive_k.p = ${roundOff(value, 3)}`
            case "ki"              : return `.drive_k.i = ${roundOff(value, 5)}`
            case "kd"              : return `.drive_k.d = ${roundOff(value, 3)}`
            case "starti"          : return `.drive_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed"        : return `.max_speed = ${roundOff(value, 1)}`
            case "min_voltage"     : return `.min_speed = ${roundOff(value, 1)}`
            case "center_max_speed": return `.center_max_speed = ${roundOff(value, 1)}`
            case "settle_error"    : return `.drive_settle.settle_error = ${roundOff(value, 2)}_in`
            case "settle_time"     : return `.drive_settle.settle_time = ${roundOff(value, 0)}_ms`
            case "timeout"         : return `.timeout = ${roundOff(value, 0)}_ms`
            case "exit_error"      : return `.exit_error = ${roundOff(value, 2)}_in`
        }
    } else if (constantType === "TurnInDrive") {
        switch (key) {
            case "kp"          : return `.turn_k.p = ${roundOff(value, 3)}`
            case "ki"          : return `.turn_k.i = ${roundOff(value, 5)}`
            case "kd"          : return `.turn_k.d = ${roundOff(value, 3)}`
            case "starti"      : return `.turn_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed"    : return `.turn_max_speed = ${roundOff(value, 1)}`
            case "settle_error": return `.turn_settle.settle_error = ${roundOff(value, 2)}_deg`
            case "settle_time" : return `.turn_settle.settle_time = ${roundOff(value, 0)}_ms`
        }
    } else if (constantType === "Turn") {
        switch (key) {
            case "kp"          : return `.turn_k.p = ${roundOff(value, 3)}`
            case "ki"          : return `.turn_k.i = ${roundOff(value, 5)}`
            case "kd"          : return `.turn_k.d = ${roundOff(value, 3)}`
            case "starti"      : return `.turn_k.starti = ${roundOff(value, 2)}`
            case "maxSpeed"    : return `.max_speed = ${roundOff(value, 1)}`
            case "min_voltage" : return `.min_speed = ${roundOff(value, 1)}`
            case "settle_error": return `.turn_settle.settle_error = ${roundOff(value, 2)}_deg`
            case "settle_time" : return `.turn_settle.settle_time = ${roundOff(value, 0)}_ms`
            case "timeout"     : return `.timeout = ${roundOff(value, 0)}_ms`
            case "exit_error"  : return `.exit_error = ${roundOff(value, 2)}_deg`
        }
    }
    return ""
}

const getConstantList = (constants: Partial<RevMecanumConstants>, constantType: ConstantType): string[] => {
    const constantsList: string[] = [];
    for (const k of Object.keys(constants)) {
        const value = constants[k as keyof RevMecanumConstants];
        if (value === undefined) continue;
        const c = keyToRevMecanumConstant(k, value as number | string, constantType);
        if (c !== "") constantsList.push(c);
    }
    return constantsList;
}

export function RevMecanumToString(path: Path, selected: boolean = false) {
    let pathString: string = '';

    const kDefault = {
        angleTurn : getDefaultConstants("RevMecanum", "angleTurn"),
        pointTurn : getDefaultConstants("RevMecanum", "pointTurn"),
        pointDrive: getDefaultConstants("RevMecanum", "pointDrive"),
        poseDrive : getDefaultConstants("RevMecanum", "poseDrive"),
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
            pathString += `    odom->set_position({${x}_in, ${y}_in, ${angle}_deg});`
            continue;
        }

        if (kind === "angleTurn") {
            const { turn } = k as RevMecanumTurnConstants;
            const constantsList = getConstantList(getUnequalRevMecanumConstants(kDefault.angleTurn.turn, turn), "Turn");
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    turn(${angle}_deg);`
            : constantsList.length === 1
            ? `\n    turn(${angle}_deg, { ${constantsList[0]} });`
            : `\n    turn(${angle}_deg, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointTurn") {
            const { turn } = k as RevMecanumTurnConstants;
            const constantsList = getConstantList(getUnequalRevMecanumConstants(kDefault.pointTurn.turn, turn), "Turn");

            if (Number(angle) !== 0) constantsList.unshift(`.offset = ${angle}_deg`)

            const pos = findPointToFace(path, idx);
            const turnX = roundOff(pos.x, 2);
            const turnY = roundOff(pos.y, 2);
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    turn(${turnX}_in, ${turnY}_in);`
            : constantsList.length === 1
            ? `\n    turn(${turnX}_in, ${turnY}_in, { ${constantsList[0]} });`
            : `\n    turn(${turnX}_in, ${turnY}_in, {\n${formattedConstants}\n    });`
        }

        if (kind === "pointDrive") {
            const { drive, turn } = k as RevMecanumDriveConstants;
            const constantsList = [
                ...getConstantList(getUnequalRevMecanumConstants(kDefault.pointDrive.drive, drive), "Drive"),
                ...getConstantList(getUnequalRevMecanumConstants(kDefault.pointDrive.turn, turn), "TurnInDrive"),
            ];
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    drive(${x}_in, ${y}_in);`
            : constantsList.length === 1
            ? `\n    drive(${x}_in, ${y}_in, { ${constantsList[0]} });`
            : `\n    drive(${x}_in, ${y}_in, {\n${formattedConstants}\n    });`
        }

        if (kind === "poseDrive") {
            const { drive, turn } = k as RevMecanumDriveConstants;
            const constantsList = [
                ...getConstantList(getUnequalRevMecanumConstants(kDefault.poseDrive.drive, drive), "Drive"),
                ...getConstantList(getUnequalRevMecanumConstants(kDefault.poseDrive.turn, turn), "TurnInDrive"),
            ];
            const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");

            pathString += constantsList.length === 0
            ? `\n    drive(${x}_in, ${y}_in, ${angle}_deg);`
            : constantsList.length === 1
            ? `\n    drive(${x}_in, ${y}_in, ${angle}_deg, { ${constantsList[0]} });`
            : `\n    drive(${x}_in, ${y}_in, ${angle}_deg, {\n${formattedConstants}\n    });`
        }
    }

    if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
    return pathString;
}
