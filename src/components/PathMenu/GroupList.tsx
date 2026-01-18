import { useEffect, useRef, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import lockClose from "../../assets/lock-close.svg";
import lockOpen from "../../assets/lock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import { usePath } from "../../hooks/usePath";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";
import { getFormatConstantsConfig, getFormatDirectionConfig } from "../../core/DefaultConstants";
import { useFormat, type Format } from "../../hooks/useFormat";
import MotionList from "./MotionList";
import { moveSegment } from "./PathConfigUtils";


type GroupListProps = {
    name: string,
    segmentId: string,
    selected: boolean,
    isOpenGlobal: boolean,
    draggable?: boolean,
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnd?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnter?: () => void,
    setDraggingId?: React.Dispatch<React.SetStateAction<string | null>>,
    draggingId?: string | null,
}

export default function GroupList({
    name, 
    segmentId, 
    selected,
    isOpenGlobal,
    draggable = false,
    onDragStart,
    onDragEnd,
    onDragEnter,
    setDraggingId,
    draggingId = null,
}: GroupListProps) {
    const [ path, setPath ] = usePath(); 
    const [ format ] = useFormat();

    const segment = path.segments.find(s => s.id === segmentId)!;

    const setGlobalDraggingId = setDraggingId ?? (() => {});
    const [ overIndex, setOverIndex ] = useState<number | null>(null);

    const groupKey = segment.groupId ?? segment.id;

    const indexById = new Map(path.segments.map((s, i) => [s.id, i] as const));

    const children = path.segments.filter(
        (s) => s.groupId === groupKey && s.kind !== "group"
    );


    const [ isEyeOpen, setEyeOpen ] = useState(true);
    const [ isLocked, setLocked ] = useState(false);
    const [ isOpen, setOpen ] = useState(false);

    const pathRef = useRef(path);
    pathRef.current = path

    const normalSelect = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, selected: true } 
                : {...segment, selected: false}
            )
        }));
    }
    
    const crtlSelect = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, selected: !segment.selected } 
                : {...segment}
            )
        }));
    }

    const shiftSelect = () => {
        setPath(prev => {
            const segments = prev.segments;

            const clickedIdx = segments.findIndex(s => s.id === segmentId);
            if (clickedIdx === -1) return prev;

            let anchorIdx = -1;
            for (let i = segments.length - 1; i >= 0; i--) {
                if (segments[i].selected) {
                    anchorIdx = i;
                    break;
                }
            }

            if (anchorIdx === -1) anchorIdx = clickedIdx;

            const start = Math.min(anchorIdx, clickedIdx);
            const end = Math.max(anchorIdx, clickedIdx);

            return {
                ...prev,
                segments: segments.map((s, i) => ({
                    ...s,
                    selected: i >= start && i <= end,
                })),
            };
        });
    };

    const handleOnClick = (evt: React.PointerEvent<HTMLButtonElement>) => {
        if (evt.button === 0 && evt.ctrlKey) {
            crtlSelect();
            return;
        }

        if (evt.button === 0 && evt.shiftKey) {
            shiftSelect();
            return;
        }

        if (evt.button === 0) {
            normalSelect();
            return;
        }
    }

    const StartHover = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, hovered: true } 
                : {...segment, hovered: false }
            )
        }));        
    }
    
    const EndHover = () => {
        setPath(prev => ({
            ...prev, 
            segments: prev.segments.map(
                segment => segment.id === segmentId
                ? {...segment, hovered: false } 
                : {...segment, hovered: false }
            )
        }));        
    }

    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])


    const toggleSegment = (patch: (s: any) => any) => {
        setPath(prev => {
            
            const next = {
                ...prev,
                segments: prev.segments.map(s => (s.id === segmentId ? patch(s) : s)),
            };
            
            AddToUndoHistory({ path: next });
            return next;
        });
    };

    const handleEyeOnClick = () => {
        toggleSegment(s => ({ ...s, visible: !s.visible }));
    };

    const handleLockOnClick = () => {
        toggleSegment(s => ({ ...s, locked: !s.locked }));
    };

    useEffect(() => {
        setEyeOpen(segment.visible);
    }, [segment.visible])

    useEffect(() => {
        setLocked(segment.locked);
    }, [segment.locked])

    const updateUndoRef = useRef(false);

    useEffect(() => {
        if (updateUndoRef.current) {
            AddToUndoHistory({ path: path });
            updateUndoRef.current = false;
        }
    }, [path])
        
    const getSpeed = (format: Format): number => {
        switch (format) {
            case "mikLib": return 12;
            case "ReveilLib": return 1;
            case "JAR-Template": return 12;
            case "LemLib": return 127;
        }
    }

    const speedScale = getSpeed(format);
    const headerIdx = indexById.get(segmentId) ?? 0;

    return (
        <div className={`flex flex-col gap-2 mt-[1px]`}>
            <button
            draggable={draggable}
            onDragStart={(e) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', segmentId);
                    e.dataTransfer.effectAllowed = 'move';
                }
                if (onDragStart) onDragStart(e);
            }}
            onDragEnd={(e) => { if (onDragEnd) onDragEnd(e); }}
            onDragEnter={() => { if (onDragEnter) onDragEnter(); }}
            onClick={handleOnClick}
            onMouseEnter={StartHover}
            onMouseLeave={EndHover}
            className={`${selected ? "bg-medlightgray" : ""}
                flex flex-row justify-start items-center
                w-[450px] h-[35px] gap-[12px] outline-1
                bg-medgray
                hover:bg-medgray_hover
                rounded-lg pl-4 pr-4
                transition-all duration-100
                active:scale-[0.995]
                active:bg-medgray_hover/70
                ${isOpen ? ( !selected ? "outline-medlightgray scale-[0.995]" : "outline-transparent") : "outline-transparent"}
                ${draggingId === segmentId ? "opacity-50 border-1 border-medlightgray" : ""}
            `}
            >
            <button
                className="cursor-pointer shrink-0"
                onClick={() => setOpen(!isOpen)}
            >
                {!isOpen ? (
                <img className="w-[15px] h-[15px] rotate-270" src={downArrow} />
                ) : (
                <img className="w-[15px] h-[15px]" src={downArrow} />
                )}
            </button>


            <span className="w-[90px] items-center text-[17px] shrink-0 text-left truncate">{name}</span>
            
            <div className="flex flex-row w-full gap-2 justify-end">
                <button className="cursor-pointer shrink-0 justify-end" onClick={handleEyeOnClick}>
                    <img className="w-[20px] h-[20px]" src={isEyeOpen ? eyeOpen : eyeClosed} />
                </button>

                <button className="cursor-pointer shrink-0 justify-end" onClick={handleLockOnClick}>
                    <img className="w-[20px] h-[20px]" src={isLocked ? lockClose : lockOpen} />
                </button>

            </div>

            </button>

                <div
                className={`relative flex flex-col ml-9 gap-2 transition-all ${
                    isOpen ? "block" : "hidden"
                }`}
                >
                    { /* Vertical Line */ }
                    <div className="absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" />

                    <div
                    className="w-full relative"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOverIndex(-1); }}
                    onDragEnter={(e) => { e.stopPropagation(); setOverIndex(-1); }}
                    onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const headerGlobalIdx = path.segments.findIndex(s => s.id === segmentId);
                    if (headerGlobalIdx === -1) return;

                    moveSegment(setPath, draggingId ?? null, headerGlobalIdx, { headerDrop: "top" });
                    setGlobalDraggingId(null);
                    setOverIndex(null);
                    }}
                    >
                    {overIndex === -1 && draggingId !== null && (
                        <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
                    )}
                    <div className="h-2" />
                    </div>

                    {children.map((c, idx) => {
                        const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
                        const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);

                        const globalIdx = indexById.get(c.id) ?? -1;
                        if (globalIdx === -1) return null;

                        return (
                            <div
                            key={c.id}
                            className="w-full relative"
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOverIndex(idx); }}
                            onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            moveSegment(setPath, draggingId ?? null, globalIdx);
                            setGlobalDraggingId(null);
                            setOverIndex(null);
                            }}
                            >
                            {overIndex === idx && draggingId !== null && (
                                <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
                            )}

                            {(c.kind === "pointDrive" || c.kind === "poseDrive") && (
                                <MotionList
                                    name="Drive"
                                    speedScale={speedScale}
                                    field={constantsFields}
                                    directionField={directionFields}
                                    segmentId={c.id}
                                    isOpenGlobal={isOpenGlobal}
                                    draggable={true}
                                    onDragStart={() => setGlobalDraggingId(c.id)}
                                    onDragEnd={() => { setGlobalDraggingId(null); setOverIndex(null); }}
                                    onDragEnter={() => setOverIndex(idx)}
                                    draggingId={draggingId}
                                />
                            )}

                            {(c.kind === "angleTurn" || c.kind === "pointTurn") && (
                                <MotionList
                                    name="Turn"
                                    speedScale={speedScale}
                                    field={constantsFields}
                                    directionField={directionFields}
                                    segmentId={c.id}
                                    isOpenGlobal={isOpenGlobal}
                                    draggable={true}
                                    onDragStart={() => setGlobalDraggingId(c.id)}
                                    onDragEnd={() => { setGlobalDraggingId(null); setOverIndex(null); }}
                                    onDragEnter={() => setOverIndex(idx)}
                                    draggingId={draggingId}
                                />
                            )}

                            {(c.kind === "pointSwing" || c.kind === "angleSwing") && (
                                <MotionList
                                    name="Swing"
                                    speedScale={speedScale}
                                    field={constantsFields}
                                    directionField={directionFields}
                                    segmentId={c.id}
                                    isOpenGlobal={isOpenGlobal}
                                    draggable={true}
                                    onDragStart={() => setGlobalDraggingId(c.id)}
                                    onDragEnd={() => { setGlobalDraggingId(null); setOverIndex(null); }}
                                    onDragEnter={() => setOverIndex(idx)}
                                    draggingId={draggingId}
                                />
                            )}
                            </div>
                        );
                    })}

                    <div
                        className="w-full relative"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOverIndex(children.length); }}
                        onDragEnter={(e) => { e.stopPropagation(); setOverIndex(children.length); }}
                        onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const headerGlobalIdx = path.segments.findIndex((s) => s.id === segmentId);
                        if (headerGlobalIdx === -1) return;

                        moveSegment(setPath, draggingId ?? null, headerGlobalIdx, { headerDrop: "bottom" });
                        setGlobalDraggingId(null);
                        setOverIndex(null);
                        }}
                        >
                        {overIndex === children.length && draggingId !== null && (
                            <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
                        )}
                        <div className="h-6" />
                    </div>

                </div>
        </div>
    );
}
