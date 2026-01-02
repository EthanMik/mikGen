/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import downArrow from "../../assets/down-arrow.svg";
import type { ConstantField } from "./ConstantRow";
import ConstantRow from "./ConstantRow";

type ConstantsListProps = {
    header: string;
    values: any;
    fields: ConstantField[];
    onChange: (constants: Partial<any>) => void,
    onReset: () => void;
    isOpenGlobal: boolean;
}

export default function ConstantsList({
    header,
    values,
    fields,
    onChange,
    onReset,
    isOpenGlobal,
}: ConstantsListProps) {
    const [ open, setOpen ] = useState(false);

    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])

    return (
        <div className="flex flex-col">
            <div className="flex items-center w-[410px] h-[30px] 
                rounded-lg justify-between"
            >
                <div className="flex pl-2 gap-2">
                    <button className="cursor-pointer" 
                        onClick={() => setOpen(!open)}>
                        { !open ? 
                            <img className="w-[12px] h-[12px] rotate-270" src={downArrow}/> : 
                            <img className="w-[12px] h-[12px]" src={downArrow}/>
                        }
                    </button>
                    <span>{header}</span>   
                </div>
                <div className="flex pr-5 gap-2">
                    {/* <button className="bg-medlightgray hover:bg-medgray_hover px-2 rounded-sm">
                        <span className="text-verylightgray">
                            Set Default
                        </span>
                    </button> */}

                    <button className="
                        bg-medlightgray hover:bg-medgray_hover px-2 rounded-sm
                        transition-all duration-100
                        active:scale-[0.995]
                        active:bg-medgray_hover/70      
                        "
                        onClick={() => onReset()}
                    >
                        <span className="text-verylightgray">
                            Reset
                        </span>
                    </button>

                </div>
            </div>


            {open && (
                <div className="grid grid-cols-2 min-w-0 pl-5 gap-2 mt-1 w-[400px]">
                    {fields.map((f) => (
                        <ConstantRow 
                            key={String(f.key)}
                            label={f.label}
                            value={values[f.key]}
                            input={f.input}
                            units={f.units}
                            onChange={(v: number | null) => onChange({ [f.key]: v } as Partial<any>)}
                        />
                    ))}
                </div>

            )}
        </div>
    );
}