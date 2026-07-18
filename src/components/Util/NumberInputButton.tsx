import { saveSnapshot } from "../../core/Undo/UndoHistory";
import Checkbox from "./Checkbox";
import NumberInput from "./NumberInput";
import Tooltip from "./Tooltip";

type NumberInputButtonProps = {
    name?: string;
    value: number;
    setValue: (v: number | null) => void;
    bounds: [number, number];
    stepSize: number;
    roundTo: number;
    units: string;
    label?: string;
    labelSpeed?: "fast" | "slow";
};

export function NumberInputButton({ name, value, labelSpeed, setValue, bounds, stepSize, roundTo, units, label }: NumberInputButtonProps) {
    return (
        <div className="flex flex-row pr-1 pl-2 items-center justify-between rounded-sm">
            <span className="text-[14px]">{name}</span>
            <Tooltip label={label} speed={labelSpeed}>
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

type DualNumberInputCheckboxButtonProps = {
    name: string;
    checked: boolean;
    setChecked: (v: boolean) => void;
    numberInputs: NumberInputButtonProps[];
    color?: string;
};

export function DualNumberInputCheckboxButton({ numberInputs, name, checked, setChecked, color }: DualNumberInputCheckboxButtonProps) {
    return (
        <div className="relative flex flex-row pr-1 pl-2 items-center justify-between rounded-sm">
            {color && <span className="absolute inset-y-0 left-0.5 w-1 h-5 self-center rounded-sm" style={{ backgroundColor: color }} />}
            <span style={color ? { paddingLeft: "6px" } : undefined} className="text-[14px]">{name}</span>
            <div className="flex flex-row items-center gap-1.5">
                <Checkbox checked={checked} setChecked={setChecked} size={18} />
                <div className={checked ? "flex flex-row gap-1" : "flex flex-row gap-1 opacity-40 pointer-events-none"}>
                    {numberInputs.map((n) => (
                        <div key={n.name} className="flex flex-col gap-1">
                            <Tooltip label={n.label} speed={n.labelSpeed}>
                                <NumberInput
                                    width={38}
                                    height={28}
                                    fontSize={14}
                                    bounds={n.bounds}
                                    stepSize={n.stepSize}
                                    roundTo={n.roundTo}
                                    units={n.units}
                                    value={n.value}
                                    setValue={n.setValue}
                                    addToHistory={() => saveSnapshot()}
                                />
                            </Tooltip>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}