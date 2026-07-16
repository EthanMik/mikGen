import { useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import EditJSONPopup from "../PathMenu/EditJSONPopup";
import { MenuKeybindButton } from "../Util/KeybindButton";
import Section from "../Util/Section";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuCheckboxButton } from "../Util/CheckboxButton";
import { NumberInputButton } from "../Util/NumberInputButton";
// import { debugStore } from "../../simulation/Conversion";

export default function SettingsButton() {
    const [settings, setSettings] = useSettings();
    const [popup, setPopup] = useState(false);
    // const debug = debugStore.useStore();

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);

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

                    <Section />
                    <NumberInputButton name="Grid Snap" label="What to snap to while Ctrl+Dragging" value={settings.snapToGrid} setValue={v => v !== null && set("snapToGrid")(v)} bounds={[0.1, 10]} stepSize={0.5} roundTo={1} units="in" />
                    <Section />
                    <MenuKeybindButton name="Edit Templates" keybind={""} callback={() => setPopup(true)} />
                </div>
            </MenuButtonTemplate>
        </>
    );
}
