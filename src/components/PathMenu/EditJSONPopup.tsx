import { setFormatDef, useFormat, useFormatDef } from "../../hooks/useFileFormat";
import { FORMAT_REGISTRY } from "../../simulation/FormatDefinition";
import type { SegmentKind } from "../../simulation/FormatDefinition";
import TextInput from "../Util/TextInput";
import cross from "../../assets/cross.svg"
import type { SetStateAction } from "react";
import React, { useEffect, useRef } from "react";
import { saveSnapshot } from "../../core/Undo/UndoHistory";

type EditJSONPopupProps = {
    onEnter: (text: string) => void;
    open: boolean;
    label: string;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function EditJSONPopup({
    open,
    setOpen
}: EditJSONPopupProps) {

    const popupRef = useRef<HTMLDivElement | null>(null);
    const templatesRef = useRef<Record<string, string>>({});

    const [format] = useFormat();
    const formatDef = useFormatDef();

    useEffect(() => {
        const initial: Record<string, string> = {};
        for (const [kind, segDef] of Object.entries(formatDef.segments)) {
            if (segDef?.exists) initial[kind] = segDef.toStringTemplate;
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
            if (existing && segDef) updatedSegments[kind as SegmentKind] = { ...existing, toStringTemplate: segDef.toStringTemplate };
        }
        setFormatDef({ ...formatDef, segments: updatedSegments });
        saveSnapshot();
        setOpen(false);
    }

    const handleOnSave = () => {
        const updatedSegments = { ...formatDef.segments };
        for (const [kind, template] of Object.entries(templatesRef.current)) {
            const existing = updatedSegments[kind as SegmentKind];
            if (existing) updatedSegments[kind as SegmentKind] = { ...existing, toStringTemplate: template };
        }
        setFormatDef({ ...formatDef, segments: updatedSegments });
        saveSnapshot();
        setOpen(false);
    }

    return (    
        <React.Fragment>
            { open && 
                <div 
                    className="
                        fixed inset-0 z-30
                        bg-black/10 backdrop-blur-[7px]
                        grid place-items-center
                        overflow-x-hidden"
                    >
                    <div 
                        className="
                            relative
                            -translate-y-[15%]
                            bg-medgray_hover w-auto h-auto p-4
                            flex flex-col gap-2
                            shadow-xs shadow-blackgray
                            rounded-lg
                        "
                        ref={popupRef}
                        >
                        <div className="flex flex-col gap-2 text-start ">
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
                            {(Object.entries(formatDef.segments) as [string, NonNullable<typeof formatDef.segments[keyof typeof formatDef.segments]>][]).filter(([, segDef]) => segDef.exists).map(([kind, segDef]) => (
                                <div key={kind} className="flex flex-row gap-1">
                                    <TextInput
                                        fontSize={16}
                                        unitsFontSize={14}
                                        width={800}
                                        height={40}
                                        units=""
                                        value={segDef.toStringTemplate}
                                        setValue={() => {}}
                                        focus={false}
                                        setText={(v) => { templatesRef.current[kind] = v; }}
                                        position="left"
                                    />
                                </div>
                            ))}
                            <span className="pt-2 text-[12px]">Editing these templates may affect pasting behavior and create bugs; variables are placed inside $&#123;&#125;</span>
                        </div>
                    </div>
                </div>
            }
        </React.Fragment>
    );
}