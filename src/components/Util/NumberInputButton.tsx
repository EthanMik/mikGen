import { saveSnapshot } from "../../core/Undo/UndoHistory";
import Checkbox from "./Checkbox";
import NumberInput from "./NumberInput";
import Tooltip from "./Tooltip";

type NumberInputButtonProps = {
    name: string;
    value: number;
    setValue: (v: number | null) => void;
    bounds: [number, number];
    stepSize: number;
    roundTo: number;
    units: string;
    label?: string;
};

export function NumberInputButton({ name, value, setValue, bounds, stepSize, roundTo, units, label }: NumberInputButtonProps) {
    return (
        <div className="flex flex-row pr-1 pl-2 items-center justify-between rounded-sm">
            <span className="text-[14px]">{name}</span>
            <Tooltip label={label}>
                <NumberInput
                    width={45}
                    height={28}
                    fontSize={14}
                    bounds={bounds}
                    stepSize={stepSize}
                    roundTo={roundTo}
                    units={units}
                    value={value}
                    setValue={setValue}
                    addToHistory={() => saveSnapshot()}
                />
            </Tooltip>
        </div>
    );
}

type NumberInputCheckboxButtonProps = NumberInputButtonProps & {
    checked: boolean;
    setChecked: (v: boolean) => void;
};

export function NumberInputCheckboxButton({ name, value, setValue, bounds, stepSize, roundTo, units, checked, setChecked }: NumberInputCheckboxButtonProps) {
    return (
        <div className="flex flex-row pr-1 pl-2 items-center justify-between rounded-sm">
            <span className="text-[14px]">{name}</span>
            <div className="flex flex-row items-center gap-1.5">
                <Checkbox checked={checked} setChecked={setChecked} size={18} />
                <div className={checked ? "" : "opacity-40 pointer-events-none"}>
                    <NumberInput
                        width={45}
                        height={28}
                        fontSize={14}
                        bounds={bounds}
                        stepSize={stepSize}
                        roundTo={roundTo}
                        units={units}
                        value={value}
                        setValue={setValue}
                        addToHistory={() => saveSnapshot()}
                    />
                </div>
            </div>
        </div>
    );
}