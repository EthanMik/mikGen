type SeparatorProps = {
    name: string,
};

export default function Separator({
    name
}: SeparatorProps) {
    return (
        <div className="flex items-center gap-2 mt-1 mb-1">
            { name.length > 0 && <span className="text-[13px] text-gray-400 whitespace-nowrap">{name}</span>}
            <div className="flex-1 border-t border-gray-500/40"></div>
        </div>
    );
}