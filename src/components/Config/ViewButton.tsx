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
        <MenuButtonTemplate title="View" width={40}>
            <MenuCheckButton name="Auto Collapse" checked={viewMode === "automatic"} setChecked={() => setViewMode("automatic")}/>
            <MenuCheckButton name="No Collapse" checked={viewMode === "standard"} setChecked={() => setViewMode("standard")}/>
            <MenuCheckButton name="Collapse Left" checked={viewMode === "collapsed-config"} setChecked={() => setViewMode("collapsed-config")}/>
            <MenuCheckButton name="Collapse Right" checked={viewMode === "collapsed-list"} setChecked={() => setViewMode("collapsed-list")}/>
            <MenuCheckButton name="Collapse All" checked={viewMode === "fully-collapsed"} setChecked={() => setViewMode("fully-collapsed")}/>
            <Section />
            <MenuKeybindButton name={"Zoom In"} keybind="Ctrl+=" callback={() => fieldZoomKeyboard(null, setImg, "ZoomIn")} />
            <MenuKeybindButton name={"Zoom Out"} keybind="Ctrl+-" callback={() => fieldZoomKeyboard(null, setImg, "ZoomOut")} />
            <MenuKeybindButton name={"Reset Zoom"} keybind="Ctrl+0" callback={() => fieldZoomKeyboard(null, setImg, "ZoomReset")} />
        </MenuButtonTemplate>
    );
}
