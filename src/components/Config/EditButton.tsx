import { useEffect } from "react";
import { fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import Section from "../Util/Section";
import FieldMacros from "../../macros/FieldMacros";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import { MenuKeybindButton } from "../Util/KeybindButton";

export default function EditButton() {
    // The path is only needed when a menu action fires, so read it at call time instead of
    // subscribing this always-mounted menu to every store write
    const getPath = () => fileFormatStore.getState().path;
    const setPath = updatePath;

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

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            const target = evt.target as HTMLElement | null;
            if (target?.isContentEditable || target?.tagName === "INPUT") return;
            copy(evt, fileFormatStore.getState().path, true);
            copy(evt, fileFormatStore.getState().path);
            cut(evt, fileFormatStore.getState().path, setPath);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <MenuButtonTemplate title="Edit" width={44}>
                <MenuKeybindButton name={"Undo"} keybind={"Ctrl+Z"} callback={() => undo(null)} />
                <MenuKeybindButton name={"Redo"} keybind={"Ctrl+Y"} callback={() => redo(null)} />
                <Section />

                <MenuKeybindButton name={"Cut"} keybind={"Ctrl+X"} callback={() => cut(null, getPath(), setPath)} />
                <MenuKeybindButton name={"Copy"} keybind={"Ctrl+C"} callback={() => copy(null, getPath())} />
                <MenuKeybindButton name={"Copy All"} keybind={"Ctrl+⇧C"} callback={() => copy(null, getPath(), true)} />
                <MenuKeybindButton name={"Paste"} keybind={"Ctrl+V"} callback={() => paste(null, setPath)} />
                <MenuKeybindButton name={"Delete"} keybind={"⌫"} callback={() => deleteControl(null, setPath)} />
                <Section />

                <MenuKeybindButton name={"Select All"} keybind={"Ctrl+A"} callback={() => selectPath(null, setPath)} />
                <MenuKeybindButton name={"Select None"} keybind={"Esc"} callback={() => unselectPath(null, setPath)} />
                <MenuKeybindButton name={"Select Inverse"} keybind={"Ctrl+⇧A"} callback={() => selectInversePath(null, setPath)} />
            </MenuButtonTemplate>
        </>
    );
}
