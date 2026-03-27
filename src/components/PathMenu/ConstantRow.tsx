/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";
import { usePath } from "../../hooks/usePath";
import NumberInput from "../Util/NumberInput";

export type NumberInputSettings = {
  bounds?: [number, number];
  stepSize?: number;
  roundTo?: number;
};

export type ConstantField = {
  key: any;
  label: string;
  units?: string;
  input?: NumberInputSettings;
};

type ConstantRowProps = {
  label: string;
  labelColor?: string;
  units?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  input?: NumberInputSettings;
  selected?: boolean;
  onToggleSelect?: () => void;
};

export default function ConstantRow({
    label,
    value,
    labelColor = "text-white",
    units = "",
    onChange,
    input,
    selected = false,
    onToggleSelect,
} : ConstantRowProps) {
    const [ path, ] = usePath();

    const undoRef = useRef(false);

    useEffect(() => {
      if (undoRef.current) {
        AddToUndoHistory( { path: path});
        undoRef.current = false;
      }
    }, [path])

    return (
        <div className={`flex flex-row items-center
            justify-between h-[40px] pr-2 pl-2 gap-1 rounded-lg
            
            hover:brightness-90
            transition-all duration-100
            active:scale-[0.995]
            ${selected ? "bg-medlightgray" : ""}`}
        >
            <button
                className={`w-[100px] text-left ${labelColor} ${onToggleSelect ? "cursor-pointer" : "cursor-default"}`}
                onClick={onToggleSelect}
            >
                {label}
            </button>
            <NumberInput
                width={55}
                height={30}
                fontSize={16}
                value={value}
                setValue={onChange}
                units={units}
                bounds={input?.bounds ?? [0, 100]}
                stepSize={input?.stepSize ?? 1}
                roundTo={input?.roundTo ?? 5}
                addToHistory={ () => { undoRef.current = true; } }
            />
        </div>
    );
}