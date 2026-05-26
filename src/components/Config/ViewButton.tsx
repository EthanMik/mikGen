import { MenuKeybindButton } from "../Util/KeybindButton";
import FieldMacros from "../../macros/FieldMacros";
import { useFieldImg } from "../../hooks/useFieldImg";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuCheckButton } from "../Util/CheckButton";
import Section from "../Util/Section";
import { useViewMode } from "../../hooks/useViewMode";

export default function ViewButton() {
    const [ , setImg ] = useFieldImg();
    const [viewMode, setViewMode] = useViewMode();

    const {
        fieldZoomKeyboard,
    } = FieldMacros();

    return (
        <MenuButtonTemplate title="View">
            <MenuCheckButton name="Auto Adjust" checked={viewMode === "automatic"} setChecked={() => setViewMode("automatic")}/>
            <MenuCheckButton name="Standard View" checked={viewMode === "standard"} setChecked={() => setViewMode("standard")}/>
            <MenuCheckButton name="Collapsed Config" checked={viewMode === "collapsed-config"} setChecked={() => setViewMode("collapsed-config")}/>
            <MenuCheckButton name="Collapsed List" checked={viewMode === "collapsed-list"} setChecked={() => setViewMode("collapsed-list")}/>
            <MenuCheckButton name="Fully Collapsed" checked={viewMode === "fully-collapsed"} setChecked={() => setViewMode("fully-collapsed")}/>
            <Section />
            <MenuKeybindButton name={"Zoom In"} keybind="Ctrl+=" callback={() => fieldZoomKeyboard(null, setImg, "ZoomIn")} />
            <MenuKeybindButton name={"Zoom Out"} keybind="Ctrl+-" callback={() => fieldZoomKeyboard(null, setImg, "ZoomOut")} />
            <MenuKeybindButton name={"Reset Zoom"} keybind="Ctrl+0" callback={() => fieldZoomKeyboard(null, setImg, "ZoomReset")} />
        </MenuButtonTemplate>
    );
}
