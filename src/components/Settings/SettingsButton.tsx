import { useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import EditJSONPopup from "../PathMenu/EditJSONPopup";
import { DEFAULT_THEMES } from "../Field/FieldUtils";
import { MenuKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuCheckboxButton } from "../Util/CheckboxButton";
import { NumberInputButton } from "../Util/NumberInputButton";
// import { debugStore } from "../../simulation/Conversion";

type ColorButtonProps = {
    callback: () => void;
    name: string,
    primary: string,
    secondary: string,
    textSize?: number,
}

function ColorButton({ callback, name, primary, secondary, textSize }: ColorButtonProps) {
    return (
        <button className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm"
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
    // const debug = debugStore.useStore();

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

            <MenuButtonTemplate title="Settings" closeOnClick={false} width={40}>
                <div className="flex flex-col gap-1.5">
                    {/* <MenuCheckboxButton name="Position Logs" label="Prints robot position to console" checked={debug} setChecked={(state: boolean) => { debugStore.setState(state); }} /> */}

                    <MenuCheckboxButton name="Robot Position" label="Displays robots's actual position" checked={settings.robotPosition} setChecked={set("robotPosition")} />
                    <MenuCheckboxButton name="Precise Path" label="Displays robots exact path taken" checked={settings.precisePath} setChecked={set("precisePath")} />
                    <MenuCheckboxButton name="Numbered Path" label="Displays number labels for notebook screenshots" checked={settings.numberedPath} setChecked={set("numberedPath")} />
                    <MenuCheckboxButton name="Robot Outlines" label="Displays end positions when sim is off" checked={settings.ghostRobots} setChecked={set("ghostRobots")} />
                    <ColorButton name="Theme" primary={DEFAULT_THEMES[settings.themeIdx].primary} secondary={DEFAULT_THEMES[settings.themeIdx].secondary} callback={() => updateTheme(settings.themeIdx)} />

                    <Section />
                    <NumberInputButton name="Grid Snap" label="What to snap to while Ctrl+Dragging" value={settings.snapToGrid} setValue={v => v !== null && set("snapToGrid")(v)} bounds={[0.1, 10]} stepSize={0.5} roundTo={1} units="in" />
                    <Section />
                    <MenuKeybindButton name="Edit Templates" keybind={""} callback={() => setPopup(true)} />
                </div>
            </MenuButtonTemplate>
        </>
    );
}
