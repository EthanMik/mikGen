import { useEffect, useState } from "react";
import Slider from "./Slider";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import { Robot } from "../core/Robot";
import { precomputePath, type PathSim } from "../core/PathSim";
import { usePose } from "../hooks/usePose";
import { clamp } from "../core/Util";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import Checkbox from "./Checkbox";
import { useSegment } from "../hooks/useSegment";
import { convertPathtoSim } from "../core/PathConversion";

function createRobot(): Robot {
    return new Robot(
        0, // Start x
        0, // Start y
        0, // Start angle
        14, // Width (inches)
        14, // Height (inches)
        6, // Speed (ft/s)
        16,  // Track Radius (inches)
        15 // Max Accel (ft/s^2)
    );
}

let path: PathSim;

export default function PathSimulator() {
    const [value, setValue] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [pose, setPose] = usePose()
    const [playing, setPlaying] = useState<boolean>(false);
    const [robotVisible, setRobotVisibility] = useRobotVisibility();
    const [segment, setSegment] = useSegment();

    useEffect(() => {
        path = precomputePath(createRobot(), convertPathtoSim(segment));
        if (robotVisible) forceSnapTime(path, time);
    }, [segment]) 

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
        if (evt.key.toLowerCase() === "p") {
            setPlaying(v => !v)
            evt.stopPropagation();
        }
        }
        
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        
    }, []);

    const setPathPercent = (path: PathSim, percent: number) => {
        setRobotVisibility(true);
        if (!path.trajectory.length) return;

        percent = clamp(percent, 0, 100) / 100;

        const idx = Math.floor(percent * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];
        setTime(snap.t);

        setPose({x: snap.x, y: snap.y, angle: snap.angle})
    }

    const forceSnapTime = (path: PathSim, t: number) => {
        setRobotVisibility(true);
        if (!path.trajectory.length) return;

        const percent = (t / path.totalTime);
        const idx = Math.floor(percent * (path.trajectory.length - 1));
        try {
            const snap = path.trajectory[idx];
            setPose({x: snap.x, y: snap.y, angle: snap.angle})       
        } catch {
            return;
        }

    };

    const setPathTime = (path: PathSim, t: number) => {
        setRobotVisibility(true);
        if (!path.trajectory.length) return;

        t = clamp(t, 0, path.totalTime);

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
        const dt = 1 / 60;

        if (playing) {
            setTime(prev => (prev + dt >= path.totalTime ? 0 : prev));
        }

        if (!playing) return;

        let last = performance.now();

        const interval = setInterval(() => {
            const now = performance.now();
            const dtSec = (now - last) / 1000;
            last = now;

            setTime(prevTime => {
                const nextTime = prevTime + dtSec;
                const clamped = Math.min(nextTime, path.totalTime);

                setPathTime(path, clamped);

                if (clamped >= path.totalTime) {
                    clearInterval(interval);
                    setPlaying(false);
                }

                return clamped;
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [playing]);
    
    return (
        <div className="flex bg-medgray w-[575px] h-[65px] rounded-lg 
            items-center justify-center gap-4"
        >
            <button onClick={() => setPlaying(p => !p)} className="hover:bg-medgray_hover px-1 py-1 rounded-sm">
                {playing ?
                    <img className="w-[25px] h-[25px]" src={pause}/> :
                    <img className="w-[25px] h-[25px]" src={play}/> 
                }
                
            </button>
            <Slider 
                value={value} 
                setValue={setValue} 
                sliderWidth={375} 
                sliderHeight={8} 
                knobHeight={22} 
                knobWidth={22}
                onChangeStart={() => setPlaying(false)}
                OnChangeEnd={() => {}}
            />
            <div className="w-11">
                <span className="block">{time.toFixed(2)} s</span>
            </div>
            <Checkbox checked={robotVisible} setChecked={setRobotVisibility}/>
        </div>        
    );
}