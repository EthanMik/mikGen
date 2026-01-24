import type { Robot } from "./Robot";
import { createStore } from "./Store";

export const SIM_CONSTANTS = {
    seconds: 99,
    dt: 1/60, // Sim is run at 60 hertz
};

export interface Snapshot {
    t: number,
    x: number,
    y: number,
    angle: number,
}

export interface EndSnapShot {
    x: number,
    y: number,
    angle: number
}

export interface PathSim {
    totalTime: number,
    trajectory: Snapshot[];
    endTrajectory: EndSnapShot[];
    segmentTrajectorys: Snapshot[][];
}

export const computedPathStore = createStore<PathSim>({
    totalTime: 0,
    trajectory: [],
    endTrajectory: [],
    segmentTrajectorys: []
});

export function precomputePath(
    robot: Robot,
    auton: ((robot: Robot, dt: number) => boolean)[], 
): PathSim 
{   
    const simLengthSeconds = SIM_CONSTANTS.seconds;

    let autoIdx = 0;
    const trajectory: Snapshot[] = [];
    const endTrajectory: EndSnapShot[] = [];
    const segmentTrajectory: Snapshot[] = [];
    const segmentTrajectorys: Snapshot[][] = [];

    const dt = SIM_CONSTANTS.dt; 

    let t = 0;
    let safetyIter = 0;
    const maxIter = 60 * simLengthSeconds;

    while (safetyIter < maxIter) {

        if (autoIdx < auton.length) {
            const done = auton[autoIdx](robot, dt);
            if (done) {
                endTrajectory.push({
                    x: robot.getX(),
                    y: robot.getY(),
                    angle: robot.getAngle(),
                });

                segmentTrajectorys.push([...segmentTrajectory]);
                segmentTrajectory.length = 0;
                autoIdx++
            }

        }

        if (autoIdx >= auton.length) {
            if ((robot.getXVelocity() === 0 && robot.getYVelocity() === 0)) break;
            robot.tankDrive(0, 0, dt);
        }

        segmentTrajectory.push({
            t,
            x: robot.getX(),
            y: robot.getY(),
            angle: robot.getAngle(),
        });

        trajectory.push({
            t,
            x: robot.getX(),
            y: robot.getY(),
            angle: robot.getAngle(),
        });
        
        t += dt;
        safetyIter++;
    }
    

    return {totalTime: t, trajectory: trajectory, endTrajectory: endTrajectory, segmentTrajectorys: segmentTrajectorys};    
}