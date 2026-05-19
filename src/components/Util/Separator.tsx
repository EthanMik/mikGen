import downArrow from "../../assets/down-arrow.svg";

type SeparatorProps = {
    name: string;
    onClick?: () => void;
    isCollapsed?: boolean;
};

export default function Separator({ name, onClick, isCollapsed }: SeparatorProps) {
    const clickable = onClick !== undefined;

    return (
        <div
            className={`flex items-center gap-2 mt-1 mb-1 ${clickable ? "cursor-pointer group/sep" : ""}`}
            onClick={onClick}
        >
            {clickable && (
                <img
                    src={downArrow}
                    className={`w-[12px] h-[12px] opacity-40 group-hover/sep:opacity-100 transition-all duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
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
}