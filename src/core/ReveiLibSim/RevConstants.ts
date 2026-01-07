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

function createRevConstants(values: Partial<ReveilLibConstants> = {}): ReveilLibConstants {
    return {
        maxSpeed: values.maxSpeed ?? null,

        kCorrection: values.kCorrection ?? null,
        maxError: values.kCorrection ?? null,

        stopHarshThreshold: values.stopHarshThreshold ?? null,
        stopCoastThreshold: values.stopCoastThreshold ?? null,
        stopCoastPower: values.stopCoastPower ?? null,
        stopTimeout: values.stopTimeout ?? null,
        brakeTime: values.brakeTime ?? null,

        dropEarly: values.dropEarly ?? null,
        lead: values.lead ?? null
    };
}

export const kPilon: ReveilLibConstants = createRevConstants({ 
    maxSpeed: 1,
    kCorrection: 2,
    maxError: 0.5,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    brakeTime: 250,
    dropEarly: 0, 
});

export const kTurn: ReveilLibConstants = createRevConstants({ 
    maxSpeed: 0.75,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    brakeTime: 100,
    dropEarly: 0,
});

export const kLootAt: ReveilLibConstants = createRevConstants({ 
    maxSpeed: 0.75,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    brakeTime: 100,
    dropEarly: 0,
})

export const kBoomerang: ReveilLibConstants = createRevConstants({
    maxSpeed: 0.75,
    kCorrection: 2,
    maxError: 0.5,
    stopHarshThreshold: 60,
    stopCoastThreshold: 200,
    stopCoastPower: 0.25,
    brakeTime: 250,
    dropEarly: 0, 
    lead: 0.4,
});