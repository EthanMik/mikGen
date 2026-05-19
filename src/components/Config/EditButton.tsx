import { useEffect, useRef } from "react";
import { fileFormatStore, usePath } from "../../hooks/useFileFormat";
import Separator from "../Util/Separator";
import FieldMacros from "../../macros/FieldMacros";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuKeybindButton } from "../Util/KeybindButton";

export default function EditButton() {
    const flashRef = useRef<(() => void) | undefined>(undefined);
    const fileFormat = fileFormatStore.useStore();
    const pathRef = useRef(fileFormat.path);
    const [, setPath] = usePath();

    const {
        copy,
        cut,
        deleteControl,
        selectPath,
        unselectPath,
        selectInversePath,
        undo,
        redo,
        paste,
    } = FieldMacros();

    const triggerFlash = () => flashRef.current?.();

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            const target = evt.target as HTMLElement | null;
            if (target?.isContentEditable || target?.tagName === "INPUT") return;
            copy(evt, pathRef.current, triggerFlash, true);
            copy(evt, pathRef.current, triggerFlash);
            cut(evt, pathRef.current, setPath);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <MenuButtonTemplate title="Edit" flashRef={flashRef}>
                <MenuKeybindButton name={"Undo"} keybind={"Ctrl+Z"} callback={() => undo(null)} />
                <MenuKeybindButton name={"Redo"} keybind={"Ctrl+Y"} callback={() => redo(null)} />
                <Separator name="" />

                <MenuKeybindButton name={"Cut"} keybind={"Ctrl+X"} callback={() => cut(null, pathRef.current, setPath)} />
                <MenuKeybindButton name={"Copy"} keybind={"Ctrl+C"} callback={() => copy(null, pathRef.current, triggerFlash)} />
                <MenuKeybindButton name={"Copy All"} keybind={"Ctrl+⇧C"} callback={() => copy(null, pathRef.current, triggerFlash, true)} />
                <MenuKeybindButton name={"Paste"} keybind={"Ctrl+V"} callback={() => paste(null, setPath)} />
                <MenuKeybindButton name={"Delete"} keybind={"⌫"} callback={() => deleteControl(null, setPath)} />
                <Separator name="" />

                <MenuKeybindButton name={"Select All"} keybind={"Ctrl+A"} callback={() => selectPath(null, setPath)} />
                <MenuKeybindButton name={"Select None"} keybind={"Esc"} callback={() => unselectPath(null, setPath)} />
                <MenuKeybindButton name={"Select Inverse"} keybind={"Ctrl+⇧A"} callback={() => selectInversePath(null, setPath)} />
            </MenuButtonTemplate>
        </>
    );
}
