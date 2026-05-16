import { useEffect, useRef, useState } from "react";
import { fileFormatStore, usePath } from "../../hooks/useFileFormat";
import Separator from "../Util/Separator";
import FieldMacros from "../../macros/FieldMacros";
import EditJSONPopup from "../PathMenu/EditJSONPopup";

type EditProps = {
    callback: () => void;
    name: string,
    keybind: string,
}

function Edit({
    callback,
    name,
    keybind
}: EditProps) {
    return (
        <button
            onClick={callback}
            className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
            <span className="text-[16px]">{name}</span>
            <span className="text-lightgray text-[14px]">{keybind}</span>
        </button>
    );
}

export default function EditButton() {
    const [isOpen, setOpen] = useState(false);

    const [flash, setFlash] = useState(false);
    const fileFormat = fileFormatStore.useStore();
    const flashTimeoutRef = useRef<number | null>(null);
    const pathRef = useRef(fileFormat.path);
    const [, setPath] = usePath();
    const [ popup, setPopup ] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const handleToggleMenu = () => setOpen((prev) => !prev);

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
            copy(evt, pathRef.current, triggerFlash, true);
            copy(evt, pathRef.current, triggerFlash);
            cut(evt, pathRef.current, setPath);
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, []);

    const triggerFlash = () => {
        setFlash(true);
        if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = window.setTimeout(() => setFlash(false), 400);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <div
            ref={menuRef}
            className={`relative ${isOpen ? "bg-medgray_hover" : `${flash ? "bg-medlightgray ease-out duration-100" : "bg-none"}`
                } hover:bg-medgray_hover rounded-sm`}
        >
            <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
                <span className="text-[20px]">Edit</span>
            </button>

            {popup && <EditJSONPopup
                label={""}
                open={popup}
                setOpen={setPopup}
                onEnter={() => { }}
            />}

            {isOpen && (
                <div className={`absolute shadow-xs mt-1 shadow-black left-0 top-full w-62 z-40
                    rounded-sm bg-medgray_hover min-h-2`}>
                    <div className="flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2">
                        <div className="flex flex-col">

                            <Edit name={"Undo"} keybind={"Ctrl+Z"} callback={() => { undo(null); setOpen(false); }} />
                            <Edit name={"Redo"} keybind={"Ctrl+Y"} callback={() => { redo(null); setOpen(false); }} />
                            <Separator name="" />

                            <Edit name={"Cut"} keybind={"Ctrl+X"} callback={() => { cut(null, pathRef.current, setPath); setOpen(false); }} />
                            <Edit name={"Copy"} keybind={"Ctrl+C"} callback={() => { copy(null, pathRef.current, triggerFlash); setOpen(false); }} />
                            <Edit name={"Copy All"} keybind={"Ctrl+Shift+C"} callback={() => { copy(null, pathRef.current, triggerFlash, true); setOpen(false); }} />
                            <Edit name={"Paste"} keybind={"Ctrl+V"} callback={() => { paste(null, setPath); setOpen(false); }} />
                            <Edit name={"Delete"} keybind={"Backspace"} callback={() => { deleteControl(null, setPath); setOpen(false); }} />
                            <Separator name="" />

                            <Edit name={"Select All"} keybind={"Ctrl+A"} callback={() => { selectPath(null, setPath); setOpen(false); }} />
                            <Edit name={"Select None"} keybind={"Esc"} callback={() => { unselectPath(null, setPath); setOpen(false); }} />
                            <Edit name={"Select Inverse"} keybind={"Ctrl+shift+A"} callback={() => { selectInversePath(null, setPath); setOpen(false); }} />
                            <Separator name="" />

                            <Edit name={"Edit Templates"} keybind={""} callback={() => { setPopup(true); setOpen(false); }} />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
