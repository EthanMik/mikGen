import { useEffect, useRef, useState } from "react"
import arrow from "../../assets/down-arrow.svg"
import { type Command } from "../../core/Command";

type DropdownProps = {
    width: number,
    height: number,
    text: string,
    items: Command[]
    setCommand: (command: Command) => void;
}

export default function Dropdown({
    height,
    width,
    text,
    items,
    setCommand
}: DropdownProps) {
    const [ isOpen, setOpen ] = useState(false);
    const [ selectedId, setSelectedId ] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

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

    const handleToggleMenu = () => {
        setOpen((prev) => !prev);
    }

    const handleSelectedCommand = (id: string) => {
        setSelectedId(id);
        const command = items.find((c) => c.id === id);
        if (!command) return;
        setCommand(command);
    }
    
    return (
        <div ref={menuRef} className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`}>
            <button 
                onClick={handleToggleMenu}
                className="
                    bg-medlightgray
                    flex
                    justify-between
                    pl-2
                    pr-2
                    hover:bg-medgray_hover
                    items-center
                    rounded-sm 
                    cursor-pointer
                "
                style={{
                    width: `${width}px`,
                    height: `${height}px`
                }}>
                <span className="text-left">
                    {items.find((c) => c.id === selectedId) === undefined ? text : items.find((c) => c.id === selectedId)?.name}
                </span>
                <img 
                    className={`rotate-${isOpen ? 180 : 0} w-[10px] h-[10px]`}
                    style={{
                    width: `${height / 2.5}px`,
                    height: `${height / 2.5}px`                
                    }}
                
                    src={arrow}
                />

            </button>
            {isOpen && items.length > 0 && (
                <div 
                    className="absolute z-50 shadow-xs mt-1 shadow-black left-0 top-full
                    rounded-sm bg-medgray_hover min-h-2"
                    style={{width: `${width}px`}}
                >
                    
                    <div className="flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2">
                        <div className="flex flex-col max-h-40 overflow-y-auto">
                            {items.map((c) => (
                                <button 
                                    onClick={() => handleSelectedCommand(c.id)}
                                    className="flex hover:bg-blackgrayhover pl-2 rounded-sm cursor-pointer">
                                    <span className="text-[16px]">{c.name}</span>
                                </button>
                            ))}
                        </div>
        
                    </div>
                </div>
            )}

        </div>
    )
}