import { useEffect, useRef, useState } from "react";
import { useSegment } from "../hooks/useSegment";
import enter from "../assets/enter.svg";

type CommandInputProps = {
    width: number,
    height: number,
}

function CommmandInput({
    width,
    height
}: CommandInputProps) {
    const [ value, SetValue ] = useState<string>('');
    const [ edit, setEdit ] = useState<string | null>(null);
    const { command, useCommand } = useCommands();

    const display: string = edit !== null ? edit : value

    const resetValue = () => {
        setEdit("");
    }


    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEdit(evt.target.value)
    }

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (edit === null) return;
        
        if (evt.key === "Enter" || evt.key == "Tab") {
            SetValue(edit);
            cancel();
        }
    }

    const cancel = () => {
        resetValue();
    }

    const handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        evt.currentTarget.blur();
    }

    return (
        <input 
            className={`bg-blackgray
            outline-2 outline-transparent rounded-lg text-center text-white
            hover:outline-lightgray
            `}
            
            style={{fontSize: '14px', width: width, height : height}}
            type="text"
            value={ display }

            onChange={handleChange}
            onKeyDown={handleKeyDown}
        />
    );
}

function Commands() {
    const [ isOpen, setOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, []);

    return (
        <div ref={menuRef} className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`}>
            <button onClick={handleToggleMenu} className="px-3 py-1">
                <span className="text-[20px]">
                    Commands
                </span>
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-60 h-auto rounded-sm bg-medgray_hover">
                    <div className="flex flex-col mt-2 pl-2 mb-2 gap-3">
                        <span className="text-[16px]">Command 1</span>
                        <div className="flex flex-row gap-3">
                            <CommmandInput width={175} height={30}/>
                            <img src={enter}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default function Config() {
    return (
        <div className="bg-medgray w-[575px] h-[65px] rounded-lg flex items-center gap-6 pl-6">
            <span className="text-[20px]">
                File
            </span>
            <span className="text-[20px]">
                Field
            </span>
            <span className="text-[20px]">
                Robot
            </span>
            <Commands/>
            <span className="text-[20px]">
                Settings
            </span>
        </div>
    );
}