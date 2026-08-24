import { useState, type ReactNode } from "react";
import downArrow from "../../assets/down-arrow.svg";

type SectionProps = {
    name?: string;
    children?: ReactNode;
    defaultCollapsed?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
    icon?: string;
    iconClassName?: string;
};

export default function Section({ name = "", children, defaultCollapsed = false, collapsed: collapsedProp, onToggle, icon, iconClassName = "" }: SectionProps) {
    const [uncontrolledCollapsed, setCollapsed] = useState(defaultCollapsed);
    const collapsed = collapsedProp ?? uncontrolledCollapsed;

    const toggle = () => {
        if (collapsedProp === undefined) setCollapsed(c => !c);
        onToggle?.();
    };
            
    const line = (clickable: boolean) => (
        <div className="flex flex-col">
            {(clickable || name.length > 0) && (
                <div
                    className={`
                        flex items-center mt-1 h-[29px] rounded-sm justify-between
                        hover:brightness-90
                        transition-all duration-100
                        active:scale-[0.995]
                        relative text-[14px]
                        outline-2
                        ${!collapsed ? "outline-medlightgray" : "outline-transparent"}
                        ${clickable ? "cursor-pointer group/sep" : ""}`
                    }
                    onClick={clickable ? toggle : undefined}
                >
                    <div className="flex pl-2 gap-2 items-center">
                        {clickable && (
                            <img
                                src={downArrow}
                                className={`w-[12px] h-[12px] shrink-0 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
                            />
                        )}
                        {name.length > 0 && (
                            <span className="whitespace-nowrap transition-colors">
                                {name}
                            </span>
                        )}
                    </div>
                    {icon && (
                        <img
                            src={icon}
                            className={`w-4 h-4 mr-2 shrink-0 ${iconClassName}`}
                        />
                    )}
                </div>
            )}
            {(!clickable) && <div className={`flex-1 border-t text-medlightgray`} />}
        </div>
    );

    if (!children) return line(false);

    return (
        <div className="flex flex-col">
            {line(true)}
            {!collapsed && <div className="flex flex-col mt-1.5 ml-4 gap-1">{children}</div>}
        </div>
    );
}
