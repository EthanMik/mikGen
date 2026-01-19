/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
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

export type GroupDropZone = "above" | "into" | "below" | null;

type GroupListProps = {
    name: string,
    segmentId: string,
    isOpenGlobal: boolean,
    draggable?: boolean,
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnd?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnter?: () => void,
    setDraggingId?: React.Dispatch<React.SetStateAction<string | null>>,
    draggingId?: string | null,
    headerDropZone?: GroupDropZone,
    onHeaderDropZoneChange?: (zone: GroupDropZone) => void,
}

export default function GroupList({
    name, 
    segmentId, 
    isOpenGlobal,
    draggable = false,
    onDragStart,
    onDragEnd,
    setDraggingId,
    draggingId = null,
    headerDropZone = null,
    onHeaderDropZoneChange,
}: GroupListProps) {
    const [ path, setPath ] = usePath(); 
    const [ format ] = useFormat();

    const segment = path.segments.find(s => s.id === segmentId)!;
    
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(name);

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        // if (onNameChange) {
        //     onNameChange(value);
        // }
    };

    const setGlobalDraggingId = setDraggingId ?? (() => {});
    const [ localOverIndex, setLocalOverIndex ] = useState<number | null>(null);

    const groupKey = segment.groupId ?? segment.id;

    const indexById = new Map(path.segments.map((s, i) => [s.id, i] as const));

    const children = path.segments.filter(
        (s) => s.groupId === groupKey && s.kind !== "group"
    );


    const [ isEyeOpen, setEyeOpen ] = useState(true);
    const [ isLocked, setLocked ] = useState(false);
    const [ isOpen, setOpen ] = useState(false);

    const pathRef = useRef(path);
    pathRef.current = path;

    const headerRef = useRef<HTMLButtonElement>(null);
    
    // Ref to prevent duplicate drop handling
    const dropHandledRef = useRef(false);
    
    // Reset the drop handled flag when dragging starts
    useEffect(() => {
        if (draggingId !== null) {
            dropHandledRef.current = false;
        }
    }, [draggingId]);

    
    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])
    
    
    const toggleSegment = (patch: (s: any) => any) => {
        setPath(prev => {
            
            const next = {
                ...prev,
                segments: prev.segments.map(s => (s.groupId === groupKey ? patch(s) : s)),
            };
            
            AddToUndoHistory({ path: next });
            return next;
        });
    };

    const handleOnClick = (evt: React.PointerEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, selected: !s.selected }));
        evt.preventDefault();
    }

    const handleEyeOnClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, visible: !s.visible }));
        evt.stopPropagation();
    };

    const handleLockOnClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, locked: !s.locked }));
        evt.stopPropagation();
    };

    const handleGroupOnHoverStart = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, hovered: true }));
        evt.stopPropagation();        
    }

    const handleGroupOnHoverEnd = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, hovered: false }));
        evt.stopPropagation();        
    }
    
    const handleDropDownOnClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        setOpen(prev => !prev);
        evt.stopPropagation();
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

    // Clear local over index when dragging ends globally
    useEffect(() => {
        if (draggingId === null) {
            setLocalOverIndex(null);
        }
    }, [draggingId]);

    // Determine which zone the cursor is in based on Y position
    const getDropZone = (e: React.DragEvent): GroupDropZone => {
        if (!headerRef.current) return null;
        const rect = headerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        
        if (y < height * 0.33) return "above";
        if (y > height * 0.66) return "below";
        return "into";
    };

    const handleHeaderDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggingId === segmentId) return;
        
        const zone = getDropZone(e);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(zone);
        }
    };

    const handleHeaderDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggingId === segmentId) return;
        
        const zone = getDropZone(e);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(zone);
        }
    };

    const handleHeaderDrop = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggingId || draggingId === segmentId) return;
        
        // Mark as handled immediately
        dropHandledRef.current = true;
        
        const zone = getDropZone(e);
        
        const headerGlobalIdx = path.segments.findIndex(s => s.id === segmentId);
        if (headerGlobalIdx === -1) return;

        // Clear dragging state FIRST to prevent re-entry
        const currentDraggingId = draggingId;
        setGlobalDraggingId(null);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(null);
        }

        if (zone === "above") {
            // Drop above the group - don't join the group
            moveSegment(setPath, currentDraggingId, headerGlobalIdx, { skipGroupHandling: true });
        } else if (zone === "into" || zone === "below") {
            // Drop into the group at the bottom
            moveSegment(setPath, currentDraggingId, headerGlobalIdx, { headerDrop: "bottom" });
        }
    };

    const handleHeaderDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        // Check if we're actually leaving the header
        const rect = headerRef.current?.getBoundingClientRect();
        if (rect) {
            const { clientX, clientY } = e;
            if (
                clientX < rect.left ||
                clientX > rect.right ||
                clientY < rect.top ||
                clientY > rect.bottom
            ) {
                if (onHeaderDropZoneChange) {
                    onHeaderDropZoneChange(null);
                }
            }
        }
    };

    // Handle drop within the group's children area
    const handleChildDrop = (e: React.DragEvent, childGlobalIdx: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingId) return;

        // Pass the target group ID so the segment joins this group
        moveSegment(setPath, draggingId, childGlobalIdx, { targetGroupId: groupKey });
        setGlobalDraggingId(null);
        setLocalOverIndex(null);
    };

    const isHoveringInto = (headerDropZone === "into" || headerDropZone === "below") && draggingId !== null && draggingId !== segmentId;

    // Handle drop on the outer container (for when cursor is slightly above the button)
    const handleContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
        
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggingId || draggingId === segmentId) return;
        
        // Mark as handled immediately
        dropHandledRef.current = true;
        
        const headerGlobalIdx = path.segments.findIndex(s => s.id === segmentId);
        if (headerGlobalIdx === -1) return;

        // Clear dragging state FIRST to prevent re-entry
        const currentDraggingId = draggingId;
        const currentZone = headerDropZone;
        setGlobalDraggingId(null);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(null);
        }

        if (currentZone === "above") {
            moveSegment(setPath, currentDraggingId, headerGlobalIdx, { skipGroupHandling: true });
        } else if (currentZone === "into" || currentZone === "below") {
            moveSegment(setPath, currentDraggingId, headerGlobalIdx, { headerDrop: "bottom" });
        }
    };

    const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // Only handle if we have an active header drop zone to prevent parent from taking over
        if (headerDropZone !== null) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div 
            className={`flex flex-col gap-2 mt-[1px] relative`}
            onDragOver={handleContainerDragOver}
            onDrop={handleContainerDrop}
            onDragLeave={(e) => {
                // Only clear if we're actually leaving the group container
                const rect = e.currentTarget.getBoundingClientRect();
                const { clientX, clientY } = e;
                if (
                    clientX < rect.left ||
                    clientX > rect.right ||
                    clientY < rect.top ||
                    clientY > rect.bottom
                ) {
                    setLocalOverIndex(null);
                }
            }}
        >
            {/* Drop indicator above group - absolutely positioned to not affect layout */}
            {headerDropZone === "above" && draggingId !== null && draggingId !== segmentId && (
                <div className="absolute top-[-4px] left-0 w-[450px] h-[2px] bg-white rounded-full pointer-events-none z-10" />
            )}
            
            <button
            ref={headerRef}
            draggable={draggable}
            onDragStart={(e) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', segmentId);
                    e.dataTransfer.effectAllowed = 'move';
                }
                if (onDragStart) onDragStart(e);
            }}
            onDragEnd={(e) => { 
                if (onDragEnd) onDragEnd(e); 
                setLocalOverIndex(null);
                if (onHeaderDropZoneChange) onHeaderDropZoneChange(null);
            }}
            onDragOver={handleHeaderDragOver}
            onDragEnter={handleHeaderDragEnter}
            onDrop={handleHeaderDrop}
            onDragLeave={handleHeaderDragLeave}
            onClick={handleOnClick}
            onMouseEnter={handleGroupOnHoverStart}
            onMouseLeave={handleGroupOnHoverEnd}
            className={`${isHoveringInto ? "bg-medlightgray" : ""}
                flex flex-row justify-start items-center
                w-[450px] h-[35px] gap-[12px] outline-1
                bg-medgray
                hover:bg-medgray_hover
                rounded-lg pl-4 pr-4
                transition-all duration-100
                active:scale-[0.995]
                active:bg-medgray_hover/70
                ${isOpen ? ( !isHoveringInto ? "outline-medlightgray scale-[0.995]" : "outline-transparent") : "outline-transparent"}
                ${draggingId === segmentId ? "opacity-50 border-1 border-medlightgray" : ""}
            `}
            >
            <button
                onClick={handleDropDownOnClick}
                className="cursor-pointer shrink-0"
            >
                {!isOpen ? (
                <img className="w-[15px] h-[15px] rotate-270" src={downArrow} />
                ) : (
                <img className="w-[15px] h-[15px]" src={downArrow} />
                )}
            </button>


        <input
            ref={inputRef}
            value={value}
            onClick={(e) => {
                if (isEditing) e.stopPropagation();
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
                e.stopPropagation();
                setValue(e.target.value);
            }}
            onKeyDown={(e) => {
                if (isEditing) e.stopPropagation();
                if (e.key === "Enter") {
                    inputRef.current?.blur();
                }
                if (e.key === "Escape") {
                    setValue(name);
                    inputRef.current?.blur();
                }
            }}
            onMouseDown={(e) => {
                if (isEditing) e.stopPropagation();
            }}
            name={name}
            className={`w-[90px] items-center text-[17px] shrink-0 text-left truncate 
                outline-none border rounded px-1 transition-colors
                ${isEditing 
                    ? 'bg-medgray_hover' 
                    : 'bg-transparent border-transparent cursor-pointer'
                }`}
        />
            
            <div className="flex flex-row w-full gap-2 justify-end">
                <button className="cursor-pointer shrink-0 justify-end" onClick={handleEyeOnClick}>
                    <img className="w-[20px] h-[20px]" src={isEyeOpen ? eyeOpen : eyeClosed} />
                </button>

                <button className="cursor-pointer shrink-0 justify-end" onClick={handleLockOnClick}>
                    <img className="w-[20px] h-[20px]" src={isLocked ? lockClose : lockOpen} />
                </button>

            </div>

            </button>

            {/* No indicator needed for below zone - it highlights the group instead */}

                <div
                className={`relative flex flex-col ml-9 gap-2 transition-all ${
                    isOpen ? "block" : "hidden"
                }`}
                >
                    { /* Vertical Line */ }
                    <div className="absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" />

                    {/* Top drop zone - for dropping at the very top of the group */}
                    <div
                        className="w-full relative h-2"
                        onDragOver={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            setLocalOverIndex(-1); 
                        }}
                        onDragEnter={(e) => { 
                            e.stopPropagation(); 
                            setLocalOverIndex(-1); 
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!draggingId) return;

                            const headerGlobalIdx = path.segments.findIndex(s => s.id === segmentId);
                            if (headerGlobalIdx === -1) return;

                            moveSegment(setPath, draggingId, headerGlobalIdx, { headerDrop: "top" });
                            setGlobalDraggingId(null);
                            setLocalOverIndex(null);
                        }}
                    >
                        {(localOverIndex === -1 || headerDropZone === "below") && draggingId !== null && draggingId !== segmentId && (
                            <div className="w-[390px] h-[2px] bg-white rounded-full mx-auto ml-2 absolute bottom-0" />
                        )}
                    </div>

                    {children.map((c, localIdx) => {
                        const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
                        const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);

                        const globalIdx = indexById.get(c.id) ?? -1;
                        if (globalIdx === -1) return null;

                        const isDraggingThis = draggingId === c.id;

                        return (
                            <div
                                key={c.id}
                                className="w-full relative"
                                onDragOver={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    if (!isDraggingThis) {
                                        setLocalOverIndex(localIdx); 
                                    }
                                }}
                                onDragEnter={(e) => {
                                    e.stopPropagation();
                                    if (!isDraggingThis) {
                                        setLocalOverIndex(localIdx);
                                    }
                                }}
                                onDrop={(e) => handleChildDrop(e, globalIdx)}
                            >
                                {localOverIndex === localIdx && draggingId !== null && !isDraggingThis && (
                                    <div className="w-[390px] h-[2px] bg-white rounded-full mx-auto ml-2 mb-2" />
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
                                        onDragEnd={() => { setGlobalDraggingId(null); setLocalOverIndex(null); }}
                                        onDragEnter={() => { if (draggingId !== c.id) setLocalOverIndex(localIdx); }}
                                        draggingId={draggingId}
                                        shrink={true}
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
                                        onDragEnd={() => { setGlobalDraggingId(null); setLocalOverIndex(null); }}
                                        onDragEnter={() => { if (draggingId !== c.id) setLocalOverIndex(localIdx); }}
                                        draggingId={draggingId}
                                        shrink={true}
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
                                        onDragEnd={() => { setGlobalDraggingId(null); setLocalOverIndex(null); }}
                                        onDragEnter={() => { if (draggingId !== c.id) setLocalOverIndex(localIdx); }}
                                        draggingId={draggingId}
                                        shrink={true}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Bottom drop zone - for dropping at the very bottom of the group */}
                    <div
                        className="w-[390px] relative h-2"
                        onDragOver={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            setLocalOverIndex(children.length); 
                        }}
                        onDragEnter={(e) => { 
                            e.stopPropagation(); 
                            setLocalOverIndex(children.length); 
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!draggingId) return;

                            const headerGlobalIdx = path.segments.findIndex((s) => s.id === segmentId);
                            if (headerGlobalIdx === -1) return;

                            moveSegment(setPath, draggingId, headerGlobalIdx, { headerDrop: "bottom" });
                            setGlobalDraggingId(null);
                            setLocalOverIndex(null);
                        }}
                    >
                        {localOverIndex === children.length && draggingId !== null && draggingId !== segmentId && (
                            <div className="w-[435px] h-[2px] bg-white rounded-full mx-auto ml-2 absolute top-0" />
                        )}
                    </div>

                </div>
        </div>
    );
}