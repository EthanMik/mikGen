import { useEffect, useRef, useState, type ReactNode } from "react";

type MenuButtonTemplateProps = {
    title: string;
    children: ReactNode;
    width?: number;
    onOpen?: () => void;
    onClose?: () => void;
    flashRef?: { current: (() => void) | undefined };
    underlineRef?: { current: ((val: boolean) => void) | undefined };
    closeOnClick?: boolean;
}

export default function MenuButtonTemplate({ title, children, onOpen, onClose, width, flashRef, underlineRef, closeOnClick = true }: MenuButtonTemplateProps) {
    const [isOpen, setOpen] = useState(false);
    const [flash, setFlash] = useState(false);
    const [underline, setUnderline] = useState(false);
    const flashTimeoutRef = useRef<number | null>(null);
    const blockNextContextMenu = useRef(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (blockNextContextMenu.current) { e.preventDefault(); blockNextContextMenu.current = false; }
        };
        document.addEventListener("contextmenu", handleContextMenu, true);
        return () => document.removeEventListener("contextmenu", handleContextMenu, true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (e.button !== 0) return;
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
                onCloseRef.current?.();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleRightClick = (e: MouseEvent) => {
            if (e.button !== 2) return;
            if (menuRef.current?.contains(e.target as Node)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                blockNextContextMenu.current = true;
                setOpen(false);
                onCloseRef.current?.();
            }
        };
        document.addEventListener("mousedown", handleRightClick, true);
        return () => document.removeEventListener("mousedown", handleRightClick, true);
    }, [isOpen]);

    if (flashRef) {
        flashRef.current = () => {
            setFlash(true);
            if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
            flashTimeoutRef.current = window.setTimeout(() => setFlash(false), 400);
        };
    }

    if (underlineRef) {
        underlineRef.current = setUnderline;
    }

    const handleToggle = () => {
        setOpen(prev => {
            const next = !prev;
            if (next) onOpen?.();
            else onCloseRef.current?.();
            return next;
        });
    };

    return (  
        <div
            ref={menuRef}
            className={`relative rounded-sm hover:bg-medgray_hover
                ${isOpen ? "bg-medgray_hover" : flash ? "bg-medlightgray ease-out duration-100" : ""}`}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
            onMouseDown={e => { if (e.button === 2) { e.preventDefault(); e.stopPropagation(); } }}
        >
            <button onClick={handleToggle} className="px-1 cursor-pointer">
                <span className={`text-[12px] ${underline ? "underline" : ""}`}>{title}</span>
            </button>

            {isOpen && (
                <div
                    className={`absolute left-0 top-full mt-1 z-40 w-42 rounded-sm bg-medgray_hover shadow-xs shadow-black`}
                    onClick={() => { if (closeOnClick) { setOpen(false); onCloseRef.current?.(); } }}
                >
                    <div className="flex flex-col mt-2 px-1 mb-2 gap-0.5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
