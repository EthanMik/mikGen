type HoverButtonProps = {
    src: string;
    onClick: () => void;
    className?: string;
    imgClassName?: string;
    style?: React.CSSProperties;
};

export default function HoverButton({ src, onClick, className = "", imgClassName = "w-[15px] h-[15px]", style }: HoverButtonProps) {
    return (
        <button
            className={`flex items-center justify-center bg-medgray rounded-sm cursor-pointer transition opacity-50 hover:opacity-100 ${className}`}
            style={style}
            onClick={onClick}
        >
            <img className={imgClassName} src={src} />
        </button>
    );
}
