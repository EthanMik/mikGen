import type { ReactNode } from "react";

type KeybindButtonProps = {
    callback: () => void;
    name: string,
    keybind?: ReactNode,
    textSize?: number,
}

export function MenuKeybindButton({ callback, name, keybind, textSize }: KeybindButtonProps) {
    return (
        <button
            onClick={callback}
            className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
            <span className={`text-[${textSize || 14}px]`}>{name}</span>
            <span className={`text-lightgray text-[${textSize || 14}px] font-sans flex items-center gap-0`}>{keybind}</span>
        </button>
    );
}

export function ConfigKeybindButton({ callback, name, keybind, textSize }: KeybindButtonProps) {
    return (
        <button
            onClick={callback}
            className="flex pr-1 pl-2 py-0.5 items-center justify-between bg-medgray hover:brightness-92 cursor-pointer rounded-sm">
            <span className={`text-[${textSize || 14}px]`}>{name}</span>
            <span className={`text-lightgray text-[${textSize || 14}px] font-sans flex items-center gap-0`}>{keybind}</span>
        </button>
    );
}
