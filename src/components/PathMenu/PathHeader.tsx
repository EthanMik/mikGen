import { useRef, useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import clockClose from "../../assets/clock-close.svg";
import clockOpen from "../../assets/clock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import { fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import Tooltip from "../Util/Tooltip";

type PathConfigHeaderProps = {
    isOpen: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isTelemetryOpen: boolean,
    onTelemetryToggle: () => void,
}

export default function PathConfigHeader({ isOpen, setOpen, isTelemetryOpen, onTelemetryToggle }: PathConfigHeaderProps) {
    // An unnamed path falls back to the loaded format's name, which a saved file can have edited
    const name = fileFormatStore.useSelector(s => s.path.name || s.formatDef.formatPathName);
    // The shared flag reads as "path hidden": the field layer draws nothing while it is set
    const [pathHidden, setPathHidden] = usePathVisibility();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const startEditing = () => {
        setDraft(name);
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const commit = () => {
        setEditing(false);
        if (draft.trim()) updatePath(prev => ({ ...prev, name: draft.trim() }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
    };

    return (
        <div className="w-full flex flex-row items-center justify-between min-w-0">
            {editing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    className="text-[20px] bg-blackgray outline-none rounded-lg px-2 w-40 min-w-0"
                    autoFocus
                />
            ) : (
                <span className="block text-[20px] cursor-text truncate min-w-0" onClick={startEditing}>
                    {name}
                </span>
            )}
            <div className="flex flex-row gap-[10px] items-center shrink-0">

                <Tooltip label="Hide Path" placement="bottom" >
                    <button className="cursor-pointer"
                        onClick={() => setPathHidden(!pathHidden)}>
                        <img className="w-[20px] h-[22px]"
                            src={pathHidden ? eyeClosed : eyeOpen}
                        />
                    </button>
                </Tooltip>

                <Tooltip label="Toggle Telemetry" placement="bottom">
                    <button className="cursor-pointer" onClick={onTelemetryToggle}>
                        <img className="w-[20px] h-[22px]" src={isTelemetryOpen ? clockClose : clockOpen} />
                    </button>
                </Tooltip>

                <Tooltip label="Collapse Path" placement="bottom">
                    <button onClick={() => setOpen(prev => !prev)}
                        className="cursor-pointer px-1 py-1 rounded-sm">
                        <img className={`w-[15px] h-[15px] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} src={downArrow} />
                    </button>
                </Tooltip>

            </div>
        </div>
    );
}
