export interface PIDConstants {
    maxSpeed: number | null;
    minSpeed: number | null;
    kp: number | null,  
    ki: number | null, 
    kd: number | null, 
    starti: number | null, 
    settleTime: number | null, 
    settleError: number | null, 
    timeout: number | null
    lead: number | null,
    setback: number | null
}

function createPIDConstants(values: Partial<PIDConstants> = {}): PIDConstants {
  return {
    maxSpeed: values.maxSpeed ?? null,
    minSpeed: values.minSpeed ?? null,
    kp: values.kp ?? null,
    ki: values.ki ?? null,
    kd: values.kd ?? null,
    starti: values.starti ?? null,
    settleTime: values.settleTime ?? null,
    settleError: values.settleError ?? null,
    timeout: values.timeout ?? null,
    lead: values.lead ?? null,
    setback: values.setback ?? null
  };
}


export const kturnPID = createPIDConstants({
    maxSpeed: 1,
    minSpeed: 0,
    kp: .4,
    ki: .03,
    kd: 3,
    starti: 15,
    settleTime: 300,
    settleError: 1,
    timeout: 3000
});

export const kDrivePID = createPIDConstants({
    maxSpeed: .8,
    minSpeed: 0,
    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,
    settleTime: 300,
    settleError: 1.5,
    timeout: 5000
});

export const kHeadingPID = createPIDConstants({
    maxSpeed: .5,
    minSpeed: 0,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
    settleTime: 0,
    settleError: 0,
    timeout: 0
});

export const kOdomTurnPID = createPIDConstants({
    maxSpeed: 1,
    minSpeed: 0,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
    settleTime: 300,
    settleError: 1.5,
    timeout: 5000
});

export const kOdomDrivePID = createPIDConstants({
    maxSpeed: .6,
    minSpeed: 0,
    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,
    settleTime: 300,
    settleError: 3,
    timeout: 5000,
    lead: 0.4,
    setback: 1,
});

export const kOdomHeadingPID = createPIDConstants({
    maxSpeed: .8,
    minSpeed: 0,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
    settleTime: 0,
    settleError: 0,
    timeout: 0
});

export const kBoomerangPID = createPIDConstants({
    maxSpeed: .8,
    minSpeed: 0,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
    settleTime: 300,
    settleError: 1.5,
    timeout: 5000,
    lead: 5,
    setback: 2,
});