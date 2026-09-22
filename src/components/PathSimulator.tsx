import { useEffect, useMemo, useRef, useState } from "react";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import { Robot } from "../core/Robot";
import { activeSegmentAtTime, activeSimSegmentStore, computedPathStore, ghostComputedPathStore, pathTelemetry, precomputePath, simJumpStore, type PathSim, type Snapshot } from "../core/ComputePathSim";
import { useGhostPoses, usePose } from "../hooks/usePose";
import { clamp, normalizeDeg, shortAngleDelta } from "../core/Util";
import { useRobotVisibility } from "../hooks/useRobotVisibility";
import Checkbox from "./Util/Checkbox";
import Slider from "./Util/Slider";
import { usePath, fileFormatStore, ghostFilesStore } from "../hooks/useFileFormat";
import { PathSimMacros } from "../macros/PathSimMacros";
import { convertPathToSim } from "../simulation/Conversion";
import { useRobotPose } from "../hooks/useRobotPose";
import { useSettings } from "../hooks/useSettings";
import { useSimulateGroup } from "../hooks/useSimulateGroup";
import { useRafThrottle } from "../hooks/useRafThrottle";
import Tooltip from "./Util/Tooltip";
import closedEye from "../assets/eye-closed.svg";
import openEye from "../assets/eye-open.svg";
import loopOn from "../assets/loop.svg";
import loopOff from "../assets/loop-disable.svg";
import type { Segment } from "../core/Types/Segment";
import type { Path } from "../core/Types/Path";
import type { Pose } from "../core/Types/Pose";

// Segments are immutable (every write path spreads into new objects), so object identity
// implies content and the geometry string can be cached per segment instance.
const geoKeyCache = new WeakMap<Segment, string>();

function segmentGeoString(s: Segment): string {
    let key = geoKeyCache.get(s);
    if (key === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { selected, visible, disabled, groupId, ...rest } = s;
        key = JSON.stringify(rest);
        geoKeyCache.set(s, key);
    }
    return key;
}

function poseAtPercent(path: PathSim, percent: number): Snapshot {
    const trajectory = path.trajectory;
    const at = clamp(percent, 0, 1) * (trajectory.length - 1);
    const i = Math.floor(at);
    const from = trajectory[i];
    const to = trajectory[i + 1];
    if (!to) return from;

    const frac = at - i;
    const mix = (u: number, v: number) => u + (v - u) * frac;
    return {
        t: mix(from.t, to.t),
        x: mix(from.x, to.x),
        y: mix(from.y, to.y),
        angle: normalizeDeg(from.angle + shortAngleDelta(from.angle, to.angle) * frac),
    };
}

/** Holds on the last pose once t runs past this path's end, so shorter paths wait for the longest one. */
function poseAtTime(path: PathSim, t: number): Snapshot {
    return poseAtPercent(path, path.totalTime > 0 ? t / path.totalTime : 0);
}

/** The timeline runs as long as the longest path, ghosts included. */
function longestTime(path: PathSim, ghostPaths: PathSim[]): number {
    return Math.max(path.totalTime, ...ghostPaths.map(g => g.totalTime));
}

/** True when the main path or any ghost has something to play back. */
function hasTrajectory(path: PathSim, ghostPaths: PathSim[]): boolean {
    return path.trajectory.length > 0 || ghostPaths.some(g => g.trajectory.length > 0);
}

function startPose(path: Path | undefined): Pose | null {
    const start = path?.segments[0];
    if (start?.kind !== "start" || start.pose.x === null || start.pose.y === null) return null;
    return { x: start.pose.x, y: start.pose.y, angle: start.pose.angle ?? 0 };
}

/** Holds a path with no trajectory (empty or start only) on its start pose so the others can still play. */
function poseOf(sim: PathSim | undefined, path: Path | undefined, t: number): Pose | null {
    if (!sim?.trajectory.length) return startPose(path);
    const snap = poseAtTime(sim, t);
    return { x: snap.x, y: snap.y, angle: snap.angle };
}

function createRobot(): Robot {
    return new Robot(fileFormatStore.getState().robot);
}

