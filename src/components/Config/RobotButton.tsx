import { useRef } from "react";
import { useFormat, mergeRobot, fileFormatStore, type Format } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { changeFormat } from "../../simulation/FormatDefinition";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckboxButton } from "../Util/CheckboxButton";
import { DualNumberInputCheckboxButton, NumberInputButton, NumberInputCheckboxButton } from "../Util/NumberInputButton";
import { SENSOR_COLORS } from "../Field/FieldColors";

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

    const handleSensorChange = (side: ExpansionSide, axis: "X" | "Y", v: number | null) => {
        if (v === null) return;
        mergeRobot({ [`sensor${side}${axis}`]: v });
    };

    const handleSensorToggle = (side: ExpansionSide, checked: boolean) => {
        mergeRobot({ [`sensor${side}Disabled`]: !checked });
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
                    {(format === "mikLib" || format === "Holonomic") && (
                        <ConfigCheckboxButton name="Holonomic" checked={format === "Holonomic"} label="Toggle format to mikLib Holonomic" setChecked={handleToggleHolonomic} />
                    )}
                </Section>
                <Section name="Motion" defaultCollapsed>
                    <NumberInputButton name="Speed" label="Max velocity; measure on actual robot" value={robot.speed} setValue={v => v !== null && mergeRobot({ speed: v })} bounds={[0, 100]} stepSize={0.5} roundTo={2} units="ft/s" />
                    <NumberInputButton name="Track Width" label="Distance measured from wheel to wheel" value={robot.trackwidth} setValue={v => v !== null && mergeRobot({ trackwidth: v })} bounds={[0, 30]} stepSize={0.5} roundTo={1} units="in" />
                    <NumberInputButton name="Drive Constant" label="Time for robot to reach 63.2% of its max velocity laterally" value={robot.lateralTau} setValue={v => v !== null && mergeRobot({ lateralTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
                    <NumberInputButton name="Turn Constant" label="Time for robot to reach 63.2% of max velocity turning" value={robot.angularTau} setValue={v => v !== null && mergeRobot({ angularTau: v })} bounds={[0, 2]} stepSize={0.05} roundTo={2} units="s" />
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

                <Section name="Distance Sensors" defaultCollapsed>
                    {(["Front", "Left", "Right", "Rear"] as const).map((side) => (
                        <DualNumberInputCheckboxButton
                            key={side}
                            name={side}
                            color={SENSOR_COLORS[side.toLowerCase() as Lowercase<typeof side>]}
                            numberInputs={[{
                                value: robot[`sensor${side}X`],
                                setValue: (v: number | null) => handleSensorChange(side, "X", v),
                                bounds: [-robot.width / 2, robot.width / 2],
                                stepSize: 0.5,
                                roundTo: 2,
                                units: "in",
                                label: "X offset from tracking center",
                                labelSpeed: "fast"
                            },
                            {
                                value: robot[`sensor${side}Y`],
                                setValue: (v: number | null) => handleSensorChange(side, "Y", v),
                                bounds: [-robot.height / 2, robot.height / 2],
                                stepSize: 0.5,
                                roundTo: 2,
                                units: "in",
                                label: "Y offset from tracking center",
                                labelSpeed: "fast"
                            }]}

                            checked={!robot[`sensor${side}Disabled`]}
                            setChecked={checked => handleSensorToggle(side, checked)}
                        />
                    ))}
                </Section>

                <Section name="CoG Offset" defaultCollapsed>
                    <NumberInputCheckboxButton name="Lateral" value={robot.cogOffsetX} setValue={v => v !== null && mergeRobot({ cogOffsetX: v })} bounds={[-15, 15]} stepSize={0.5} roundTo={2} units="in" checked={!robot.cogOffsetXDisabled} setChecked={checked => { mergeRobot({ cogOffsetXDisabled: !checked }); saveSnapshot(); }} />
                    <NumberInputCheckboxButton name="Forward" value={robot.cogOffsetY} setValue={v => v !== null && mergeRobot({ cogOffsetY: v })} bounds={[-15, 15]} stepSize={0.5} roundTo={2} units="in" checked={!robot.cogOffsetYDisabled} setChecked={checked => { mergeRobot({ cogOffsetYDisabled: !checked }); saveSnapshot(); }} />
                </Section>
            </div>
        </ConfigButtonTemplate>
    );
}
