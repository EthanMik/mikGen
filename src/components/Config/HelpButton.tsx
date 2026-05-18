import { useEffect, useRef, useState } from "react";
import downArrow from "../../assets/play.svg";

export default function HelpButton() {
    const [isOpen, setOpen] = useState(false);
    const [exampleOpen, setExampleOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const handleToggleMenu = () => setOpen((prev) => !prev);

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
            className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"
                } hover:bg-medgray_hover rounded-sm`}
        >
            <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
                <span className="text-[20px]">Help</span>
            </button>

            {isOpen && (
                <div
                    className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-40 rounded-sm bg-medgray_hover min-h-2 z-40"
                >
                    <div className="mt-2 pl-2 pr-2 mb-2 gap-1 flex flex-col max-h-40 overflow-y-auto scrollbar-thin">

                        <button className="flex flex-row gap-2 hover:bg-blackgrayhover pr-1 pl-1 rounded-sm"
                            onDragEnter={() => setExampleOpen(true)}
                            onDragLeave={() => setExampleOpen(false)}
                        >
                            <span className="whitespace-nowrap text-[16px]">Example Paths</span>

                            <div className="w-25 flex items-center justify-end">
                                <label className="flex items-center gap-2 select-none">
                                    <img className="w-[10px] h-[10px]"
                                        src={downArrow}
                                    />
                                </label>
                            </div>

                        </button>
                        <button className="flex flex-row gap-2 hover:bg-blackgrayhover pr-2 pl-2 rounded-sm">
                            <span className="text-[16px]">Keybinds</span>
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}
