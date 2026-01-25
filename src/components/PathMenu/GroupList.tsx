/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import filterOn from "../../assets/filter-on.svg";
import filterOff from "../../assets/filter-off.svg";
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
import { moveMultipleSegments } from "./PathConfigUtils";
import { useSimulateGroup } from "../../hooks/useSimulateGroup";

export type GroupDropZone = "above" | "into" | "below" | null;

type GroupListProps = {
    name: string,
    segmentId: string,
    isOpenGlobal: boolean,
    draggable?: boolean,
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnd?: (e: React.DragEvent<HTMLButtonElement>) => void,
    onDragEnter?: () => void,
    setDraggingIds?: React.Dispatch<React.SetStateAction<string[]>>,
    draggingIds?: string[],
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
    setDraggingIds,
    draggingIds = [],
    headerDropZone = null,
    onHeaderDropZoneChange,
}: GroupListProps) {
    const [ path, setPath ] = usePath(); 
    const [ format ] = useFormat();
    const [ , setSimulatedGroups ] = useSimulateGroup();

    const segment = path.segments.find(s => s.id === segmentId)!;
    
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(name);
    
    const setGlobalDraggingIds = setDraggingIds ?? (() => {});
    const [ localOverIndex, setLocalOverIndex ] = useState<number | null>(null);

    // Helper to start dragging - includes all selected segments if the dragged item is selected
    const startChildDragging = (childId: string) => {
        const child = path.segments.find(s => s.id === childId);
        if (child?.selected) {
            // Get all selected segments (excluding start segment at index 0)
            const selectedIds = path.segments
                .filter((s, idx) => s.selected && idx > 0)
                .map(s => s.id);
            setGlobalDraggingIds(selectedIds.length > 0 ? selectedIds : [childId]);
        } else {
            setGlobalDraggingIds([childId]);
        }
    };
    
    const groupKey = segment.groupId ?? segment.id;
    
    const indexById = new Map(path.segments.map((s, i) => [s.id, i] as const));
    
    const children = path.segments.filter(
        (s) => s.groupId === groupKey && s.kind !== "group"
    );

    const hasSelectedChildren = children.some(c => c.selected);

    const [ isFiltered, setIsFiltered ] = useState(false);
    const [ isEyeOpen, setEyeOpen ] = useState(true);
    const [ isLocked, setLocked ] = useState(false);
    const [ isOpen, setOpen ] = useState(false);

    const pathRef = useRef(path);
    pathRef.current = path;
    
    const headerRef = useRef<HTMLButtonElement>(null);
    
    const dropHandledRef = useRef(false);
    
    useEffect(() => {
        if (draggingIds.length > 0) {
            dropHandledRef.current = false;
        }
    }, [draggingIds]);
    
    
    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])
    
    
    const toggleSegment = (patch: (s: any) => any, addToHistory = true) => {
        setPath(prev => {
            
            const next = {
                ...prev,
                segments: prev.segments.map(s => (s.groupId === groupKey ? patch(s) : s)),
            };
            
            if (addToHistory) AddToUndoHistory({ path: next });
            return next;
        });
    };

    const handleOnClick = (evt: React.PointerEvent<HTMLButtonElement>) => {
        setPath(prev => {
            const selectedState = segment.selected;
            const next = {
                ...prev,
                segments: prev.segments.map(s => (s.groupId === groupKey || s.id === segmentId 
                    ? { ...s, selected: !selectedState } 
                    : { ...s, selected: false } 
                )),
            };
            
            return next;
        });
        evt.preventDefault();
        evt.stopPropagation();
    }

    const handleFilterOnClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        setIsFiltered(prev => {
            const newState = !prev;
            setSimulatedGroups(prevGroups => {
                if (newState) {
                    return prevGroups.includes(groupKey) ? prevGroups : [...prevGroups, groupKey];
                } else {
                    return prevGroups.filter(id => id !== groupKey);
                }
            });

            return newState;
        });
        evt.stopPropagation();
    }

    const handleEyeOnClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, visible: !segment.visible }));
        evt.stopPropagation();
    };

    const handleLockOnClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, locked: !segment.locked }));
        evt.stopPropagation();
    };

    const handleGroupOnHoverStart = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, hovered: true }), false);
        evt.stopPropagation();        
    }

    const handleGroupOnHoverEnd = (evt: React.MouseEvent<HTMLButtonElement>) => {
        toggleSegment(s => ({ ...s, hovered: false }), false);
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
        
    const getSpeed = (format: Format): number => {
        switch (format) {
            case "mikLib": return 12;
            case "ReveilLib": return 1;
            case "JAR-Template": return 12;
            case "LemLib": return 127;
        }
    }

    const speedScale = getSpeed(format);

    useEffect(() => {
        if (draggingIds.length === 0) {
            setLocalOverIndex(null);
        }
    }, [draggingIds]);

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

        if (draggingIds.includes(segmentId)) return;

        const zone = getDropZone(e);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(zone);
        }
    };

    const handleHeaderDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggingIds.includes(segmentId)) return;

        const zone = getDropZone(e);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(zone);
        }
    };

    const handleHeaderDrop = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggingIds.length === 0 || draggingIds.includes(segmentId)) return;

        dropHandledRef.current = true;

        const zone = getDropZone(e);

        const headerGlobalIdx = path.segments.findIndex(s => s.id === segmentId);
        if (headerGlobalIdx === -1) return;

        const currentDraggingIds = [...draggingIds];
        setGlobalDraggingIds([]);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(null);
        }

        if (zone === "above") {
            moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { skipGroupHandling: true });
        } else if (zone === "into" || zone === "below") {
            moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { headerDrop: "bottom" });
        }
    };

    const handleHeaderDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
        e.stopPropagation();
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

    // Highlight when hovering over header zones OR when hovering over children area (for drops into group)
    const isHoveringInto = draggingIds.length > 0 && !draggingIds.includes(segmentId) && (
        (headerDropZone === "into" || headerDropZone === "below") ||
        (localOverIndex !== null)
    );

    const handleContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggingIds.length === 0 || draggingIds.includes(segmentId)) return;

        dropHandledRef.current = true;

        const headerGlobalIdx = path.segments.findIndex(s => s.id === segmentId);
        if (headerGlobalIdx === -1) return;

        const currentDraggingIds = [...draggingIds];
        const currentZone = headerDropZone;
        const currentLocalOverIndex = localOverIndex;

        setGlobalDraggingIds([]);
        setLocalOverIndex(null);
        if (onHeaderDropZoneChange) {
            onHeaderDropZoneChange(null);
        }

        // Handle drops within the group's children based on localOverIndex
        if (currentLocalOverIndex !== null) {
            if (currentLocalOverIndex === children.length) {
                // Drop at end of group
                moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { headerDrop: "bottom" });
            } else {
                // Drop before a specific child
                const targetChild = children[currentLocalOverIndex];
                if (targetChild) {
                    const targetGlobalIdx = indexById.get(targetChild.id) ?? -1;
                    if (targetGlobalIdx !== -1) {
                        moveMultipleSegments(setPath, currentDraggingIds, targetGlobalIdx, { targetGroupId: groupKey });
                    }
                }
            }
            return;
        }

        // Handle header drop zones
        if (currentZone === "above") {
            moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { skipGroupHandling: true });
        } else if (currentZone === "into" || currentZone === "below") {
            moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { headerDrop: "bottom" });
        }
    };

    const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (headerDropZone !== null || localOverIndex !== null) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div 
            className={`flex flex-col gap-2 mt-[1px] relative`}
            onDragOver={handleContainerDragOver}
            onDrop={handleContainerDrop}
            onDragLeave={(e) => {
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
            {headerDropZone === "above" && draggingIds.length > 0 && !draggingIds.includes(segmentId) && (
                <div className="absolute -top-1 left-0 w-[450px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
            )}
            
            <button
                ref={headerRef}
                draggable={draggable}
                onDragStart={(e) => {
                    if (e.dataTransfer) {
                        e.dataTransfer.setData('text/plain', segmentId);
                        e.dataTransfer.effectAllowed = 'move';
                        // Hide the ghost image
                        const emptyImg = new Image();
                        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        e.dataTransfer.setDragImage(emptyImg, 0, 0);
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
                onClick={(evt: React.PointerEvent<HTMLButtonElement>) => {
                    if (isEditing) return;
                    handleOnClick(evt);
                }}
                onMouseEnter={handleGroupOnHoverStart}
                onMouseLeave={handleGroupOnHoverEnd}
                className={
                    `${isHoveringInto ? "bg-medlightgray brightness-125" : segment.selected ? "bg-medlightgray" : "bg-medgray"}
                    flex flex-row justify-start items-center
                    w-[450px] h-[35px] gap-[12px]
                    hover:brightness-95
                    rounded-lg pl-4 pr-4
                    transition-all duration-100
                    active:scale-[0.995]
                    
                    ${(hasSelectedChildren || isOpen) && !segment.selected && !isHoveringInto ? "border-2 border-medlightgray" : "border-2 border-transparent"}
                    ${draggingIds.includes(segmentId) ? "opacity-10" : ""}
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
                onPointerDownCapture={(e) => { if (isEditing) e.stopPropagation(); }}
                onPointerMoveCapture={(e) => { if (isEditing) e.stopPropagation(); }}
                ref={inputRef}
                value={value}
                style={{ maxWidth: '280px' }}
                readOnly={!isEditing}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsEditing(true);
                    setTimeout(() => {
                        inputRef.current?.focus();
                        inputRef.current?.select();
                    }, 0);
                }}
                onClick={(e) => {
                    if (isEditing) {
                        e.stopPropagation();
                    } else {
                        e.preventDefault();
                    }
                }}
                onBlur={() => {
                    setIsEditing(false);
                    setPath(prev => ({...prev, segments: prev.segments.map(s => 
                        s.id === segmentId 
                            ? { ...s, constants: value }
                            : s
                    )}));
                }}
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
                size={Math.max(value?.length, 1)}
                className={`items-center text-[17px] shrink-0 text-left truncate max-w-[280px]
                    outline-none px-1 transition-colors border-none rounded-sm
                    
                    ${isEditing 
                        ? 'bg-blackgrayhover cursor-text' 
                        : 'bg-transparent cursor-default'
                    }`}
            />
            
            <div className="flex flex-row w-full gap-2 justify-end">
                <button className="cursor-pointer shrink-0 justify-end" onClick={handleFilterOnClick}>
                    <img className="w-[20px] h-[20px]" src={isFiltered ? filterOn : filterOff} />
                </button>

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
                    <div className="absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" />

                    {children.map((c, localIdx) => {
                        const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
                        const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);

                        const globalIdx = indexById.get(c.id) ?? -1;
                        if (globalIdx === -1) return null;

                        const isDraggingThis = draggingIds.includes(c.id);
                        const showDropZone = localOverIndex === localIdx && draggingIds.length > 0 && !isDraggingThis;
                        const isLastChild = localIdx === children.length - 1;
                        const showBottomDropZone = isLastChild && localOverIndex === children.length && draggingIds.length > 0 && !isDraggingThis;

                        return (
                            <div
                                key={c.id}
                                className="w-full relative"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isDraggingThis) {
                                        // Use vertical position to determine above or below
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const y = e.clientY - rect.top;
                                        if (y < rect.height / 2) {
                                            setLocalOverIndex(localIdx);
                                        } else if (isLastChild) {
                                            setLocalOverIndex(children.length);
                                        } else {
                                            setLocalOverIndex(localIdx + 1);
                                        }
                                    }
                                }}
                                onDragEnter={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {/* Invisible drop zone extending into the gap above */}
                                <div
                                    className="absolute -top-2 left-0 w-full h-2 z-20"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!isDraggingThis) {
                                            setLocalOverIndex(localIdx);
                                        }
                                    }}
                                />
                                {/* Drop indicator line - centered in gap above */}
                                {showDropZone && (
                                    <div className="absolute -top-1 left-2 w-[390px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
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
                                        onDragStart={() => startChildDragging(c.id)}
                                        onDragEnd={() => { setGlobalDraggingIds([]); setLocalOverIndex(null); }}
                                        draggingIds={draggingIds}
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
                                        onDragStart={() => startChildDragging(c.id)}
                                        onDragEnd={() => { setGlobalDraggingIds([]); setLocalOverIndex(null); }}
                                        draggingIds={draggingIds}
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
                                        onDragStart={() => startChildDragging(c.id)}
                                        onDragEnd={() => { setGlobalDraggingIds([]); setLocalOverIndex(null); }}
                                        draggingIds={draggingIds}
                                        shrink={true}
                                    />
                                )}

                                {/* Drop indicator line - centered below last child */}
                                {showBottomDropZone && (
                                    <div className="absolute -bottom-1 left-2 w-[390px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
                                )}
                            </div>
                        );
                    })}

                </div>
        </div>
    );
}