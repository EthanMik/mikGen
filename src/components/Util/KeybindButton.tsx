import type { ReactNode } from "react";

type KeybindButtonProps = {
    callback: () => void;
    name: string,
    keybind: ReactNode,
}

export default function KeybindButton({ callback, name, keybind }: KeybindButtonProps) {
    return (
        <button
            onClick={callback}
            className="flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm">
            <span className="text-[14px]">{name}</span>
            <span className="text-lightgray text-[14px] font-sans flex items-center gap-0">{keybind}</span>
        </button>
    );
}
