import { useState, type ReactNode } from "react";
import downArrow from "../../assets/down-arrow.svg";

type SectionProps = {
    name?: string;
    children?: ReactNode;
    defaultCollapsed?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
    highlight?: boolean;
};

export default function Section({ name = "", children, defaultCollapsed = false, collapsed: collapsedProp, onToggle, highlight = false }: SectionProps) {
    const [uncontrolledCollapsed, setCollapsed] = useState(defaultCollapsed);
    const collapsed = collapsedProp ?? uncontrolledCollapsed;

    const toggle = () => {
        if (collapsedProp === undefined) setCollapsed(c => !c);
        onToggle?.();
    };

    const bar = <div className="w-full h-[2px] mt-0.5 rounded-sm bg-medlightgray" />;

    const line = (clickable: boolean) => (
        <div className="flex flex-col">
            {(clickable || name.length > 0) && (
                <div
                    className={`flex items-center gap-2 mt-1 mb-1 rounded-sm ${clickable ? "cursor-pointer group/sep" : ""} ${highlight ? "brightness-140" : ""}`}
                    onClick={clickable ? toggle : undefined}
                >
                    {clickable && (
                        <img
                            src={downArrow}
                            className={`w-[12px] h-[12px] opacity-40 group-hover/sep:opacity-100 transition-all duration-200 ${collapsed ? "-rotate-90" : ""}`}
                        />
                    )}
                    {name.length > 0 && (
                        <span className={`text-[14px] whitespace-nowrap transition-colors ${clickable ? "text-gray-400 group-hover/sep:text-white" : "text-gray-400"}`}>
                            {name}
                        </span>
                    )}
                </div>
            )}
            {(!clickable || !collapsed) && bar}
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
