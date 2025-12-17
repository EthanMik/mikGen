import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import { Robot, robotConstantsStore } from "../core/Robot";
import { precomputePath, type PathSim } from "../core/PathSim";
import { usePose } from "../hooks/usePose";
import { clamp } from "../core/Util";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import Checkbox from "./Util/Checkbox";
import { convertPathtoSim } from "../core/PathConversion";
import Slider from "./Util/Slider";
import { usePath } from "../hooks/usePath";
import useMacros from "../hooks/useMacros";

function createRobot(): Robot {
    const { width, height, speed, accel } = robotConstantsStore.get();

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
    const robotk = useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.get);
    const [playing, setPlaying] = useState<boolean>(false);
    const [robotVisible, setRobotVisibility] = useRobotVisibility();
    const [ path, setPath ] = usePath();
    const skip = useRef(false);

    const { pauseSimulator, scrubSimulator } = useMacros();

    useEffect(() => {
        if (robotVisible && path.segments.length <= 0) setRobotVisibility(false);

        computedPath = precomputePath(createRobot(), convertPathtoSim(path));

        if (!computedPath.trajectory.length || computedPath.totalTime <= 0) return;

        const clampedTime = clamp(time, 0, computedPath.totalTime);

        if (robotVisible) forceSnapTime(computedPath, clampedTime);

        setValue((clampedTime / computedPath.totalTime) * 100);
        
    }, [path, robotk, robotVisible]);

    
    useEffect(() => {
        if (skip.current) {
            skip.current = false;
            return;
        }

        if (!playing) {
            setRobotVisibility(true);
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
            scrubSimulator(evt, setValue, setPlaying, skip, computedPath);
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
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