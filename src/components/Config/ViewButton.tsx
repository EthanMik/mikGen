import { MenuKeybindButton } from "../Util/KeybindButton";
import FieldMacros from "../../macros/FieldMacros";
import { useFieldImg } from "../../hooks/useFieldImg";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";

export default function ViewButton() {
    const [ , setImg ] = useFieldImg();

    const {
        fieldZoomKeyboard,
    } = FieldMacros();
 
    return (
        <MenuButtonTemplate title="View">
            <MenuKeybindButton name={"Zoom In"} keybind="Ctrl+=" callback={() => fieldZoomKeyboard(null, setImg, "ZoomIn")} />
            <MenuKeybindButton name={"Zoom Out"} keybind="Ctrl+-" callback={() => fieldZoomKeyboard(null, setImg, "ZoomOut")} />
            <MenuKeybindButton name={"Reset Zoom"} keybind="Ctrl+0" callback={() => fieldZoomKeyboard(null, setImg, "ZoomReset")} />

        </MenuButtonTemplate>
    );
}
