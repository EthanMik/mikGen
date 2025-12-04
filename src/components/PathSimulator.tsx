import { useEffect, useState } from "react";
import Slider from "./Slider";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import { Robot } from "../core/Robot";
import { driveDistance, driveToPoint, turnToAngle } from "../core/mikLibSim/DriveMotions";
import { PID } from "../core/mikLibSim/PID";
import { kOdomDrivePID, kOdomHeadingPID, kturnPID } from "../core/mikLibSim/Constants";
import { precomputePath, type PathSim } from "../core/PathSim";
import { usePose } from "../hooks/usePose";
import { clamp } from "../core/Util";

const robot = new Robot(
    -55, // Start x
    -12, // Start y
    110, // Start angle
    14, // Width (inches)
    14, // Height (inches)
    6, // Speed (ft/s)
    16,  // Track Radius (inches)
    15 // Max Accel (ft/s^2)
);

const turnPID = new PID(kturnPID);
const drivePID = new PID(kOdomDrivePID);
const headingPID = new PID(kOdomHeadingPID);

const auton = [
    (robot: Robot, dt: number):boolean =>{return driveToPoint(robot, dt, -23, -24, drivePID, headingPID);},
    (robot: Robot, dt: number):boolean =>{return driveToPoint(robot, dt, -11, -38, drivePID, headingPID);},
    (robot: Robot, dt: number):boolean =>{return driveToPoint(robot, dt, -26, -27, drivePID, headingPID);},
    (robot: Robot, dt: number):boolean =>{return turnToAngle(robot, dt, -139, turnPID);},
    (robot: Robot, dt: number):boolean =>{return driveToPoint(robot, dt, -42, -46, drivePID, headingPID);},
    (robot: Robot, dt: number):boolean =>{return turnToAngle(robot, dt, 270, turnPID);},
    (robot: Robot, dt: number):boolean =>{return driveDistance(robot, dt, 15, robot.getAngle(), drivePID, headingPID);},
    (robot: Robot, dt: number):boolean =>{return driveDistance(robot, dt, -22, robot.getAngle(), drivePID, headingPID);},
];

const path = precomputePath(robot, auton)

export default function PathSimulator() {
    const [value, setValue] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [pose, setPose] = usePose()
    const [playing, setPlaying] = useState<boolean>(false);

    const setPathPercent = (path: PathSim, percent: number) => {
        if (!path.trajectory.length) return;

        percent = clamp(percent, 0, 100) / 100;

        const idx = Math.floor(percent * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];
        setTime(snap.t);

        setPose({x: snap.x, y: snap.y, angle: snap.angle})
    }

    const setPathTime = (path: PathSim, t: number) => {
        if (!path.trajectory.length) return;

        t = clamp(t, 0, path.totalTime);

        setTime(t);

        const percent = (t / path.totalTime);
        setValue(percent * 100);

        const idx = Math.floor(percent * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];

        setPose({x: snap.x, y: snap.y, angle: snap.angle})
    }

    useEffect(() => {
        if (!playing) setPathPercent(path, value);
    }, [value])

    useEffect(() => {
        if (!playing) return;

        const interval = setInterval(() => {
            setTime(prevTime => {
                const nextTime = prevTime + 1 / 60;
                setPathTime(path, nextTime);

                if (nextTime >= path.totalTime) {
                    clearInterval(interval);
                    setTime(0)
                    setPlaying(false)
                }

                return nextTime
            });
        }, 1000 / 60)

        return () => clearInterval(interval)
    }, [playing])
    
    return (
        <div className="flex bg-medgray w-[575px] h-[65px] rounded-lg 
            items-center justify-center gap-6"
        >
            <button onClick={() => setPlaying(p => !p)} className="hover:bg-medgray_hover px-2 py-1 rounded-sm">
                {playing ?
                    <img className="w-[25px] h-[25px]" src={pause}/> :
                    <img className="w-[25px] h-[25px]" src={play}/> 
                }
                
            </button>
            <Slider 
                value={value} 
                setValue={setValue} 
                sliderWidth={400} 
                sliderHeight={8} 
                knobHeight={22} 
                knobWidth={22}
                onChangeStart={() => setPlaying(false)}
                OnChangeEnd={() => {}}
            />
            <div className="w-14">
                <span className="block">{time.toFixed(2)} s</span>
            </div>
        </div>        
    );
}