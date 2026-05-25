import { useRef, useState, type ReactNode, useEffect } from "react";
import downArrow from "../../assets/down-arrow.svg";

type ConfigButtonTemplateProps = {
    title: string;
    children: ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
    flashRef?: { current: (() => void) | undefined };
    underlineRef?: { current: ((val: boolean) => void) | undefined };
}

export default function ConfigButtonTemplate({ title, children, onOpen, onClose, flashRef, underlineRef }: ConfigButtonTemplateProps) {
    const [isOpen, setOpen] = useState(false);
    const [flash, setFlash] = useState(false);
    const [underline, setUnderline] = useState(false);
    const flashTimeoutRef = useRef<number | null>(null);
    const blockNextContextMenu = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (blockNextContextMenu.current) { e.preventDefault(); blockNextContextMenu.current = false; }
        };
        document.addEventListener("contextmenu", handleContextMenu, true);
        return () => document.removeEventListener("contextmenu", handleContextMenu, true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleRightClick = (e: MouseEvent) => {
            if (e.button !== 2) return;
            if (containerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                blockNextContextMenu.current = true;
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleRightClick, true);
        return () => {
            document.removeEventListener("mousedown", handleRightClick, true);
        };
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
            else onClose?.();
            return next;
        });
    };

    return (
        <div
            ref={containerRef}
            className={`flex flex-col ${isOpen ? "config-open" : ""}`}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
            onMouseDown={e => { if (e.button === 2) { e.preventDefault(); e.stopPropagation(); } }}
        >
            <button
                onClick={handleToggle}
                className={`flex flex-row items-center justify-between
                    gap-[12px] px-2 py-2 cursor-pointer bg-medgray [.config-open+div_&]:rounded-t-sm [*:last-child:not(.config-open)>&]:rounded-b-sm
                    ${flash ? "bg-medlightgray ease-out duration-100" : ""}`}
            >
                <span className={`text-[16px] ${underline ? "underline" : ""}`}>{title}</span>
                <img
                    className={`w-[12px] h-[12px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    src={downArrow}
                />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} 
            ${isOpen ? "mb-2" : ""}`}>
                <div className="overflow-hidden">
                    <div className={`relative flex flex-col gap-1 bg-medgray px-2 py-2 ${isOpen ? "rounded-b-sm" : ""}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
