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
    const simLengthSeconds = 120;

    let autoIdx = 0;
    trajectory = [];

    const dt = 1 / 60; // Sim is run at 60 hertz

    let t = 0;
    let safetyIter = 0;
    const maxIter = 60 * simLengthSeconds;

    while (safetyIter < maxIter) {

        if (autoIdx < auton.length) {
            const done = auton[autoIdx](robot, dt);
            if (done) autoIdx++;
        }

        if (autoIdx >= auton.length) {
            if ((robot.getXVelocity() === 0 && robot.getYVelocity() === 0)) break;
            robot.tankDrive(0, 0, dt);
        }

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