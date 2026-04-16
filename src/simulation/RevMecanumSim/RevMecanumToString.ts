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
            case "settle_error"    : return `.drive_settle.settle_error = ${roundOff(value, 2)}_in`
            case "settle_time"     : return `.drive_settle.settle_time = ${roundOff(value, 0)}_ms`
            case "maxSpeed"        : return `.max_speed = ${roundOff(value, 1)}`
            case "min_voltage"     : return `.min_speed = ${roundOff(value, 1)}`
            case "exit_error"      : return `.exit_error = ${roundOff(value, 2)}_in`
            case "center_max_speed": return `.center_max_speed = ${roundOff(value, 1)}`
            case "timeout"         : return `.timeout = ${roundOff(value, 0)}_ms`
        }
    } else if (constantType === "TurnInDrive") {
        switch (key) {
            case "kp"          : return `.turn_k.p = ${roundOff(value, 3)}`
            case "ki"          : return `.turn_k.i = ${roundOff(value, 5)}`
            case "kd"          : return `.turn_k.d = ${roundOff(value, 3)}`
            case "starti"      : return `.turn_k.starti = ${roundOff(value, 2)}`
            case "settle_error": return `.turn_settle.settle_error = ${roundOff(value, 2)}_deg`
            case "settle_time" : return `.turn_settle.settle_time = ${roundOff(value, 0)}_ms`
            case "maxSpeed"    : return `.turn_max_speed = ${roundOff(value, 1)}`
        }
    } else if (constantType === "Turn") {
        switch (key) {
            case "kp"          : return `.turn_k.p = ${roundOff(value, 3)}`
            case "ki"          : return `.turn_k.i = ${roundOff(value, 5)}`
            case "kd"          : return `.turn_k.d = ${roundOff(value, 3)}`
            case "starti"      : return `.turn_k.starti = ${roundOff(value, 2)}`
            case "settle_error": return `.turn_settle.settle_error = ${roundOff(value, 2)}_deg`
            case "settle_time" : return `.turn_settle.settle_time = ${roundOff(value, 0)}_ms`
            case "min_voltage" : return `.min_speed = ${roundOff(value, 1)}`
            case "maxSpeed"    : return `.max_speed = ${roundOff(value, 1)}`
            case "exit_error"  : return `.exit_error = ${roundOff(value, 2)}_deg`
            case "timeout"     : return `.timeout = ${roundOff(value, 0)}_ms`
        }
    }
    return ""
}

// Turn struct order: turn_k, turn_settle, min_speed, max_speed, exit_error, timeout
const TURN_KEY_ORDER: (keyof RevMecanumConstants)[] = [
    "kp", "ki", "kd", "starti",
    "settle_error", "settle_time",
    "min_voltage", "maxSpeed",
    "exit_error", "timeout",
];

const getTurnConstantList = (constants: Partial<RevMecanumConstants>): string[] => {
    const list: string[] = [];
    for (const k of TURN_KEY_ORDER) {
        const v = constants[k];
        if (v === undefined) continue;
        const c = keyToRevMecanumConstant(k, v as number | string, "Turn");
        if (c !== "") list.push(c);
    }
    return list;
}

// Drive struct order: drive_k, turn_k, drive_settle, turn_settle, max_speed, min_speed, exit_error, turn_max_speed, center_max_speed, timeout
const getDriveConstantList = (
    driveConstants: Partial<RevMecanumConstants>,
    turnConstants: Partial<RevMecanumConstants>
): string[] => {
    const list: string[] = [];

    const addDrive = (k: keyof RevMecanumConstants) => {
        const v = driveConstants[k];
        if (v === undefined) return;
        const c = keyToRevMecanumConstant(k, v as number | string, "Drive");
        if (c !== "") list.push(c);
    };

    const addTurn = (k: keyof RevMecanumConstants) => {
        const v = turnConstants[k];
        if (v === undefined) return;
        const c = keyToRevMecanumConstant(k, v as number | string, "TurnInDrive");
        if (c !== "") list.push(c);
    };

    // drive_k
    addDrive("kp"); addDrive("ki"); addDrive("kd"); addDrive("starti");
    // turn_k
    addTurn("kp"); addTurn("ki"); addTurn("kd"); addTurn("starti");
    // drive_settle
    addDrive("settle_error"); addDrive("settle_time");
    // turn_settle
    addTurn("settle_error"); addTurn("settle_time");
    // max_speed, min_speed, exit_error
    addDrive("maxSpeed"); addDrive("min_voltage"); addDrive("exit_error");
    // turn_max_speed
    addTurn("maxSpeed");
    // center_max_speed, timeout
    addDrive("center_max_speed" as keyof RevMecanumConstants); addDrive("timeout");

    return list;
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
            pathString += `  odom->set_position({${x}_in, ${y}_in, ${angle}_deg});`
            continue;
        }

        if (kind === "angleTurn") {
            const { turn } = k as RevMecanumTurnConstants;
            const constantsList = getTurnConstantList(getUnequalRevMecanumConstants(kDefault.angleTurn.turn, turn));

            pathString += constantsList.length === 0
            ? `\n  turn(${angle}_deg);`
            : `\n  turn(${angle}_deg, Turn{ ${constantsList.join(", ")} });`
        }

        if (kind === "pointTurn") {
            const { turn } = k as RevMecanumTurnConstants;
            const constantsList = getTurnConstantList(getUnequalRevMecanumConstants(kDefault.pointTurn.turn, turn));

            if (Number(angle) !== 0) constantsList.unshift(`.offset = ${angle}_deg`)

            const pos = findPointToFace(path, idx);
            const turnX = roundOff(pos.x, 2);
            const turnY = roundOff(pos.y, 2);

            pathString += constantsList.length === 0
            ? `\n  turn(${turnX}_in, ${turnY}_in);`
            : `\n  turn(${turnX}_in, ${turnY}_in, Turn{ ${constantsList.join(", ")} });`
        }

        if (kind === "pointDrive") {
            const { drive, turn } = k as RevMecanumDriveConstants;
            const constantsList = getDriveConstantList(
                getUnequalRevMecanumConstants(kDefault.pointDrive.drive, drive),
                getUnequalRevMecanumConstants(kDefault.pointDrive.turn, turn)
            );

            pathString += constantsList.length === 0
            ? `\n  drive(${x}_in, ${y}_in);`
            : `\n  drive(${x}_in, ${y}_in, Drive{ ${constantsList.join(", ")} });`
        }

        if (kind === "poseDrive") {
            const { drive, turn } = k as RevMecanumDriveConstants;
            const constantsList = getDriveConstantList(
                getUnequalRevMecanumConstants(kDefault.poseDrive.drive, drive),
                getUnequalRevMecanumConstants(kDefault.poseDrive.turn, turn)
            );

            pathString += constantsList.length === 0
            ? `\n  drive(${x}_in, ${y}_in, ${angle}_deg);`
            : `\n  drive(${x}_in, ${y}_in, ${angle}_deg, Drive{ ${constantsList.join(", ")} });`
        }
    }

    if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
    return pathString;
}
