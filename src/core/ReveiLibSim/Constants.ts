 export interface ReveilLibConstants {
    maxSpeed: number | null;

    kCorrection: number | null;
    maxError: number | null;
    
    stopHarshThreshold: number | null;
    stopCoastThreshold: number | null;
    stopCoastPower: number | null;
    stopTimeout: number | null;
    brakeTime: number | null;

    dropEarly: number | null;

    lead: number | null;
}

export const cloneKRev = (c: ReveilLibConstants): ReveilLibConstants => ({ ...c });

export const kPilon: ReveilLibConstants =  { 
    maxSpeed: 1,
    kCorrection: 2,
    maxError: 0.5,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    stopTimeout: null,
    brakeTime: 250,
    dropEarly: 0, 
    lead: null,
}

export const kTurn: ReveilLibConstants =  { 
    maxSpeed: 0.75,
    kCorrection: null,
    maxError: null,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    stopTimeout: null,
    brakeTime: 100,
    dropEarly: 0,
    lead: null,
}

export const kBoomerang: ReveilLibConstants = {
    maxSpeed: 0.75,
    kCorrection: 2,
    maxError: 0.5,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    stopTimeout: null,
    brakeTime: 250,
    dropEarly: 0, 
    lead: 0.4,
}