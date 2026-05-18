import { useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import ConfigButtonTemplate from "../Config/ConfigButtonTemplate";
import CheckboxButton from "../Util/CheckboxButton";

export default function SettingsButton() {
    const [settings, setSettings] = useSettings();

    useEffect(() => {
        localStorage.setItem("ghostRobots", settings.ghostRobots ? "true" : "false");
        localStorage.setItem("robotPosition", settings.robotPosition ? "true" : "false");
        localStorage.setItem("precisePath", settings.precisePath ? "true" : "false");
        localStorage.setItem("numberedPath", settings.numberedPath ? "true" : "false");
    }, [settings.ghostRobots, settings.robotPosition, settings.precisePath, settings.numberedPath]);

    const set = (key: keyof typeof settings) => (state: boolean) =>
        setSettings(prev => ({ ...prev, [key]: state }));

    return (
        <ConfigButtonTemplate title="Settings">
            <CheckboxButton name="Robot Outlines" checked={settings.ghostRobots} setChecked={set("ghostRobots")} />
            <CheckboxButton name="Robot Position" checked={settings.robotPosition} setChecked={set("robotPosition")} />
            <CheckboxButton name="Precise Path" checked={settings.precisePath} setChecked={set("precisePath")} />
            <CheckboxButton name="Numbered Path" checked={settings.numberedPath} setChecked={set("numberedPath")} />
        </ConfigButtonTemplate>
    );
}
