import { useEffect, useRef, useState } from "react";
import { useCommand } from "../../hooks/useCommands";
import { RemoveCommandButton } from "./RemoveCommandButton";
import { CommmandInput } from "./CommandInput";
import { builtInCommands, type CommandString } from "../../core/Types/Command";
import CommandColorMenu from "./CommandColorMenu";

export default function CommandButton() {
    const [isOpen, setOpen] = useState(false);
    const [commands,] = useCommand();
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

    const splitCommand = (commandText: string): CommandString[] => {
        const tokens = commandText.split(/(\(|\)|[^a-zA-Z0-9()]+)/).filter(t => t.length > 0);

        let balance = 0;
        for (const token of tokens) {
            if (token === "(") balance++;
            if (token === ")") balance--;
        }
        const isBalanced = balance === 0;

        const cmdStr = tokens.map(token => {
            if (token === "(" || token === ")") {
                return { name: token, color: isBalanced ? "#569cd6" : "#ff4444" };
            }

            const builtIn = builtInCommands.find(cmd => cmd.name === token);

            if (builtIn) {
                return { name: token, color: builtIn.color };
            }

            return { name: token, color: "#cccccc" };
        });
        return cmdStr;
    }

    return (
        <div ref={menuRef} className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`}>
            <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
                <span className="text-[20px]">
                    Commands
                </span>
            </button>

            {isOpen && (
                <div className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-60 
                    rounded-sm bg-medgray_hover min-h-2">
                    <div className="flex flex-col mt-2 pl-2 mb-2 gap-2">
                        <div className="flex flex-col max-h-40 overflow-y-auto">
                            {commands.map((c) => (
                                <div className="flex flex-row items-center justify-between pr-3">
                                    <div className="flex flex-row items-center gap-2">
                                        <CommandColorMenu />
                                        <span className="text-[16px]">
                                            {splitCommand(c.name).map((n) => (
                                                <span
                                                    style={{ color: n.color }}
                                                    key={n.name}>
                                                    {n.name}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                    <RemoveCommandButton commandId={c.id} />
                                </div>
                            ))}
                        </div>

                        <CommmandInput width={175} height={30} />
                    </div>
                </div>
            )}
        </div>
    )
}