/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useState } from "react";
import downArrow from "../../assets/down-arrow.svg";
import type { ConstantField } from "./ConstantRow";
import ConstantRow from "./ConstantRow";
import { deepEqual } from "../../core/Util";

type ConstantsListProps = {
    header: string;
    values: any;
    fields: ConstantField[];
    onChange: (constants: Partial<any>) => void,
    onSetDefault: (constants: Partial<any>) => void,
    onReset: () => void;
    isOpenGlobal: boolean;
    defaults: Partial<any>;
}

export default function ConstantsList({
    header,
    values,
    fields,
    onChange,
    onSetDefault,
    onReset,
    isOpenGlobal,
    defaults,
}: ConstantsListProps) {
    const [ open, setOpen ] = useState(false);

    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])

    const isDirty = !deepEqual(values, defaults);

    return (
        <div className="flex flex-col">
            <div
            className={`
                flex items-center w-[410px] h-[35px] rounded-lg justify-between
                ${isDirty ? "bg-medlightgray " : ""}
                relative
            `}
            >

            <div className="flex pl-2 gap-2 items-center">
                <button className="cursor-pointer" onClick={() => setOpen(!open)}>
                {!open ? (
                    <img className="w-[12px] h-[12px] rotate-270" src={downArrow} />
                ) : (
                    <img className="w-[12px] h-[12px]" src={downArrow} />
                )}
                </button>

                <span className="text-white">{header}</span>

            </div>

            <div className="flex pr-5 gap-2">
                <button
                className={`
                    bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                    transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                    ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}
                `}
                onClick={() => {
                    if (!isDirty) return;
                    onSetDefault(values)
                }}
                >
                <span className="text-verylightgray">Set Default</span>
                </button>

                <button
                className={`
                    bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                    transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                    ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}
                `}
                onClick={() => {
                    if (!isDirty) return;
                    onReset()
                }}
                >
                <span className="text-verylightgray">Reset</span>
                </button>
                
            </div>
        </div>


            {open && (
                <Fragment>
                    <div className="relative grid grid-cols-2 min-w-0 pl-5 gap-2 mt-2 w-[400px]">
                        {/* <div className="absolute left-[11px] top-0 h-full w-[4px] rounded-full bg-medlightgray" /> */}
                        {fields.map((f) => (
                            <ConstantRow 
                                key={String(f.key)}
                                label={f.label}
                                value={values[f.key]}
                                input={f.input}
                                units={f.units}
                                onChange={(v: number | null) => onChange({ [f.key]: v } as Partial<any>)}
                                labelColor={deepEqual(values[f.key], defaults[f.key]) ? "text-white" : "text-white/50"}
                            />
                        ))}
                    </div>
                </Fragment>
            )}
        </div>
    );
}