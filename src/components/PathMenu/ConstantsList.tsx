import { memo, useEffect, useRef, useState } from "react";
import downArrow from "../../assets/down-arrow.svg";
import ConstantRow from "./ConstantRow";
import { deepEqual } from "../../core/Util";
import { saveSnapshot, undoHistory } from "../../core/Undo/UndoHistory";
import type { ConstantsRecord, SegmentKind } from "../../simulation/FormatDefinition";
import { fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import { setGroupDefaults, writeGroup } from "./SegmentEdits";
import type { FieldView, GroupView } from "./SegmentView";
import Tooltip from "../Util/Tooltip";

type ConstantsListProps = {
    segmentId: string;
    kind: SegmentKind;
    group: GroupView;
}

/** Only the keys the segment actually carries, so an edit never writes an undefined back. */
function record(fields: FieldView[], pick: (f: FieldView) => unknown): ConstantsRecord {
    const result: ConstantsRecord = {};
    for (const field of fields) {
        const value = pick(field);
        if (value !== undefined) result[field.key] = value as ConstantsRecord[string];
    }
    return result;
}

const ConstantsList = memo(function ConstantsList({ segmentId, kind, group }: ConstantsListProps) {
    const [open, setOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [appliedValues, setAppliedValues] = useState<ConstantsRecord>({});
    const skipNextHistoryChange = useRef(false);
    const historyLength = undoHistory.useSelector((h) => h.length);

    // Anything that lands in history invalidates what "already applied" meant, except the apply
    // that pushed the entry itself
    useEffect(() => {
        if (skipNextHistoryChange.current) {
            skipNextHistoryChange.current = false;
            return;
        }
        setAppliedValues({});
    }, [historyLength]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedKeys(new Set());
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const hasSelection = selectedKeys.size > 0;
    const inSelection = (field: FieldView) => !hasSelection || selectedKeys.has(field.key);
    const picked = group.fields.filter(inSelection);

    const values = record(picked, f => f.value);
    const defaults = record(picked, f => f.defaultValue);

    const isDirty = !deepEqual(values, defaults);
    const isApplied = Object.entries(values).every(
        ([key, val]) => key in appliedValues && deepEqual(appliedValues[key], val)
    );
    // Segment-backed fields such as a wait's time have nowhere in formatDef to be stored
    const canSetDefault = picked.some(f => f.source.on === "constants");

    const write = (partial: ConstantsRecord) => updatePath(prev => writeGroup(prev, { segmentId }, group, partial));

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
                flex items-center w-[410px] mt-1 h-[29px] rounded-sm justify-between
                hover:brightness-90
                transition-all duration-100
                active:scale-[0.995]
                relative text-[14px]
                outline-2
                cursor-pointer
                ${open ? "outline-medlightgray" : "outline-transparent"}
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

                    <span className="text-white">{group.header}</span>

                </div>

                <div className="flex pr-5 gap-2">
                    <Tooltip label="Set default constants">
                        <button
                            className={`
                        bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                        transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                        ${!isDirty || !canSetDefault ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isDirty || !canSetDefault) return;
                                fileFormatStore.setState(prev => ({
                                    ...prev,
                                    formatDef: setGroupDefaults(prev.formatDef, kind, group, values),
                                }));
                                saveSnapshot();
                            }}
                        >
                            <span className="text-verylightgray">Default</span>
                        </button>
                    </Tooltip>

                    <Tooltip label="Reset to defaults">
                        <button
                            className={`
                        bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                        transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                        ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}
                        `}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isDirty) return;
                                write(defaults);
                                saveSnapshot();
                            }}
                        >
                            <span className="text-verylightgray">Reset</span>
                        </button>
                    </Tooltip>

                    <Tooltip label="Apply to all segments">
                        <button
                            className={`
                        bg-medgray px-2 rounded-sm
                        transition-all duration-100 active:scale-[0.995]
                        ${isApplied ? "opacity-40 cursor-not-allowed" : "hover:bg-medgray_hover cursor-pointer active:bg-medgray_hover/70"}
                        `}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isApplied) return;
                                skipNextHistoryChange.current = true;
                                setAppliedValues(prev => ({ ...prev, ...values }));
                                updatePath(prev => writeGroup(prev, { kind }, group, values));
                                saveSnapshot();
                            }}
                        >
                            <span className="text-verylightgray">Apply</span>
                        </button>
                    </Tooltip>

                </div>
            </button>


            {open && (
                <div className="relative">
                    <div className="grid grid-cols-2 min-w-0 pl-5 gap-x-1 mt-1.5 w-[400px] gap-[3px]">
                        {group.fields.map((field) => (
                            <ConstantRow
                                key={field.key}
                                field={field}
                                modified={!deepEqual(field.value, field.defaultValue)}
                                selected={selectedKeys.has(field.key)}
                                onToggleSelect={() => toggleKey(field.key)}
                                onChange={(v) => { if (v !== null) write({ [field.key]: v }); }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default ConstantsList;
