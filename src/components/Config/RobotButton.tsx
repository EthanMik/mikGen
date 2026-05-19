import { useRef, useState } from "react";
import CheckboxButton from "../Util/CheckboxButton";
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

export default function RobotButton() {
    const [format] = useFormat();
    const prevFormatRef = useRef<Format>(format);
    const robot = fileFormatStore.useSelector(s => s.robot);

    const allSections = ["Time Constant (Accel)", "Expansion", "CoG Offset", "Robot Type"] as const;
    type Section = typeof allSections[number];
    const [collapsedSections, setCollapsedSections] = useState<Set<Section>>(new Set(allSections));

    const toggleSection = (name: Section) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
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
                <NumberInputButton name="Width" value={robot.width} setValue={v => v !== null && mergeRobot({ width: v })} bounds={[0, 30]} stepSize={1} roundTo={1} units="in" />
                <NumberInputButton name="Height" value={robot.height} setValue={v => v !== null && mergeRobot({ height: v })} bounds={[0, 30]} stepSize={1} roundTo={1} units="in" />
                <NumberInputButton name="Speed" value={robot.speed} setValue={v => v !== null && mergeRobot({ speed: v })} bounds={[0, 100]} stepSize={0.5} roundTo={2} units="ft/s" />

                <div className="flex flex-col gap-2">
                    <Separator name="Time Constant (Accel)" onClick={() => toggleSection("Time Constant (Accel)")} isCollapsed={collapsedSections.has("Time Constant (Accel)")} />
                    {!collapsedSections.has("Time Constant (Accel)") && <>
                        <NumberInputButton name="Drive" value={robot.lateralTau} setValue={v => v !== null && mergeRobot({ lateralTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                        <NumberInputButton name="Turn" value={robot.angularTau} setValue={v => v !== null && mergeRobot({ angularTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                    </>}
                </div>

                <div className="flex flex-col gap-2">
                    <Separator name="Expansion" onClick={() => toggleSection("Expansion")} isCollapsed={collapsedSections.has("Expansion")} />
                    {!collapsedSections.has("Expansion") && (["Front", "Left", "Right", "Rear"] as const).map((side) => {
                        const key = `expansion${side}` as "expansionFront" | "expansionLeft" | "expansionRight" | "expansionRear";
                        return (
                            <NumberInputButton key={side} name={side} value={robot[key]} setValue={v => v !== null && mergeRobot({ [key]: v })} bounds={[0, 30]} stepSize={0.5} roundTo={2} units="in" />
                        );
                    })}
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
