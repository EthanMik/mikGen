import { useEffect, useRef, useState } from "react";

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
        <div ref={menuRef} className="relative hover:bg-medgray_hover rounded-sm">
            <button onClick={handleToggleMenu} className="px-3 py-1">
                <span className="text-[20px]">
                    Commands
                </span>

            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-35 h-10 rounded-sm bg-medgray_hover">
                    <div className="">
                        <span>Command 1</span>
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