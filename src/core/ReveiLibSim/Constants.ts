 export interface ReveilLibConstants {
    maxSpeed: number | null;

    kCorrection: number | null;
    maxError: number | null;
    
    stopHarshThreshold: number | null;
    stopCoastThreshold: number | null;
    stopCoastPower: number | null;
    stopTimeout: number | null;

    dropEarly: number | null;
}