/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import lockClose from "../../assets/lock-close.svg";
import lockOpen from "../../assets/lock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import { usePath } from "../../hooks/usePath";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";


type GroupListProps = {
    name: string,
    segmentId: string,
    selected: boolean,
    isOpenGlobal: boolean,
    draggable?: boolean,
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnd?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnter?: () => void,
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
    draggingId = null,
}: GroupListProps) {
    const [ path, setPath ] = usePath(); 

    const segment = path.segments.find(s => s.id === segmentId)!;

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


                </div>
        </div>
    );
}
