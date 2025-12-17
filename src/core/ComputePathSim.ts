import type { Robot } from "./Robot";

export interface Snapshot {
    t: number,
    x: number,
    y: number,
    angle: number
}

export interface PathSim {
    totalTime: number,
    trajectory: Snapshot[];
}

export let trajectory: Snapshot[] = [];

export function precomputePath(
    robot: Robot,
    auton: ((robot: Robot, dt: number) => boolean)[], 
): PathSim 
{   
    let autoIdx = 0;
    trajectory = [];

    const dt = 1 / 60; // Sim is run at 60 hertz

    let t = 0;
    let safetyIter = 0;
    const maxIter = 60 * 60;

    while (autoIdx < auton.length && safetyIter < maxIter) {
        const done = auton[autoIdx](robot, dt);
        if (done) autoIdx++;

        trajectory.push({
            t,
            x: robot.getX(),
            y: robot.getY(),
            angle: robot.getAngle()
        });

        t += dt;
        safetyIter++;
    }

    return {totalTime: t, trajectory: trajectory};    
}