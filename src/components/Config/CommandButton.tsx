import { useEffect, useRef, useState } from "react";
import enter from "../../assets/enter.svg";
import cross from "../../assets/cross.svg"
import { useCommand } from "../../hooks/useCommands";
import { Command, createCommand } from "../../core/Command";

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
    const [ commands, setCommand ] = useCommand();

    const display: string = edit !== null ? edit : value

    const resetValue = () => {
        setEdit("");
    }

    const executeInput = () => {
        if (edit === null || edit === "") return;
        const finalEdit = edit.replace(/ /g, "_")
        SetValue(finalEdit);

        setCommand((prev) => [...prev, createCommand(finalEdit)])
        cancel();
    }

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEdit(evt.target.value)
    }

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {        
        if (evt.key === "Enter" || evt.key == "Tab") {
            executeInput()
        }
    }
    
    const handleOnClick = () => {
        executeInput();
    }

    const cancel = () => {
        resetValue();
    }

    return (
        <div className="flex flex-row gap-3">
            <input 
                className={`bg-blackgray
                outline-2 outline-transparent rounded-lg text-center text-white
                hover:outline-lightgray
                `}
                
                maxLength={20}

                style={{
                    fontSize: '16px', 
                    width: width, 
                    height : height,
                }}
                type="text"
                value={ display }
    
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <button className="hover:bg-blackgrayhover rounded-sm cursor-pointer"
                onClick={handleOnClick}>
                <img src={enter}/>
            </button>
        </div>
    );
}

type RemoveCommandButtonProps = {
    commandId: string
}

function RemoveCommandButton({commandId}: RemoveCommandButtonProps) {
    const [ commands, setCommand ] = useCommand();

    const handleDeleteOnClick = () => {
        setCommand((prev) => prev.filter((c) => c.id !== commandId))
    }

    return (
        <div className="w-[25px] h-[25px]">
            <button 
                onClick={handleDeleteOnClick}
                className="cursor-pointer rounded-sm hover:bg-blackgrayhover"
            >
                <img src={cross}
                />
            </button>

        </div>

    );
}

export default function CommandButton() {
    const [ isOpen, setOpen ] = useState(false);
    const [ commands, setCommand ] = useCommand();
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
            <button onClick={handleToggleMenu} className="px-3 py-1 cursor-pointer">
                <span className="text-[20px]">
                    Commands
                </span>
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-60 
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-2 pl-2 mb-2 gap-2">
                        <div className="flex flex-col max-h-40 overflow-y-auto">
                            {commands.map((c) => (
                                <div className="flex flex-row items-center justify-between pr-3">
                                    <span className="text-[16px]">{c.name}</span>
                                    <RemoveCommandButton commandId={c.id}/>
                                </div>
                            ))}
                        </div>
        
                        <CommmandInput width={175} height={30}/>
                    </div>
                </div>
            )}
        </div>
    )
}