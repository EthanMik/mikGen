import { Fragment, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clamp } from "../../core/Util";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

type TooltipProps = {
    label: string | undefined;
    placement?: TooltipPlacement;
    speed?: "slow" | "fast";
    keybind?: boolean,
    children: ReactNode;
};

// A label wider than this wraps onto another row instead of running off the window
const MAX_WIDTH = 240;
// Fixed positioning shrinks a box to the space left between its left edge and the window, so a
// tooltip near an edge would wrap on its own. max-content sizes it to the label and lets MAX_WIDTH
// be the only thing that wraps it
const SIZING: React.CSSProperties = { width: "max-content", maxWidth: MAX_WIDTH };
const VIEWPORT_MARGIN = 6;

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
    const tipRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties | null>(null);
    const [visible, setVisible] = useState(false);

    const openDelay = speed === "slow" ? 600 : 100;

    // A wrapped label is wide enough to run past the window when its anchor sits near an edge,
    // so the centered placements get nudged back in once the wrapped width is known. Written to
    // the node instead of state since the left in tooltipStyle stays put and React leaves it alone
    useLayoutEffect(() => {
        const tip = tipRef.current;
        if (!tip || !tooltipStyle || (placement !== "top" && placement !== "bottom")) return;
        const center = tooltipStyle.left as number;
        const half = tip.offsetWidth / 2;
        const min = VIEWPORT_MARGIN + half;
        const max = window.innerWidth - VIEWPORT_MARGIN - half;
        tip.style.left = `${clamp(center, min, Math.max(min, max))}px`;
    }, [tooltipStyle, placement]);

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
                            ref={tipRef}
                            className={`
                                pointer-events-none flex items-center gap-1 px-2 py-1
                                bg-medgray_hover rounded-sm border-medgrayoffset border break-words
                                duration-150
                                ${centerClass[placement]}
                                ${visible
                                    ? "opacity-100"
                                    : `opacity-0 ${slideClass[placement]} delay-100`
                                }
                            `}
                            style={{ ...tooltipStyle, ...SIZING, transitionDelay: visible ? `${openDelay}ms` : "100ms" }}
                        >
                            <span className={`text-[10px] leading-snug ${keybind ? "text-lightgray" : "text-verylightgray"}`}>{label}</span>
                        </div>,
                        document.body
                    )}
                </>
            ) : children}
        </Fragment>
    );
}
