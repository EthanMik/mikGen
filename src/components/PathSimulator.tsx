import { useEffect, useMemo, useRef, useState } from "react";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import { Robot } from "../core/Robot";
import { activeSegmentAtTime, activeSimSegmentStore, computedPathStore, pathTelemetry, precomputePath, simJumpStore, SIM_CONSTANTS, type PathSim } from "../core/ComputePathSim";
import { usePose } from "../hooks/usePose";
import { clamp } from "../core/Util";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import Checkbox from "./Util/Checkbox";
import Slider from "./Util/Slider";
import { usePath, fileFormatStore } from "../hooks/useFileFormat";
import { PathSimMacros } from "../macros/PathSimMacros";
import { convertPathToSim } from "../simulation/Conversion";
import { useRobotPose } from "../hooks/useRobotPose";
import { useSettings } from "../hooks/useSettings";
import { useSimulateGroup } from "../hooks/useSimulateGroup";
import Tooltip from "./Util/Tooltip";
import closedEye from "../assets/eye-closed.svg"
import openEye from "../assets/eye-open.svg"
import loopOn from "../assets/loop.svg"
import loopOff from "../assets/loop-disable.svg"

function createRobot(): Robot {
    const {
        width, height, trackwidth, speed, lateralTau, angularTau,
        cogOffsetX, cogOffsetY, cogOffsetXDisabled, cogOffsetYDisabled,
        expansionFront, expansionLeft, expansionRight, expansionRear,
        expansionFrontDisabled, expansionLeftDisabled, expansionRightDisabled, expansionRearDisabled,
        sensorFrontX, sensorFrontY, sensorFrontDisabled,
        sensorLeftX, sensorLeftY, sensorLeftDisabled,
        sensorRightX, sensorRightY, sensorRightDisabled,
        sensorRearX, sensorRearY, sensorRearDisabled,
    } = fileFormatStore.getState().robot;

    return new Robot(
        0, // Start x
        0, // Start y
        0, // Start angle
        width, // Width (inches)
        trackwidth, // Track width (inches)
        height, // Height (inches)
        speed, // Speed (ft/s)
        cogOffsetXDisabled ? 0 : cogOffsetX, // CoG lateral offset (inches)
        cogOffsetYDisabled ? 0 : cogOffsetY, // CoG longitudinal offset (inches)
        expansionFrontDisabled ? 0 : expansionFront,
        expansionLeftDisabled ? 0 : expansionLeft,
        expansionRightDisabled ? 0 : expansionRight,
        expansionRearDisabled ? 0 : expansionRear,
        sensorFrontX,
        sensorFrontY,
        sensorFrontDisabled,
        sensorLeftX,
        sensorLeftY,
        sensorLeftDisabled,
        sensorRightX,
        sensorRightY,
        sensorRightDisabled,
        sensorRearX,
        sensorRearY,
        sensorRearDisabled,
        lateralTau,
        angularTau,
    );
}