export default function PathSimulator() {
    const [value, setValue] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const timeRef = useRef(time);
    timeRef.current = time;
    const [pose, setPose] = usePose()
    const [, setGhostPoses] = useGhostPoses();
    const [, setRobotPose] = useRobotPose();
    const robot = fileFormatStore.useSelector(s => s.robot);
    const [playing, setPlaying] = useState<boolean>(false);
    const playingRef = useRef(playing);
    playingRef.current = playing;
    const [robotVisible, setRobotVisibility] = useRobotVisibility();
    const [path,] = usePath();
    const pathRef = useRef(path);
    pathRef.current = path;
    const formatDef = fileFormatStore.useSelector(s => s.formatDef);
    const skip = useRef(false);
    const [settings, setSettings] = useSettings();
    const looping = settings.loopPath;
    const loopingRef = useRef(looping);
    loopingRef.current = looping;
    const computedPath = computedPathStore.useStore();
    const ghostComputedPath = ghostComputedPathStore.useStore();
    const computedPathRef = useRef(computedPath);
    computedPathRef.current = computedPath;
    const ghostComputedPathRef = useRef(ghostComputedPath);
    ghostComputedPathRef.current = ghostComputedPath;
    const maxTimeRef = useRef(0);
    maxTimeRef.current = longestTime(computedPath, ghostComputedPath);
    const [simulatedGroups] = useSimulateGroup();
    const simJump = simJumpStore.useStore();
    const ghostFiles = ghostFilesStore.useStore();
    const ghostFilesRef = useRef(ghostFiles);
    ghostFilesRef.current = ghostFiles;

    const { pauseSimulator, releaseSimulator, scrubSimulator } = PathSimMacros();

    // Caps the full sim recompute at once per animation frame. Drag pointermoves and the
    // effect cascade they trigger can request several recomputes per frame; only the last
    // one per frame produces pixels, so the rest are pure waste.
    const scheduleRecompute = useRafThrottle();

    const segmentGeoKey = useMemo(() =>
        path.segments.map(segmentGeoString).join('|'),
        [path.segments]
    );
    
    useEffect(() => {
        ghostComputedPathStore.setState(
            ghostFiles.map(({ fileFormat: g }) => {
                const path = precomputePath(new Robot(g.robot), convertPathToSim(g.formatDef, g.path), false);
                return path;
            })
        )
    }, [ghostFiles, ])

    useEffect(() => {
        if (simJump === null) return;
        setRobotVisibility(true);
        skip.current = false;

        // simJump is a percent of the main path, but the slider spans the longest path
        const jumpTime = (simJump / 100) * computedPathRef.current.totalTime;
        const jumpValue = maxTimeRef.current > 0 ? (jumpTime / maxTimeRef.current) * 100 : 0;

        if (loopingRef.current && playingRef.current) {
            // While looping, jump to the segment but keep the robot running.
            setValue(jumpValue);
            setTime(jumpTime);
            // Keep the playback loop's ref in sync so a tick between now and the next render
            // does not resume from the pre-jump time
            timeRef.current = jumpTime;
        } else {
            setPlaying(false);
            setValue(jumpValue);
        }
        simJumpStore.setState(null);
    }, [simJump, setRobotVisibility]);

    useEffect(() => {
        scheduleRecompute(() => {
            const pathSim = precomputePath(createRobot(), convertPathToSim(formatDef, path));
            computedPathStore.setState(pathSim);
            setRobotPose(pathSim.endTrajectory);

            const ghostPaths = ghostComputedPathRef.current;

            // With ghosts loaded an empty main path must not reset the sim, or the ghosts could never play
            if (path.segments.length === 0 && ghostPaths.length === 0) {
                setPlaying(false);
                setTime(0);
                setValue(0);
                setRobotVisibility(false);
                setPose({ x: 0, y: 0, angle: 0 });
                return;
            }

            if (!robotVisible) {
                setPlaying(false);
                return;
            };

            const maxTime = longestTime(pathSim, ghostPaths);
            if (!hasTrajectory(pathSim, ghostPaths) || maxTime <= 0) {
                snapPoses(pathSim, ghostPaths, 0);
                return;
            }

            const clampedTime = clamp(time, 0, maxTime);
            if (clampedTime !== time) setTime(clampedTime);

            forceSnapTime(pathSim, ghostPaths, clampedTime);

            skip.current = true;
            setValue((clampedTime / maxTime) * 100);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segmentGeoKey, robot, robotVisible, simulatedGroups]);


    useEffect(() => {
        if (skip.current) {
            skip.current = false;
            return;
        }

        if (!playing) {
            setPathPercent(computedPath, ghostComputedPath, value);
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

        const dt = computedPath.dt;

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

        // The map preserves element identity when nothing changed; skip the store write so idle
        // frames do not poll every subscriber's selector
        if (updated.some((u, i) => u !== telemetry[i])) pathTelemetry.setState(updated);
    }, [time, computedPath]);

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            const target = evt.target as HTMLElement | null;
            if (target?.isContentEditable || target?.tagName === "INPUT") return;
            pauseSimulator(evt, setPlaying, setRobotVisibility)
            scrubSimulator(evt, setValue, setPlaying, setRobotVisibility, skip, maxTimeRef.current, 0.01, 0.25);
        }

        const handleKeyUp = (evt: KeyboardEvent) => {
            const target = evt.target as HTMLElement | null;
            if (target?.isContentEditable || target?.tagName === "INPUT") return;
            releaseSimulator(evt, setPlaying, setRobotVisibility)
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
        // Everything captured is identity-stable (setters, refs, pure macros), so register once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const snapPoses = (path: PathSim, ghostPath: PathSim[], t: number) => {
        setPose(poseOf(path, pathRef.current, t));
        setGhostPoses(ghostPath.map((g, i) => poseOf(g, ghostFilesRef.current[i]?.fileFormat.path, t)));
    };

    const setPathPercent = (path: PathSim, ghostPath: PathSim[], percent: number) => {
        if (!hasTrajectory(path, ghostPath)) return;

        const t = (clamp(percent, 0, 100) / 100) * longestTime(path, ghostPath);
        setTime(t);
        snapPoses(path, ghostPath, t);
    }

    const forceSnapTime = (path: PathSim, ghostPath: PathSim[], t: number) => {
        if (!hasTrajectory(path, ghostPath)) return;
        snapPoses(path, ghostPath, t);
    };

    const setPathTime = (path: PathSim, ghostPath: PathSim[], t: number) => {
        if (!hasTrajectory(path, ghostPath)) return;

        const maxTime = longestTime(path, ghostPath);
        t = clamp(t, 0, maxTime);
        setValue(maxTime > 0 ? (t / maxTime) * 100 : 0);
        snapPoses(path, ghostPath, t);
    }

    useEffect(() => {
        if (!playing) return;

        // Pressing play at the end restarts from 0
        if (timeRef.current + computedPathRef.current.dt >= maxTimeRef.current) {
            setTime(0);
            timeRef.current = 0;
        }

        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dtSec = (now - last) / 1000;
            last = now;

            const path = computedPathRef.current;
            const ghostPaths = ghostComputedPathRef.current;
            const maxTime = maxTimeRef.current;
            const clamped = Math.min(timeRef.current + dtSec, maxTime);

            if (clamped >= maxTime && !loopingRef.current) {
                setPathTime(path, ghostPaths, clamped);
                setTime(clamped);
                timeRef.current = clamped;
                setPlaying(false);
                return;
            }

            const next = clamped >= maxTime ? 0 : clamped;
            setPathTime(path, ghostPaths, next);
            setTime(next);
            timeRef.current = next;
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <Tooltip label="Toggle Robot Visibility (R)" placement="top" speed="fast">
                    <Checkbox checked={robotVisible} setChecked={setRobotVisibility} size={22} checkedSvg={openEye} uncheckedSvg={closedEye} />
                </Tooltip>
                <Tooltip label="Loop Path (;)" placement="top" speed="fast">
                    <button onClick={() => setSettings(prev => ({ ...prev, loopPath: !prev.loopPath }))}
                        className={`px-1 py-1 rounded-sm hover:brightness-90 cursor-pointer`}>
                        <img className="w-[22px] h-[22px]" src={looping ? loopOn : loopOff} />
                    </button>
                </Tooltip>

            </div>
        </div>
    );
}