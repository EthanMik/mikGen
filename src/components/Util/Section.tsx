import { useState, type ReactNode } from "react";
import downArrow from "../../assets/down-arrow.svg";

type SectionProps = {
    name?: string;
    children?: ReactNode;
    defaultCollapsed?: boolean;
};

export default function Section({ name = "", children, defaultCollapsed = false }: SectionProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const line = (clickable: boolean) => (
        <div
            className={`flex items-center gap-2 mt-1 mb-1 ${clickable ? "cursor-pointer group/sep" : ""}`}
            onClick={clickable ? () => setCollapsed(c => !c) : undefined}
        >
            {clickable && (
                <img
                    src={downArrow}
                    className={`w-[12px] h-[12px] opacity-40 group-hover/sep:opacity-100 transition-all duration-200 ${collapsed ? "-rotate-90" : ""}`}
                />
            )}
            {name.length > 0 && (
                <span className={`text-[13px] whitespace-nowrap transition-colors ${clickable ? "text-gray-400 group-hover/sep:text-white" : "text-gray-400"}`}>
                    {name}
                </span>
            )}
            <div className={`flex-1 border-t transition-colors ${clickable ? "border-gray-500/40 group-hover/sep:border-white/70" : "border-gray-500/40"}`} />
        </div>
    );

    if (!children) return line(false);

    return (
        <div className="flex flex-col gap-1.5">
            {line(true)}
            {!collapsed && children}
        </div>
    );
}
