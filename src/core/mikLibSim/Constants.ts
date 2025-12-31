
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

export type mikDriveConstants = {
  drive: PIDConstants;
  heading: PIDConstants;
};

export type mikTurnConstants = {
  turn: PIDConstants;
};

export function isMikTurnConstants(x: mikTurnConstants | mikDriveConstants): x is mikTurnConstants {
  return "turn" in x;
}

export function isMikDriveConstants(x: mikTurnConstants | mikDriveConstants): x is mikDriveConstants {
  return "drive" in x;
}

export const PIDConstantsEqual = (a: PIDConstants, b: PIDConstants): boolean => {
  return (
    a.maxSpeed === b.maxSpeed &&
    a.minSpeed === b.minSpeed &&
    a.kp === b.kp &&
    a.ki === b.ki &&
    a.kd === b.kd &&
    a.starti === b.starti &&
    a.settleTime === b.settleTime &&
    a.settleError === b.settleError &&
    a.timeout === b.timeout &&
    a.lead === b.lead &&
    a.setback === b.setback
  );
}

export function getUnequalPIDConstants(correctPIDConstants: PIDConstants, differentPIDConstants: PIDConstants): Partial<PIDConstants> {
  const out: Partial<PIDConstants> = {};
  const a = correctPIDConstants;
  const b = differentPIDConstants;

  if (a.maxSpeed !== b.maxSpeed) out.maxSpeed = b.maxSpeed;
  if (a.minSpeed !== b.minSpeed) out.minSpeed = b.minSpeed;

  if (a.kp !== b.kp) out.kp = b.kp;
  if (a.ki !== b.ki) out.ki = b.ki;
  if (a.kd !== b.kd) out.kd = b.kd;
  if (a.starti !== b.starti) out.starti = b.starti;

  if (a.settleTime !== b.settleTime) out.settleTime = b.settleTime;
  if (a.settleError !== b.settleError) out.settleError = b.settleError;
  if (a.timeout !== b.timeout) out.timeout = b.timeout;

  if (a.lead !== b.lead) out.lead = b.lead;
  if (a.setback !== b.setback) out.setback = b.setback;

  return out;  
}

export const clonePID = (c: PIDConstants): PIDConstants => ({ ...c });

export function createPIDConstants(values: Partial<PIDConstants> = {}): PIDConstants {
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
    maxSpeed: 12,
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
    maxSpeed: 10,
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
    maxSpeed: 6,
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
    maxSpeed: 12,
    minSpeed: 0,
    kp: .4,
    ki: .03,
    kd: 3,
    starti: 15,
    settleTime: 300,
    settleError: 1,
    timeout: 3000
});

export const kOdomDrivePID = createPIDConstants({
    maxSpeed: 8,
    minSpeed: 0,
    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0, 
    settleTime: 300,
    settleError: 3,
    timeout: 5000,
});

export const kOdomHeadingPID = createPIDConstants({
    maxSpeed: 10,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
});

export const kBoomerangPID = createPIDConstants({
    maxSpeed: 8,
    minSpeed: 0,
    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,
    settleTime: 300,
    settleError: 3,
    timeout: 5000,
    lead: 0.5,
    setback: 1,
});