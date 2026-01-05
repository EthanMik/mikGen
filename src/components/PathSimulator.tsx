import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import { Robot, robotConstantsStore } from "../core/Robot";
import { precomputePath, type PathSim } from "../core/ComputePathSim";
import { usePose } from "../hooks/usePose";
import { clamp } from "../core/Util";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import Checkbox from "./Util/Checkbox";
import Slider from "./Util/Slider";
import { usePath } from "../hooks/usePath";
import { PathSimMacros } from "../macros/PathSimMacros";
import { convertPathToSim } from "../Conversion/Conversion";
import { useFormat } from "../hooks/useFormat";
import { useRobotPose } from "../hooks/useRobotPose";

// This fucking file is the biggest piece of shit i find a new bug every day

function createRobot(): Robot {
    const { width, height, speed, accel } = robotConstantsStore.getState();

    return new Robot(
        0, // Start x
        0, // Start y
        0, // Start angle
        width, // Width (inches)
        height, // Height (inches)
        speed, // Speed (ft/s)
        width,  // Track Width (inches)
        accel, // Max Accel (ft/s^2)
        accel // Max Decel (ft/s^2)
    );
}

let computedPath: PathSim;

export default function PathSimulator() {
    const [value, setValue] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [pose, setPose] = usePose()
    const [ robotPose, setRobotPose ] = useRobotPose();
    const robotk = useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.getState);
    const [playing, setPlaying] = useState<boolean>(false);
    const [robotVisible, setRobotVisibility] = useRobotVisibility();
    const [ path, setPath ] = usePath();
    const [ format, setFormat ] = useFormat();
    const skip = useRef(false);

    const { pauseSimulator, scrubSimulator } = PathSimMacros();

    useEffect(() => {
        if (path.segments.length === 0) {
            computedPath = precomputePath(createRobot(), convertPathToSim(path, format));
            setRobotPose(computedPath.endTrajectory);
            setPlaying(false);
            setTime(0);
            setValue(0);
            setRobotVisibility(false);
            setPose({ x: 0, y: 0, angle: 0 });
            return;
        }

        computedPath = precomputePath(createRobot(), convertPathToSim(path, format));
        setRobotPose(computedPath.endTrajectory);
        
        if (!robotVisible) {
            setPlaying(false);
            return;
        };

        if (!computedPath.trajectory.length || computedPath.totalTime <= 0) return;

        const clampedTime = clamp(time, 0, computedPath.totalTime);
        if (clampedTime !== time) setTime(clampedTime);
        
        if (robotVisible) forceSnapTime(computedPath, clampedTime);

        setValue((clampedTime / computedPath.totalTime) * 100);
        
    }, [path, format, robotk, robotVisible]);

    
    useEffect(() => {
        if (skip.current) {
            skip.current = false;
            return;
        }

        if (!playing) {
            setPathPercent(computedPath, value);
        }
    }, [value]);

    useEffect(() => {
        skip.current = true;
    }, [path])

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            const target = evt.target as HTMLElement | null;
            if (target?.isContentEditable || target?.tagName === "INPUT") return;
            pauseSimulator(evt, setPlaying)
            // scrubSimulator(evt, setValue, setPlaying, skip, computedPath, 0.05, 0.25);
            scrubSimulator(evt, setValue, setPlaying, skip, computedPath, 1/60, 0.25);
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, []);

    const setPathPercent = (path: PathSim, percent: number) => {
        if (!path.trajectory.length) return;

        percent = clamp(percent, 0, 100) / 100;

        const idx = Math.floor(percent * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];
        setTime(snap.t);

        setPose({x: snap.x, y: snap.y, angle: snap.angle})
    }

    const forceSnapTime = (path: PathSim, t: number) => {
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
        if (!path.trajectory.length) return;

        t = clamp(t, 0, path.totalTime);

        const percent = (t / path.totalTime);
        setValue(percent * 100);

        const idx = Math.floor(percent * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];

        setPose({x: snap.x, y: snap.y, angle: snap.angle})
    }

    useEffect(() => {
        const dt = 1 / 60;

        if (playing) {
            setTime(prev => (prev + dt >= computedPath.totalTime ? 0 : prev));
        }

        if (!playing) return;

        let last = performance.now();

        const interval = setInterval(() => {
            const now = performance.now();
            const dtSec = (now - last) / 1000;
            last = now;

            setTime(prevTime => {
                const nextTime = prevTime + dtSec;
                const clamped = Math.min(nextTime, computedPath.totalTime);

                setPathTime(computedPath, clamped);

                if (clamped >= computedPath.totalTime) {
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
            <button onClick={() => {
                    setPlaying(p => {
                        if (!p) setRobotVisibility(true);
                        return !p
                    });
                }} 
                className="hover:bg-medgray_hover px-1 py-1 rounded-sm">
                {playing ?
                    <img className="w-[25px] h-[25px]" src={pause}/> :
                    <img className="w-[25px] h-[25px]" src={play}/> 
                }
                
            </button>
            <Slider 
                value={value} 
                setValue={setValue} 
                sliderWidth={200} // 375
                sliderHeight={8} 
                knobHeight={22} 
                knobWidth={22}
                onChangeStart={() => {
                    setPlaying(false);
                    setRobotVisibility(true);
                }}
                OnChangeEnd={() => {}}
            />
            <span className="w-35">[{pose?.x?.toFixed(1)}, {pose?.y?.toFixed(1)}, {pose?.angle?.toFixed(0)}]</span>
            <span className="block">{time.toFixed(2)} s</span>
            <Checkbox checked={robotVisible} setChecked={setRobotVisibility}/>
        </div>        
    );
}