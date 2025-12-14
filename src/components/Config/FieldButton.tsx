import { useEffect, useRef, useState } from "react";
import { useField } from "../../hooks/useField";

import pushbackVEXUMatchField from "../../assets/pushback-match.png";
import pushbackSkillsField from "../../assets/pushback-skills.png";
import emptyField from "../../assets/empty-field.png";

type Field = {
    src: string,
    name: string
}

const fields: Field[] = [
    { src: pushbackVEXUMatchField, name: "Push-Back VURC Match Field"},
    { src: pushbackSkillsField, name: "Push-Back V5 Skills Field"},
    { src: emptyField, name: "Empty V5 Match Field"}
]

export default function FieldButton() {
    const [ isOpen, setOpen ] = useState(false);
    const { field, setField } = useField();
    const menuRef = useRef<HTMLDivElement>(null);

    
    const handleToggleMenu = () => {
        setOpen((prev) => !prev)
    }

    const handleOnClick = (source: string) => {
        setField(source);
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
                    Field
                </span>
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-60
                    rounded-sm bg-medgray_hover min-h-2">

                    <div className="
                        mt-2 pl-2 pr-2 mb-2 gap-2
                        flex flex-col max-h-40 overflow-y-auto">
                        {fields.map((c) => (
                            <button 
                                className="flex pl-2 hover:bg-blackgrayhover cursor-pointer rounded-sm"
                                onClick={() => handleOnClick(c.src)}
                            >
                                <span className="text-[16px]">{c.name}</span>
                            </button>
                        ))}
                    </div>
        
                </div>
            )}
        </div>
    )
}