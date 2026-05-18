import { useEffect, useRef, useState } from "react";
import { fileFormatStore, usePath } from "../../hooks/useFileFormat";
import Separator from "../Util/Separator";
import FieldMacros from "../../macros/FieldMacros";
import EditJSONPopup from "../PathMenu/EditJSONPopup";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import KeybindButton from "../Util/KeybindButton";

export default function EditButton() {
    const flashRef = useRef<(() => void) | undefined>(undefined);
    const fileFormat = fileFormatStore.useStore();
    const pathRef = useRef(fileFormat.path);
    const [, setPath] = usePath();
    const [popup, setPopup] = useState(false);

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
            {popup && <EditJSONPopup
                label={""}
                open={popup}
                setOpen={setPopup}
                onEnter={() => { }}
            />}
            <ConfigButtonTemplate title="Edit" flashRef={flashRef}>
                <KeybindButton name={"Undo"} keybind={"Ctrl+Z"} callback={() => undo(null)} />
                <KeybindButton name={"Redo"} keybind={"Ctrl+Y"} callback={() => redo(null)} />
                <Separator name="" />

                <KeybindButton name={"Cut"} keybind={"Ctrl+X"} callback={() => cut(null, pathRef.current, setPath)} />
                <KeybindButton name={"Copy"} keybind={"Ctrl+C"} callback={() => copy(null, pathRef.current, triggerFlash)} />
                <KeybindButton name={"Copy All"} keybind={"Ctrl+⇧C"} callback={() => copy(null, pathRef.current, triggerFlash, true)} />
                <KeybindButton name={"Paste"} keybind={"Ctrl+V"} callback={() => paste(null, setPath)} />
                <KeybindButton name={"Delete"} keybind={"⌫"} callback={() => deleteControl(null, setPath)} />
                <Separator name="" />

                <KeybindButton name={"Select All"} keybind={"Ctrl+A"} callback={() => selectPath(null, setPath)} />
                <KeybindButton name={"Select None"} keybind={"Esc"} callback={() => unselectPath(null, setPath)} />
                <KeybindButton name={"Select Inverse"} keybind={"Ctrl+⇧A"} callback={() => selectInversePath(null, setPath)} />
                <Separator name="" />

                <KeybindButton name={"Edit Templates"} keybind={""} callback={() => setPopup(true)} />
            </ConfigButtonTemplate>
        </>
    );
}
