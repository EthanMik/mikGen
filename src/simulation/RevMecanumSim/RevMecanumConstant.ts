export type SwingDirection = "right" | "left";
export type DriveDirection = "forward" | "reverse";
export type TurnDirection = "clockwise" | "counterclockwise";

export interface RevMecanumConstants {
    maxSpeed: number; // max_voltage is named "maxSpeed" for sliders to work

    min_voltage: number;
    kp: number,  
    ki: number, 
    kd: number, 
    starti: number,  
    drift: number,
    slew: number,
    settle_time: number, 
    settle_error: number, 
    timeout: number
    lead: number,
    swing_direction: SwingDirection | null,
    turn_direction: TurnDirection | null,
    exit_error: number,
}

export type RevMecanumDriveConstants = {
    drive: RevMecanumConstants;
    heading: RevMecanumConstants;
};

export type RevMecanumTurnConstants = {
    turn: RevMecanumConstants;
};

export type RevMecanumSwingConstants = {
    swing: RevMecanumConstants;
}

export const kRevMecanumSpeed = 1;


export const revMecanumConstantsEqual = (a: RevMecanumConstants, b: RevMecanumConstants): boolean => {
    return (
        a.maxSpeed === b.maxSpeed &&
        a.min_voltage === b.min_voltage &&
        a.kp === b.kp &&
        a.ki === b.ki &&
        a.kd === b.kd &&
        a.starti === b.starti &&
        a.slew === b.slew &&
        a.drift === b.drift &&
        a.settle_time === b.settle_time &&
        a.settle_error === b.settle_error &&
        a.timeout === b.timeout &&
        a.lead === b.lead &&
        a.turn_direction === b.turn_direction &&
        a.swing_direction === b.swing_direction &&
        a.exit_error === b.exit_error
    );
}

export function getUnequalRevMecanumConstants(correctRevMecanumConstants: RevMecanumConstants, differentRevMecanumConstants: RevMecanumConstants): Partial<RevMecanumConstants> {
    const out: Partial<RevMecanumConstants> = {};
    const a = correctRevMecanumConstants;
    const b = differentRevMecanumConstants;

    if (a.maxSpeed !== b.maxSpeed) out.maxSpeed = b.maxSpeed;
    if (a.min_voltage !== b.min_voltage) out.min_voltage = b.min_voltage;

    if (a.kp !== b.kp) out.kp = b.kp;
    if (a.ki !== b.ki) out.ki = b.ki;
    if (a.kd !== b.kd) out.kd = b.kd;
    if (a.starti !== b.starti) out.starti = b.starti;
    if (a.slew !== b.slew) out.slew = b.slew;
    if (a.drift !== b.drift) out.drift = b.drift;

    if (a.settle_time !== b.settle_time) out.settle_time = b.settle_time;
    if (a.settle_error !== b.settle_error) out.settle_error = b.settle_error;
    if (a.timeout !== b.timeout) out.timeout = b.timeout;

    if (a.lead !== b.lead) out.lead = b.lead;

    if (a.swing_direction !== b.swing_direction) out.swing_direction = b.swing_direction;
    if (a.turn_direction !== b.turn_direction) out.turn_direction = b.turn_direction;

    if (a.exit_error !== b.exit_error) out.exit_error = b.exit_error;

    return out;  
}

export const clonekRevMecanum = (c: RevMecanumConstants): RevMecanumConstants => ({ ...c });

export const kMecanum: RevMecanumConstants = {
    maxSpeed: 12,
    kp: .4,
    ki: .03,
    kd: 3,
    starti: 15,
    slew: 0,

    settle_error: 1,
    settle_time: 200,
    timeout: 3000,
    
    min_voltage: 0,
    exit_error: 0,
    drift: 2,
    lead: 0.5,
    turn_direction: null,
    swing_direction: null,

};

export const kMikHeading: RevMecanumConstants = {
    maxSpeed: 10,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
    slew: 0,

    settle_error: 0,
    settle_time: 0,
    timeout: 0,
    
    min_voltage: 0,
    exit_error: 0,
    drift: 2,
    lead: 0.5,
    turn_direction: null,
    swing_direction: null,
};

export const kMikSwing: RevMecanumConstants = {
    maxSpeed: 12,
    kp: .4,
    ki: 0.01,
    kd: 2,
    starti: 15,
    slew: 0,

    settle_error: 1,
    settle_time: 200,
    timeout: 3000,
    
    min_voltage: 0,
    exit_error: 0,
    drift: 2,
    lead: 0.5,
    turn_direction: null,
    swing_direction: null,
};

export const kMikDrive: RevMecanumConstants = {
    maxSpeed: 8,
    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,
    slew: 2,

    settle_error: 1.5,
    settle_time: 200,
    timeout: 5000,
    
    min_voltage: 0,
    exit_error: 0,
    drift: 2,
    lead: 0.5,
    turn_direction: null,
    swing_direction: null,
};