export default function PathSimulator() {
    const [value, setValue] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [pose, setPose] = usePose()
    const [, setRobotPose] = useRobotPose();
    const robot = fileFormatStore.useSelector(s => s.robot);
    const [playing, setPlaying] = useState<boolean>(false);
    const playingRef = useRef(playing);
    playingRef.current = playing;
    const [robotVisible, setRobotVisibility] = useRobotVisibility();
    const [path,] = usePath();
    const formatDef = fileFormatStore.useSelector(s => s.formatDef);
    const skip = useRef(false);
    const [settings, setSettings] = useSettings();
    const looping = settings.loopPath;
    const loopingRef = useRef(looping);
    loopingRef.current = looping;
    const computedPath = computedPathStore.useStore();
    const computedPathRef = useRef(computedPath);
    computedPathRef.current = computedPath;
    const [simulatedGroups] = useSimulateGroup();
    const simJump = simJumpStore.useStore();

    const { pauseSimulator, scrubSimulator } = PathSimMacros();

    const segmentGeoKey = useMemo(() =>
        path.segments.map(s => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { selected, locked, visible, disabled, groupId, ...rest } = s;
            return JSON.stringify(rest);
        }).join('|'),
        [path.segments]
    );

    useEffect(() => {
        if (simJump === null) return;
        setRobotVisibility(true);
        skip.current = false;

        if (loopingRef.current && playingRef.current) {
            // While looping, jump to the segment but keep the robot running.
            setValue(simJump);
            setTime((simJump / 100) * computedPathRef.current.totalTime);
        } else {
            setPlaying(false);
            setValue(simJump);
        }
        simJumpStore.setState(null);
    }, [simJump, setRobotVisibility]);

    useEffect(() => {
        if (path.segments.length === 0) {
            computedPathStore.setState(precomputePath(createRobot(), convertPathToSim(formatDef, path)));

            setRobotPose(computedPath.endTrajectory);
            setPlaying(false);
            setTime(0);
            setValue(0);
            setRobotVisibility(false);
            setPose({ x: 0, y: 0, angle: 0 });
            return;
        }

        const pathSim = precomputePath(createRobot(), convertPathToSim(formatDef, path));
        // const pathSim = cullSimulatedPath(fullSim);
        computedPathStore.setState(pathSim);

        setRobotPose(pathSim.endTrajectory);

        if (!robotVisible) {
            setPlaying(false);
            return;
        };

        if (!pathSim.trajectory.length || pathSim.totalTime <= 0) {
            if (robotVisible) {
                const start = path.segments[0];
                if (start?.kind === "start" && start.pose.x !== null && start.pose.y !== null) {
                    setPose({ x: start.pose.x, y: start.pose.y, angle: start.pose.angle ?? 0 });
                }
            }
            return;
        }

        const clampedTime = clamp(time, 0, pathSim.totalTime);
        if (clampedTime !== time) setTime(clampedTime);

        if (robotVisible) forceSnapTime(pathSim, clampedTime);

        skip.current = true;
        setValue((clampedTime / pathSim.totalTime) * 100);

    }, [segmentGeoKey, robot, robotVisible, simulatedGroups]);


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
        const adjustedTime = time + computedPath.timeOffset;
        activeSimSegmentStore.setState(activeSegmentAtTime(computedPath, adjustedTime));

        const segs = computedPath.segmentTrajectorys;
        const cumDists = computedPath.segmentCumulativeDists;
        const telemetry = pathTelemetry.getState();
        if (!telemetry.length) return;

        const dt = SIM_CONSTANTS.dt;

        const updated = telemetry.map((tel, i) => {
            const seg = segs[i];
            const cumDist = cumDists[i];
            if (!seg?.length || !cumDist?.length) return tel;

            const startT = seg[0].t;
            const endT = seg[seg.length - 1].t;

            if (adjustedTime <= startT) {
                if (tel.progressRaw === 0 && tel.progressPercent === 0) return tel;
                return { ...tel, progressRaw: 0, progressPercent: 0 };
            }
            if (adjustedTime >= endT) {
                if (tel.progressRaw === tel.totalDistance && tel.progressPercent === 100) return tel;
                return { ...tel, progressRaw: tel.totalDistance, progressPercent: 100 };
            }

            const idx = Math.min(Math.floor((adjustedTime - startT) / dt), cumDist.length - 1);
            const progressRaw = cumDist[idx];
            const progressPercent = tel.totalDistance > 0 ? (progressRaw / tel.totalDistance) * 100 : 0;
            if (tel.progressRaw === progressRaw && tel.progressPercent === progressPercent) return tel;
            return { ...tel, progressRaw, progressPercent };
        });

        pathTelemetry.setState(updated);
    }, [time, computedPath]);

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            const target = evt.target as HTMLElement | null;
            if (target?.isContentEditable || target?.tagName === "INPUT") return;
            pauseSimulator(evt, setPlaying, setRobotVisibility)
            scrubSimulator(evt, setValue, setPlaying, setRobotVisibility, skip, computedPath, SIM_CONSTANTS.dt, 0.25);
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [computedPath]);

    const setPathPercent = (path: PathSim, percent: number) => {
        if (!path.trajectory.length) return;

        percent = clamp(percent, 0, 100) / 100;

        const idx = Math.floor(percent * (path.trajectory.length - 1));
        const snap = path.trajectory[idx];
        setTime(snap.t);

        setPose({ x: snap.x, y: snap.y, angle: snap.angle })
    }

    const forceSnapTime = (path: PathSim, t: number) => {
        if (!path.trajectory.length) return;

        const percent = (t / path.totalTime);
        const idx = Math.floor(percent * (path.trajectory.length - 1));
        try {
            const snap = path.trajectory[idx];
            setPose({ x: snap.x, y: snap.y, angle: snap.angle })
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

        setPose({ x: snap.x, y: snap.y, angle: snap.angle })
    }

    useEffect(() => {
        const dt = SIM_CONSTANTS.dt;

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
                const path = computedPathRef.current;
                const nextTime = prevTime + dtSec;
                const clamped = Math.min(nextTime, path.totalTime);

                setPathTime(path, clamped);

                if (clamped >= path.totalTime) {
                    if (loopingRef.current) {
                        setPathTime(path, 0);
                        return 0;
                    }
                    clearInterval(interval);
                    setPlaying(false);
                }

                return clamped;
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [playing]);

    return (
        <div className="flex bg-medgray w-[650px]  h-[65px] rounded-lg 
            items-center justify-center gap-4 relative"
        >
            <button onClick={() => {
                setPlaying(p => {
                    if (!p) setRobotVisibility(true);
                    return !p
                });
            }}
                className="cursor-pointer px-1 py-1 rounded-sm">
                {playing ?
                    <img className="w-[25px] h-[25px]" src={pause} /> :
                    <img className="w-[25px] h-[25px]" src={play} />
                }
            </button>
            <Slider
                value={value}
                setValue={setValue}
                sliderWidth={!settings.robotPosition ? 415 : 192}
                sliderHeight={8}
                knobHeight={22}
                knobWidth={22}
                onChangeStart={() => {
                    setPlaying(false);
                    setRobotVisibility(true);
                }}
                OnChangeEnd={() => { }}
            />
            {settings.robotPosition &&
                <span className="block w-61 bg-medgray_hover rounded-sm pl-2 pt-1 pb-1 text-center whitespace-pre font-mono">
                    X: <span className="inline-block w-13 text-left">{pose?.x?.toFixed(2)}</span>
                    Y: <span className="inline-block w-13 text-left">{pose?.y?.toFixed(2)}</span>
                    θ: <span className="inline-block w-12 text-left">{pose?.angle?.toFixed(1)}</span>
                </span>
            }
            <span className="block w-10 ">{time.toFixed(2)}s</span>
            <div className="flex flex-row items-center gap-1.5">
                <Tooltip label="Toggle Robot Visibility" placement="top" speed="fast">
                    <Checkbox checked={robotVisible} setChecked={setRobotVisibility} size={22} checkedSvg={openEye} uncheckedSvg={closedEye}/>
                </Tooltip>
                <Tooltip label="Loop Path" placement="top" speed="fast">
                    <button onClick={() => setSettings(prev => ({ ...prev, loopPath: !prev.loopPath }))}
                        className={`px-1 py-1 rounded-sm hover:brightness-90 cursor-pointer`}>
                        <img className="w-[22px] h-[22px]" src={looping ? loopOn : loopOff} />
                    </button>
                </Tooltip>
                
            </div>
        </div>
    );
}