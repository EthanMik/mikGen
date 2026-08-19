import { saveSnapshot } from "../../core/Undo/UndoHistory";
import NumberInput from "../Util/NumberInput";
import type { FieldView } from "./SegmentView";

type ConstantRowProps = {
    field: FieldView;
    /** Dimmed when the value has moved off the format's default. */
    modified: boolean;
    selected: boolean;
    onToggleSelect: () => void;
    onChange: (value: number | null) => void;
};

export default function ConstantRow({ field, modified, selected, onToggleSelect, onChange }: ConstantRowProps) {
    const { value } = field;

    return (
        <div className={`flex flex-row items-center
            justify-between h-[32px] pr-1.5 pl-1.5 rounded-md

            hover:brightness-86
            transition-all duration-100
            active:scale-[0.995]
            ${selected ? "bg-medlightgray" : ""}`}
        >
            <button
                className={`w-[200px] text-left text-[14px] ${modified ? "text-white/50" : "text-white"} cursor-pointer`}
                onClick={onToggleSelect}
            >
                {field.label}
            </button>
            <NumberInput
                width={43}
                height={27}
                fontSize={14}
                value={typeof value === "number" ? value : typeof value === "boolean" ? (value ? 1 : 0) : null}
                setValue={onChange}
                units={field.units}
                bounds={field.input?.bounds ?? [0, 100]}
                stepSize={field.input?.stepSize ?? 1}
                roundTo={field.input?.roundTo ?? 5}
                addToHistory={() => { saveSnapshot(); }}
            />
        </div>
    );
}
