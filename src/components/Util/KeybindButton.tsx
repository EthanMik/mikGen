import type { ReactNode } from "react";

type KeybindButtonProps = {
    callback: () => void;
    name: string,
    keybind?: ReactNode,
    textSize?: number,
    color?: string,
}

export function MenuKeybindButton({ callback, name, keybind, textSize }: KeybindButtonProps) {
    return (
        <button
            onClick={callback}
            className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
            <span className={`text-[${textSize || 14}px] truncate min-w-0`}>{name}</span>
            <span className={`text-lightgray text-[${textSize || 14}px] font-sans flex items-center gap-0`}>{keybind}</span>
        </button>
    );
}

const toSolid = (color: string) => color.replace(/,\s*[\d.]+\)$/, ", 1)");

export function ConfigKeybindButton({ callback, name, keybind, textSize, color }: KeybindButtonProps) {
    return (
        <button
            onClick={callback}
            className="relative flex w-full pr-1 pl-2 py-0.5 items-center justify-between bg-medgray hover:brightness-92 cursor-pointer rounded-sm">
            <span style={color ? { paddingLeft: "6px" } : undefined} className={`text-[${textSize || 14}px] truncate min-w-0`}>{name}</span>
            <span className={`text-lightgray text-[${textSize || 14}px] font-sans flex items-center gap-0`}>{keybind}</span>
            {color && <span className="absolute inset-y-0 left-0.5 w-1 h-5 self-center rounded-sm" style={{ backgroundColor: toSolid(color) }} />}
        </button>
    );
}
