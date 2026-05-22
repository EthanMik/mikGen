import { useRef, useState } from "react";
import CheckboxButton from "../Util/CheckboxButton";
import Checkbox from "../Util/Checkbox";
import NumberInput from "../Util/NumberInput";
import { useFormat, mergeRobot, fileFormatStore, type Format } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { changeFormat } from "../../simulation/FormatDefinition";
import Separator from "../Util/Separator";
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

function NumberInputButton({ name, value, setValue, bounds, stepSize, roundTo, units }: NumberInputButtonProps) {
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

    type Section = "General" | "Time Constant (Accel)" | "Expansion" | "CoG Offset" | "Robot Type";
    const [collapsedSections, setCollapsedSections] = useState<Set<Section>>(new Set(["Time Constant (Accel)", "Expansion", "CoG Offset", "Robot Type"] as Section[]));

    const [storedExpansion, setStoredExpansion] = useState<Record<ExpansionSide, number>>({
        Front: robot.expansionFront > 0 ? robot.expansionFront : 4,
        Left: robot.expansionLeft > 0 ? robot.expansionLeft : 4,
        Right: robot.expansionRight > 0 ? robot.expansionRight : 4,
        Rear: robot.expansionRear > 0 ? robot.expansionRear : 4,
    });

    const [expansionEnabled, setExpansionEnabled] = useState<Record<ExpansionSide, boolean>>({
        Front: robot.expansionFront > 0,
        Left: robot.expansionLeft > 0,
        Right: robot.expansionRight > 0,
        Rear: robot.expansionRear > 0,
    });

    const toggleSection = (name: Section) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
    };

    const handleExpansionChange = (side: ExpansionSide, v: number | null) => {
        if (v === null) return;
        setStoredExpansion(prev => ({ ...prev, [side]: v }));
        if (expansionEnabled[side]) mergeRobot({ [`expansion${side}`]: v });
    };

    const handleExpansionToggle = (side: ExpansionSide, checked: boolean) => {
        setExpansionEnabled(prev => ({ ...prev, [side]: checked }));
        mergeRobot({ [`expansion${side}`]: checked ? storedExpansion[side] : 0 });
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
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                    <Separator name="General" onClick={() => toggleSection("General")} isCollapsed={collapsedSections.has("General")} />
                    {!collapsedSections.has("General") && <>
                        <NumberInputButton name="Width" value={robot.width} setValue={v => v !== null && mergeRobot({ width: v })} bounds={[0, 30]} stepSize={1} roundTo={1} units="in" />
                        <NumberInputButton name="Height" value={robot.height} setValue={v => v !== null && mergeRobot({ height: v })} bounds={[0, 30]} stepSize={1} roundTo={1} units="in" />
                        <NumberInputButton name="Speed" value={robot.speed} setValue={v => v !== null && mergeRobot({ speed: v })} bounds={[0, 100]} stepSize={0.5} roundTo={2} units="ft/s" />
                    </>}
                </div>

                <div className="flex flex-col gap-2">
                    <Separator name="Time Constant (Accel)" onClick={() => toggleSection("Time Constant (Accel)")} isCollapsed={collapsedSections.has("Time Constant (Accel)")} />
                    {!collapsedSections.has("Time Constant (Accel)") && <>
                        <NumberInputButton name="Drive" value={robot.lateralTau} setValue={v => v !== null && mergeRobot({ lateralTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                        <NumberInputButton name="Turn" value={robot.angularTau} setValue={v => v !== null && mergeRobot({ angularTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                    </>}
                </div>

                <div className="flex flex-col gap-2">
                    <Separator name="Expansion" onClick={() => toggleSection("Expansion")} isCollapsed={collapsedSections.has("Expansion")} />
                    {!collapsedSections.has("Expansion") && (["Front", "Left", "Right", "Rear"] as const).map((side) => (
                        <NumberInputCheckboxButton
                            key={side}
                            name={side}
                            value={storedExpansion[side]}
                            setValue={v => handleExpansionChange(side, v)}
                            bounds={[0, 30]}
                            stepSize={0.5}
                            roundTo={2}
                            units="in"
                            checked={expansionEnabled[side]}
                            setChecked={checked => handleExpansionToggle(side, checked)}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    <Separator name="CoG Offset" onClick={() => toggleSection("CoG Offset")} isCollapsed={collapsedSections.has("CoG Offset")} />
                    {!collapsedSections.has("CoG Offset") && <>
                        <NumberInputButton name="Lateral" value={robot.cogOffsetX} setValue={v => v !== null && mergeRobot({ cogOffsetX: v })} bounds={[-15, 15]} stepSize={0.5} roundTo={2} units="in" />
                        <NumberInputButton name="Forward" value={robot.cogOffsetY} setValue={v => v !== null && mergeRobot({ cogOffsetY: v })} bounds={[-15, 15]} stepSize={0.5} roundTo={2} units="in" />
                    </>}
                </div>

                {(format === "mikLib" || format === "Holonomic") && (
                    <div className="flex flex-col gap-2">
                        <Separator name="Robot Type" onClick={() => toggleSection("Robot Type")} isCollapsed={collapsedSections.has("Robot Type")} />
                        {!collapsedSections.has("Robot Type") && (
                            <CheckboxButton name="Holonomic" checked={format === "Holonomic"} setChecked={handleToggleHolonomic} />
                        )}
                    </div>
                )}
            </div>
        </ConfigButtonTemplate>
    );
}
