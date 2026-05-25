import { Fragment, type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

type TooltipProps = {
    label: string | undefined;
    placement?: TooltipPlacement;
    speed?: "slow" | "fast";
    keybind?: boolean,
    children: ReactNode;
};

function computeStyle(rect: DOMRect, placement: TooltipPlacement): React.CSSProperties {
    const gap = 4;
    const base: React.CSSProperties = { position: "fixed", zIndex: 9999 };
    switch (placement) {
        case "top":    return { ...base, bottom: window.innerHeight - rect.top + gap, left: rect.left + rect.width / 2 };
        case "bottom": return { ...base, top: rect.bottom + gap,                      left: rect.left + rect.width / 2 };
        case "left":   return { ...base, right: window.innerWidth - rect.left + gap,  top: rect.top + rect.height / 2 };
        case "right":  return { ...base, left: rect.right + gap,                      top: rect.top + rect.height / 2 };
    }
}

// centering offset applied via Tailwind so it combines with animation translate via CSS vars
const centerClass: Record<TooltipPlacement, string> = {
    top:    "-translate-x-1/2",
    bottom: "-translate-x-1/2",
    left:   "-translate-y-1/2",
    right:  "-translate-y-1/2",
};

const slideClass: Record<TooltipPlacement, string> = {
    top:    "translate-y-1",
    bottom: "-translate-y-1",
    left:   "translate-x-1",
    right:  "-translate-x-1",
};

export default function Tooltip({ label, placement = "top", keybind = false, children, speed = "slow" }: TooltipProps) {
    const ref = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties | null>(null);
    const [visible, setVisible] = useState(false);

    const openDelay = speed === "slow" ? 600 : 400;

    function handleMouseEnter() {
        clearTimeout(hideTimer.current);
        if (ref.current) setTooltipStyle(computeStyle(ref.current.getBoundingClientRect(), placement));
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }

    function handleMouseLeave() {
        setVisible(false);
        hideTimer.current = setTimeout(() => setTooltipStyle(null), 250);
    }

    return (
        <Fragment>
            {label !== undefined ? (
                <>
                    <div ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        {children}
                    </div>
                    {tooltipStyle && createPortal(
                        <div
                            className={`
                                pointer-events-none flex items-center gap-1 px-2 py-1
                                bg-medgray_hover rounded-sm border-medgrayoffset border whitespace-nowrap
                                transition-all duration-150
                                ${centerClass[placement]}
                                ${visible
                                    ? "opacity-100"
                                    : `opacity-0 ${slideClass[placement]} delay-100`
                                }
                            `}
                            style={{ ...tooltipStyle, transitionDelay: visible ? `${openDelay}ms` : "100ms" }}
                        >
                            <span className={`text-[10px] ${keybind ? "text-lightgray" : "text-verylightgray"}`}>{label}</span>
                        </div>,
                        document.body
                    )}
                </>
            ) : children}
        </Fragment>
    );
}
