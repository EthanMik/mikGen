import { useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import ConfigButtonTemplate from "../Config/ConfigButtonTemplate";
import CheckboxButton from "../Util/CheckboxButton";
import { ConfigKeybindButton } from "../Util/KeybindButton";
import EditJSONPopup from "../PathMenu/EditJSONPopup";

export default function SettingsButton() {
    const [settings, setSettings] = useSettings();
    const [popup, setPopup] = useState(false);
    
    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);



    const set = (key: keyof typeof settings) => (state: boolean) =>
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
                <CheckboxButton name="Robot Outlines" checked={settings.ghostRobots} setChecked={set("ghostRobots")} />
                <CheckboxButton name="Robot Position" checked={settings.robotPosition} setChecked={set("robotPosition")} />
                <CheckboxButton name="Precise Path" checked={settings.precisePath} setChecked={set("precisePath")} />
                <CheckboxButton name="Numbered Path" checked={settings.numberedPath} setChecked={set("numberedPath")} />
                <ConfigKeybindButton name="Edit Templates" keybind={""} callback={() => setPopup(true)} />
            </ConfigButtonTemplate>
        </>
    );
}
