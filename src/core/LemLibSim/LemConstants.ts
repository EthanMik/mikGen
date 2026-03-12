import type { DriveDirection, SwingDirection, TurnDirection } from "../mikLibSim/MikConstants";

export interface LemConstants {
    horizontalDrift: number,
    kp: number,
    ki: number,
    kd: number,
    antiWindup: number,
    smallError: number,
    smallErrorTimeout: number,
    largeError: number,
    largeErrorTimeout: number,
    slew: number,
    timeout: number,

    maxSpeed: number,
    minSpeed: number,

    lead: number,
    earlyExitRange: number

    forwards: DriveDirection,
    direction: TurnDirection | null,
    lockedSide: SwingDirection,
}

export type LemMoveConstants = {
    lateral: LemConstants
    angular: LemConstants
}

export type LemAngularConstants = {
    angular: LemConstants
}

export const kLemLibSpeed = 127;

export const LemConstantsEqual = (a: LemConstants, b: LemConstants): boolean => {
    return (
        a.horizontalDrift === b.horizontalDrift &&
        a.kp === b.kp &&
        a.ki === b.ki &&
        a.kd === b.kd &&
        a.antiWindup === b.antiWindup &&
        a.smallError === b.smallError &&
        a.smallErrorTimeout === b.smallErrorTimeout &&
        a.largeError === b.largeError &&
        a.largeErrorTimeout === b.largeErrorTimeout &&
        a.slew === b.slew &&
        a.timeout === b.timeout &&
        a.maxSpeed === b.maxSpeed &&
        a.minSpeed === b.minSpeed &&
        a.lead === b.lead &&
        a.earlyExitRange === b.earlyExitRange &&
        a.forwards === b.forwards &&
        a.direction === b.direction &&
        a.lockedSide === b.lockedSide
    );
}

export function getUnequalLemConstants(correct: LemConstants, different: LemConstants): Partial<LemConstants> {
    const out: Partial<LemConstants> = {};
    const a = correct;
    const b = different;

    if (a.horizontalDrift !== b.horizontalDrift) out.horizontalDrift = b.horizontalDrift;
    if (a.kp !== b.kp) out.kp = b.kp;
    if (a.ki !== b.ki) out.ki = b.ki;
    if (a.kd !== b.kd) out.kd = b.kd;
    if (a.antiWindup !== b.antiWindup) out.antiWindup = b.antiWindup;
    if (a.smallError !== b.smallError) out.smallError = b.smallError;
    if (a.smallErrorTimeout !== b.smallErrorTimeout) out.smallErrorTimeout = b.smallErrorTimeout;
    if (a.largeError !== b.largeError) out.largeError = b.largeError;
    if (a.largeErrorTimeout !== b.largeErrorTimeout) out.largeErrorTimeout = b.largeErrorTimeout;
    if (a.slew !== b.slew) out.slew = b.slew;
    if (a.timeout !== b.timeout) out.timeout = b.timeout;
    if (a.maxSpeed !== b.maxSpeed) out.maxSpeed = b.maxSpeed;
    if (a.minSpeed !== b.minSpeed) out.minSpeed = b.minSpeed;
    if (a.lead !== b.lead) out.lead = b.lead;
    if (a.earlyExitRange !== b.earlyExitRange) out.earlyExitRange = b.earlyExitRange;
    if (a.forwards !== b.forwards) out.forwards = b.forwards;
    if (a.direction !== b.direction) out.direction = b.direction;
    if (a.lockedSide !== b.lockedSide) out.lockedSide = b.lockedSide;

    return out;
}

export const cloneLemConstants = (c: LemConstants): LemConstants => ({ ...c });

export const kLemLinear: LemConstants = {
    maxSpeed: 127,
    minSpeed: 0,
    lead: 0.6,
    forwards: "forward",
    direction: null,
    lockedSide: "left",
    earlyExitRange: 0,
    timeout: 5000,
    horizontalDrift: 2,

    kp: 10,
    ki: 0,
    kd: 3,
    antiWindup: 3,
    smallError: 1,
    smallErrorTimeout: 100,
    largeError: 5,
    largeErrorTimeout: 500,
    slew: 20
}

export const kLemAngular: LemConstants = {
    maxSpeed: 127,
    minSpeed: 0,
    lead: 0.6,
    forwards: "forward",
    direction: null,
    lockedSide: "left",
    earlyExitRange: 0,
    timeout: 5000,
    horizontalDrift: 2,

    kp: 2,
    ki: 0,
    kd: 10,
    antiWindup: 3,
    smallError: 1,
    smallErrorTimeout: 100,
    largeError: 5,
    largeErrorTimeout: 500,
    slew: 0  
}