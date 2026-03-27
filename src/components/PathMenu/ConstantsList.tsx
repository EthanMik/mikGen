/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useRef, useState } from "react";
import downArrow from "../../assets/down-arrow.svg";
import type { ConstantField } from "./ConstantRow";
import ConstantRow from "./ConstantRow";
import { deepEqual } from "../../core/Util";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";
import { usePath } from "../../hooks/usePath";

type ConstantsListProps = {
    header: string;
    values: any;
    fields: ConstantField[];
    onChange: (constants: Partial<any>) => void,
    onSetDefault: (constants: Partial<any>) => void,
    onReset: () => void;
    onApply: (constants: Partial<any>) => void;
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
    onApply,
    isOpenGlobal,
    defaults,
}: ConstantsListProps) {
    const [open, setOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [path] = usePath();
    const undoRef = useRef(false);

    useEffect(() => {
        if (undoRef.current) {
            AddToUndoHistory({ path });
            undoRef.current = false;
        }
    }, [path]);

    useEffect(() => {
        setOpen(isOpenGlobal)
    }, [isOpenGlobal])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedKeys(new Set());
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const hasSelection = selectedKeys.size > 0;

    const isDirty = (() => {
        if (!hasSelection) return !deepEqual(values, defaults);
        for (const key of selectedKeys) {
            if (!deepEqual(values[key], defaults[key])) return true;
        }
        return false;
    })();

    const buildSelectedPartial = (source: any): Partial<any> => {
        const partial: Partial<any> = {};
        for (const key of selectedKeys) {
            partial[key] = source[key];
        }
        return partial;
    };

    const toggleKey = (key: string) => {
        setSelectedKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="flex flex-col">
            <button
                className={`
                flex items-center w-[410px] h-[35px] rounded-lg justify-between
                hover:brightness-90
                transition-all duration-100
                active:scale-[0.995]
                ${isDirty ? "bg-medlightgray " : ""}
                relative
            `}
                onClick={() => setOpen(!open)}
            >

                <div className="flex pl-2 gap-2 items-center">
                    <button className="cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setOpen(!open)
                    }}>
                        <img className={`w-[12px] h-[12px] transition-transform duration-200 ${open ? "" : "-rotate-90"}`} src={downArrow} />
                    </button>

                    <span className="text-white">{header}</span>

                </div>

                <div className="flex pr-5 gap-2">
                    <button
                        className={`
                        bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                        transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                        ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDirty) return;
                            const vals = hasSelection ? buildSelectedPartial(values) : values;
                            onSetDefault(vals);
                        }}
                    >
                        <span className="text-verylightgray">Default</span>
                    </button>

                    <button
                        className={`
                        bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                        transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                        ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}
                        `}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDirty) return;
                            if (hasSelection) {
                                undoRef.current = true;
                                onChange(buildSelectedPartial(defaults));
                            } else {
                                onReset();
                            }
                        }}
                    >
                        <span className="text-verylightgray">Reset</span>
                    </button>

                    <button
                        className={`
                        bg-medgray hover:bg-medgray_hover px-2 rounded-sm cursor-pointer
                        transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                        `}
                        onClick={(e) => {
                            e.stopPropagation();
                            undoRef.current = true;
                            const vals = hasSelection ? buildSelectedPartial(values) : values;
                            onApply(vals);
                        }}
                    >
                        <span className="text-verylightgray">Apply</span>
                    </button>

                </div>
            </button>


            {open && (
                <Fragment>
                    <div className="relative grid grid-cols-2 min-w-0 pl-5 gap-1.5 mt-2 w-[400px]">
                        {fields.map((f) => (
                            <ConstantRow
                                key={String(f.key)}
                                label={f.label}
                                value={values[f.key]}
                                input={f.input}
                                units={f.units}
                                onChange={(v: number | null) => onChange({ [f.key]: v } as Partial<any>)}
                                labelColor={deepEqual(values[f.key], defaults[f.key]) ? "text-white" : "text-white/50"}
                                selected={selectedKeys.has(String(f.key))}
                                onToggleSelect={() => toggleKey(String(f.key))}
                            />
                        ))}
                    </div>
                </Fragment>
            )}
        </div>
    );
}
