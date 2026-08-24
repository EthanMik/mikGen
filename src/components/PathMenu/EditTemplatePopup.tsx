import { setFormatDef, useFormat, useFormatDef } from "../../hooks/useFileFormat";
import { FORMAT_REGISTRY } from "../../simulation/FormatDefinition";
import type { SegmentKind } from "../../simulation/FormatDefinition";
import TextInput from "../Util/TextInput";
import cross from "../../assets/cross.svg"
import type { SetStateAction } from "react";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { saveSnapshot } from "../../core/Undo/UndoHistory";

type EditTemplatePopupProps = {
    onEnter: (text: string) => void;
    open: boolean;
    label: string;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function EditTemplatePopup({
    open,
    setOpen
}: EditTemplatePopupProps) {

    const popupRef = useRef<HTMLDivElement | null>(null);
    /** Edits in flight, keyed by segment kind. A kind that expands points carries both strings. */
    const templatesRef = useRef<Record<string, { toStringTemplate: string; pointTemplate?: string }>>({});

    const [format] = useFormat();
    const formatDef = useFormatDef();

    useEffect(() => {
        const initial: Record<string, { toStringTemplate: string; pointTemplate?: string }> = {};
        for (const [kind, segDef] of Object.entries(formatDef.segments)) {
            if (segDef && !segDef.castTo && segDef.toStringTemplate) {
                initial[kind] = { toStringTemplate: segDef.toStringTemplate, pointTemplate: segDef.pointTemplate };
            }
        }
        templatesRef.current = initial;
    }, [open]);

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.key === "Enter") {
                handleOnSave();
            }
            if (evt.key === "Escape") {
                setOpen(false);
            }

        }

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [])


    const handleReset = () => {
        const registrySegments = FORMAT_REGISTRY[format].segments;
        const updatedSegments = { ...formatDef.segments };
        for (const [kind, segDef] of Object.entries(registrySegments)) {
            const existing = updatedSegments[kind as SegmentKind];
            if (existing && segDef) updatedSegments[kind as SegmentKind] = {
                ...existing,
                toStringTemplate: segDef.toStringTemplate,
                pointTemplate: segDef.pointTemplate,
            };
        }
        setFormatDef({ ...formatDef, segments: updatedSegments });
        saveSnapshot();
        setOpen(false);
    }

    const handleOnSave = () => {
        const updatedSegments = { ...formatDef.segments };
        for (const [kind, edited] of Object.entries(templatesRef.current)) {
            const existing = updatedSegments[kind as SegmentKind];
            if (existing) updatedSegments[kind as SegmentKind] = {
                ...existing,
                toStringTemplate: edited.toStringTemplate,
                // Only carried by kinds that expand a ${points:N} vector; left off the rest
                ...(edited.pointTemplate !== undefined ? { pointTemplate: edited.pointTemplate } : {}),
            };
        }
        setFormatDef({ ...formatDef, segments: updatedSegments });
        saveSnapshot();
        setOpen(false);
    }

    return (
        <React.Fragment>
            { open && createPortal(
                <div
                    className="
                        fixed inset-0 z-[60]
                        bg-black/10 backdrop-blur-[7px]
                        grid place-items-center
                        overflow-x-hidden"
                    >
                    {/* The panel spans the viewport less a 500px gutter per side and the rows fill it, so the
                        box and its inputs resize together. The floor keeps it usable on a window narrower
                        than the two gutters combined */}
                    <div
                        className="
                            relative
                            -translate-y-[5%]
                            bg-medgray_hover h-auto p-4
                            w-[calc(100vw-500px)] min-w-[600px]
                            flex flex-col gap-2
                            shadow-xs shadow-blackgray
                            rounded-lg
                        "
                        ref={popupRef}
                        >
                        <div className="flex flex-col gap-2 text-start">
                            <button 
                                className="fixed right-2 top-2 px-0.5 py-0.5 rounded-sm hover:bg-blackgrayhover"
                                onClick={() => setOpen(false)}
                            >
                                <img 
                                    className="w-[25px] h-[25px]"
                                    src={cross}
                                >
                                </img>
                            </button>
                            <button
                                className="fixed right-23 top-2 px-2 py-0.5 rounded-sm hover:bg-blackgrayhover"
                                onClick={handleReset}
                            >
                                <span className="text-lightgray" >Reset</span>
                            </button>
                            <button
                                className="fixed right-10 top-2 px-2 py-0.5 rounded-sm hover:bg-blackgrayhover"
                                onClick={handleOnSave}
                            >
                                <span>Save</span>
                            </button>
                            <span className="text-[16px] text-white">
                                {"Templates"}
                            </span>
                            {(Object.entries(formatDef.segments) as [string, NonNullable<typeof formatDef.segments[keyof typeof formatDef.segments]>][]).filter(([, segDef]) => !segDef.castTo && segDef.toStringTemplate).map(([kind, segDef]) => (
                                <div key={kind} className="flex flex-col gap-1 ">
                                    {/* Named, so a column of otherwise identical inputs says which motion each drives */}
                                    <span className="text-[12px] text-lightgray">{segDef.name ?? kind}</span>
                                    <TextInput
                                        fontSize={16}
                                        unitsFontSize={14}
                                        width="100%"
                                        height={40}
                                        units=""
                                        value={segDef.toStringTemplate ?? ''}
                                        setValue={() => {}}
                                        focus={false}
                                        setText={(v) => { templatesRef.current[kind] = { ...templatesRef.current[kind], toStringTemplate: v }; }}
                                        position="left"
                                    />
                                    {/* The body of one entry in a ${points:N} vector, indented under the call it fills */}
                                    {segDef.pointTemplate !== undefined && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] text-lightgray">$&#123;points:N&#125;  with N being the distance between waypoints</span>
                                            <TextInput
                                                fontSize={16}
                                                unitsFontSize={14}
                                                width="100%"
                                                height={40}
                                                units=""
                                                value={segDef.pointTemplate}
                                                setValue={() => {}}
                                                focus={false}
                                                setText={(v) => { templatesRef.current[kind] = { toStringTemplate: templatesRef.current[kind]?.toStringTemplate ?? segDef.toStringTemplate ?? '', pointTemplate: v }; }}
                                                position="left"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <span className="pt-2 text-[12px]">Editing these templates may affect pasting behavior and create bugs; variables are placed inside $&#123;&#125;.</span>
                        </div>
                    </div>
                </div>,
            document.body)}
        </React.Fragment>
    );
}