import { useRef, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import clockClose from "../../assets/clock-close.svg";
import clockOpen from "../../assets/clock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import Tooltip from "../Util/Tooltip";

type PathConfigHeaderProps = {
    name: string
    isOpen: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isTelemetryOpen: boolean,
    onTelemetryToggle: () => void,
    onRename: (name: string) => void,
}

export default function PathConfigHeader({ name, isOpen, setOpen, isTelemetryOpen, onTelemetryToggle, onRename }: PathConfigHeaderProps) {
    const [isEyeOpen, setEyeOpen] = useState(false);
    const [, setPathVisibility] = usePathVisibility();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOpenOnClick = () => {
        setOpen(prev => !prev);
    }

    const handleEyeOnClick = () => {
        setEyeOpen((eye) => {
            setPathVisibility(!eye);
            return !eye
        });
    }

    const startEditing = () => {
        setDraft(name);
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const commit = () => {
        setEditing(false);
        if (draft.trim()) onRename(draft.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
    };

    return (
        <div className="w-full flex flex-row items-center justify-between truncate min-w-4">
            {editing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    className="text-[20px] bg-blackgray outline-none rounded-lg px-2 w-40"
                    autoFocus
                />
            ) : (
                <span className="block text-[20px] cursor-text" onClick={startEditing}>
                    {name}
                </span>
            )}
            <div className="flex flex-row gap-[10px] items-center">

                <Tooltip label="Hide Path" placement="bottom" >
                    <button className="cursor-pointer"
                        onClick={handleEyeOnClick}>
                        <img className="w-[20px] h-[22px]"
                            src={isEyeOpen ? eyeClosed : eyeOpen}
                        />
                    </button>
                </Tooltip>

                <Tooltip label="Toggle Telemetry" placement="bottom">
                    <button className="cursor-pointer" onClick={onTelemetryToggle}>
                        <img className="w-[20px] h-[22px]" src={isTelemetryOpen ? clockClose : clockOpen} />
                    </button>
                </Tooltip>

                <Tooltip label="Collapse Path" placement="bottom">
                    <button onClick={handleOpenOnClick}
                        className="cursor-pointer px-1 py-1 rounded-sm">
                        <img className={`w-[15px] h-[15px] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} src={downArrow} />
                    </button>
                </Tooltip>

            </div>
        </div>
    );
}