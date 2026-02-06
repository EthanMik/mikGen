import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom";
import { useScale } from "../../contexts/ScaleContext";

type CommandColorMenuProps = {
    width?: number,
    height?: number,
}

const palette: string[] = [
    "#a02007", "#f3722c", "#f8961e",
    "#ffd043", "#7fc96b", "#43aa8b",
    "#0095ac", "#1566bd", "#66418a",
]

export default function CommandColorMenu({
    width = 20,
    height = 20
}: CommandColorMenuProps) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const scale = useScale();

    const handleToggleMenu = () => {
        if (!open && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom, left: rect.left });
        }
        setOpen((prev) => !prev);
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
        <div
            ref={menuRef}

            className="relative"
        >
            <button onClick={handleToggleMenu} className="
                bg-green-400 cursor-pointer
                rounded-sm
                hover:brightness-75
                "
                style={{
                    width: `${width}px`,
                    height: `${height}px`
                }}
            >

            </button>

            {open && createPortal(
                <div
                    className="fixed bg-medgray p-2 rounded-sm z-50"
                    style={{
                        top: menuPos.top,
                        left: menuPos.left,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left"
                    }}
                >
                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                        {palette.map((c) => (
                            <div
                                key={c}
                                className="rounded-sm cursor-pointer hover:brightness-75"
                                style={{
                                    width: `${width}px`,
                                    height: `${height}px`,
                                    backgroundColor: c,
                                }}
                            />
                        ))}
                    </div>
                </div>,
                document.body
            )}

        </div>
    )
}