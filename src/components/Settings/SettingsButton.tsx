import { useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import ConfigButtonTemplate from "../Config/ConfigButtonTemplate";
import CheckboxButton from "../Util/CheckboxButton";
import EditJSONPopup from "../PathMenu/EditJSONPopup";
import { NumberInputButton } from "../Config/RobotButton";
import { DEFAULT_THEMES } from "../Field/FieldUtils";
import { ConfigKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";

type ColorButtonProps = {
    callback: () => void;
    name: string,
    primary: string,
    secondary: string,
    textSize?: number,
}

function ColorButton({ callback, name, primary, secondary, textSize }: ColorButtonProps) {
    return (
        <button className="flex pr-1 pl-2 py-0.5 items-center justify-between bg-medgray hover:brightness-92 cursor-pointer rounded-sm"
            onClick={callback}
        >
            <span className={`text-[${textSize || 14}px]`}>{name}</span>
            <div className="flex flex-row gap-1">
                <div 
                    style={{ backgroundColor: primary }} 
                    className="w-4 h-4 rounded-sm"
                >                
                </div>
                <div 
                    style={{ backgroundColor: secondary }} 
                    className="w-4 h-4 rounded-sm"
                >
                </div>
            </div>
        </button>
    );
}



export default function SettingsButton() {
    const [settings, setSettings] = useSettings();
    const [popup, setPopup] = useState(false);

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);

    const updateTheme = (idx: number) => {
        const newIdx = settings.themeIdx === idx ? (idx + 1) % DEFAULT_THEMES.length : idx;
        setSettings(prev => ({ ...prev, themeIdx: newIdx }));
    }

    const set = (key: keyof typeof settings) => (state: boolean | number) =>
        setSettings(prev => ({ ...prev, [key]: state }));

    return (
        <>
            {popup && <EditJSONPopup
                label={""}
                open={popup}
                setOpen={setPopup}
                onEnter={() => { }}
            />}

            <ConfigButtonTemplate title="Settings">
                <div className="flex flex-col gap-1.5">
                    <Section name="Display">
                        <CheckboxButton name="Robot Outlines" checked={settings.ghostRobots} setChecked={set("ghostRobots")} />
                        <CheckboxButton name="Robot Position" checked={settings.robotPosition} setChecked={set("robotPosition")} />
                        <CheckboxButton name="Precise Path" checked={settings.precisePath} setChecked={set("precisePath")} />
                        <CheckboxButton name="Numbered Path" checked={settings.numberedPath} setChecked={set("numberedPath")} />
                    </Section>

                    <Section name="Field">
                        <NumberInputButton name="Grid Snap" value={settings.snapToGrid} setValue={v => v !== null && set("snapToGrid")(v)} bounds={[0, 10]} stepSize={0.5} roundTo={1} units="" />
                        <ColorButton name="Theme" primary={DEFAULT_THEMES[settings.themeIdx].primary} secondary={DEFAULT_THEMES[settings.themeIdx].secondary} callback={() => updateTheme(settings.themeIdx)} />
                    </Section>

                    <ConfigKeybindButton name="Edit Templates" keybind={""} callback={() => setPopup(true)} />
                </div>
            </ConfigButtonTemplate>
        </>
    );
}
