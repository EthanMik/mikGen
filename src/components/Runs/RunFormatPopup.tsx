import cross from "../../assets/cross.svg";
import type { SetStateAction } from "react";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RUN_FORMAT_COLUMNS, RUN_FORMAT_EXAMPLE } from "../../core/RunValidation";

type RunFormatPopupProps = {
    /** The file that failed, named in the heading so it is clear which one to fix. */
    fileName: string;
    /** What was wrong with it, one entry per problem. */
    problems: string[];
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Shown when a run log cannot be loaded. Says what was wrong with that particular file, then lays
 * out the format a run log has to follow, so the reader can fix the file rather than guess.
 *
 * Deliberately built the same way as FileRenamePopup and EditTemplatePopup: the same props, the
 * same portal, backdrop, card and close button, the same text sizes and colours, and the same
 * dismissal by Escape or a click outside. It should read as one more popup of the app, not a new
 * kind of window.
 */
export default function RunFormatPopup({
    fileName,
    problems,
    open,
    setOpen
}: RunFormatPopupProps) {
    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
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

    }, [setOpen])

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
                    <div
                        className="
                            relative
                            -translate-y-[5%]
                            bg-medgray_hover h-auto p-4
                            w-[600px]
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
                            <span className="text-[16px] text-white">
                                {`Could not load run "${fileName}"`}
                            </span>

                            {problems.map((problem, i) => (
                                <span key={i} className="text-[14px] text-white">{problem}</span>
                            ))}

                            <div className="flex flex-col gap-1 pt-2">
                                <span className="text-[16px] text-white">{"Expected Format"}</span>
                                <span className="text-[12px] text-lightgray">
                                    A CSV file with a header row containing these four columns. Columns are matched by name, so their order does not matter, and any other columns are ignored.
                                </span>
                            </div>

                            {/* One row per column, named the way the header must spell it */}
                            {RUN_FORMAT_COLUMNS.map(column => (
                                <div key={column.name} className="flex flex-row gap-2">
                                    <span className="text-[12px] text-white w-[70px] shrink-0">{column.name}</span>
                                    <span className="text-[12px] text-white">{column.meaning}</span>
                                </div>
                            ))}

                            <div className="flex flex-col gap-1 pt-2">
                                <span className="text-[12px] text-lightgray">Example</span>
                                <span className="bg-blackgray rounded-lg text-white text-[12px] px-4 py-2 whitespace-pre overflow-x-auto">
                                    {RUN_FORMAT_EXAMPLE}
                                </span>
                            </div>

                            <span className="pt-2 text-[12px]">Lines starting with # are ignored. A run can be loaded with or without a path open; cross track error is worked out from the open path.</span>
                        </div>
                    </div>
                </div>,
            document.body)}
        </React.Fragment>
    );
}
