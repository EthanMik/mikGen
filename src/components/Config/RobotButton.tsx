import { useRef } from "react";
import CheckboxButton from "../Util/CheckboxButton";
import Checkbox from "../Util/Checkbox";
import NumberInput from "../Util/NumberInput";
import { useFormat, mergeRobot, fileFormatStore, type Format } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { changeFormat } from "../../simulation/FormatDefinition";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";

type NumberInputButtonProps = {
    name: string;
    value: number;
    setValue: (v: number | null) => void;
    bounds: [number, number];
    stepSize: number;
    roundTo: number;
    units: string;
};

export function NumberInputButton({ name, value, setValue, bounds, stepSize, roundTo, units }: NumberInputButtonProps) {
    return (
        <div className="flex flex-row pr-1 pl-2 items-center justify-between rounded-sm">
            <span className="text-[14px]">{name}</span>
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
    );
}

type NumberInputCheckboxButtonProps = NumberInputButtonProps & {
    checked: boolean;
    setChecked: (v: boolean) => void;
};

function NumberInputCheckboxButton({ name, value, setValue, bounds, stepSize, roundTo, units, checked, setChecked }: NumberInputCheckboxButtonProps) {
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

type ExpansionSide = "Front" | "Left" | "Right" | "Rear";

export default function RobotButton() {
    const [format] = useFormat();
    const prevFormatRef = useRef<Format>(format);
    const robot = fileFormatStore.useSelector(s => s.robot);

    const handleExpansionChange = (side: ExpansionSide, v: number | null) => {
        if (v === null) return;
        mergeRobot({ [`expansion${side}`]: v });
    };

    const handleExpansionToggle = (side: ExpansionSide, checked: boolean) => {
        mergeRobot({ [`expansion${side}Disabled`]: !checked });
        saveSnapshot();
    };

    const handleToggleHolonomic = (checked: boolean) => {
        const newFormat = checked ? "Holonomic" : "mikLib";
        const changed = prevFormatRef.current !== newFormat;
        changeFormat(newFormat);
        if (changed) saveSnapshot();
        prevFormatRef.current = newFormat;
    };

    return (
        <ConfigButtonTemplate title="Robot">
            <div className="flex flex-col gap-1.5">
                <Section name="General">
                    <NumberInputButton name="Width" value={robot.width} setValue={v => v !== null && mergeRobot({ width: v })} bounds={[0, 30]} stepSize={1} roundTo={1} units="in" />
                    <NumberInputButton name="Height" value={robot.height} setValue={v => v !== null && mergeRobot({ height: v })} bounds={[0, 30]} stepSize={1} roundTo={1} units="in" />
                    <NumberInputButton name="Speed" value={robot.speed} setValue={v => v !== null && mergeRobot({ speed: v })} bounds={[0, 100]} stepSize={0.5} roundTo={2} units="ft/s" />
                </Section>

                <Section name="Time Constant (Accel)" defaultCollapsed>
                    <NumberInputButton name="Drive" value={robot.lateralTau} setValue={v => v !== null && mergeRobot({ lateralTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                    <NumberInputButton name="Turn" value={robot.angularTau} setValue={v => v !== null && mergeRobot({ angularTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                </Section>

                <Section name="Expansion" defaultCollapsed>
                    {(["Front", "Left", "Right", "Rear"] as const).map((side) => (
                        <NumberInputCheckboxButton
                            key={side}
                            name={side}
                            value={robot[`expansion${side}`]}
                            setValue={v => handleExpansionChange(side, v)}
                            bounds={[0, 30]}
                            stepSize={0.5}
                            roundTo={2}
                            units="in"
                            checked={!robot[`expansion${side}Disabled`]}
                            setChecked={checked => handleExpansionToggle(side, checked)}
                        />
                    ))}
                </Section>

                <Section name="CoG Offset" defaultCollapsed>
                    <NumberInputButton name="Lateral" value={robot.cogOffsetX} setValue={v => v !== null && mergeRobot({ cogOffsetX: v })} bounds={[-15, 15]} stepSize={0.5} roundTo={2} units="in" />
                    <NumberInputButton name="Forward" value={robot.cogOffsetY} setValue={v => v !== null && mergeRobot({ cogOffsetY: v })} bounds={[-15, 15]} stepSize={0.5} roundTo={2} units="in" />
                </Section>

                {(format === "mikLib" || format === "Holonomic") && (
                    <Section name="Robot Type" defaultCollapsed>
                        <CheckboxButton name="Holonomic" checked={format === "Holonomic"} setChecked={handleToggleHolonomic} />
                    </Section>
                )}
            </div>
        </ConfigButtonTemplate>
    );
}
