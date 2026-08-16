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

const MAX_WIDTH = 240;
const SIZING: React.CSSProperties = { width: "max-content", maxWidth: MAX_WIDTH };
const VIEWPORT_MARGIN = 6;

function computeStyle(rect: DOMRect, placement: TooltipPlacement): React.CSSProperties {
    const gap = 4;
    const base: React.CSSProperties = { position: "fixed", zIndex: 9999 };
    switch (placement) {
        case "top": return { ...base, bottom: Math.round(window.innerHeight - rect.top) + gap, left: Math.round(rect.left + rect.width / 2) };
        case "bottom": return { ...base, top: Math.round(rect.bottom) + gap, left: Math.round(rect.left + rect.width / 2) };
        case "left": return { ...base, right: Math.round(window.innerWidth - rect.left) + gap, top: Math.round(rect.top + rect.height / 2) };
        case "right": return { ...base, left: Math.round(rect.right) + gap, top: Math.round(rect.top + rect.height / 2) };
    }
}

const centerClass: Record<TooltipPlacement, string> = {
    top: "-translate-x-1/2 mb-0.5",
    bottom: "-translate-x-1/2 mt-0.5",
    left: "-translate-y-1/2 mr-0.5",
    right: "-translate-y-1/2 ml-0.5",
};

const slideClass: Record<TooltipPlacement, string> = {
    top: "translate-y-1",
    bottom: "-translate-y-1",
    left: "translate-x-1",
    right: "-translate-x-1",
};

const arrowClass: Record<TooltipPlacement, string> = {
    top: "top-full left-1/2 -translate-x-1/2",
    bottom: "bottom-full left-1/2 -translate-x-1/2 rotate-180",
    left: "left-full top-1/2 -translate-y-1/2 -rotate-90",
    right: "right-full top-1/2 -translate-y-1/2 rotate-90",
};

export default function Tooltip({ label, placement = "top", keybind = false, children, speed = "slow" }: TooltipProps) {
    const ref = useRef<HTMLDivElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties | null>(null);
    const [visible, setVisible] = useState(false);

    const openDelay = speed === "slow" ? 600 : 100;

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
                                bg-medgray_hover rounded-sm border-medgrayoffset border break-words text-center
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

                            <svg viewBox="0 0 50 50" className={`w-3 h-3 absolute ${arrowClass[placement]}`}>
                                <polygon className="fill-medgray_hover" points="2,0 48,0 25,26" />
                                {/* Both ends overshoot the base so the viewBox clips them, and that
                                    clip runs along the border the arrow overlaps. A cap is cut
                                    perpendicular to its own line, so a side ending level with the
                                    border tapers off it and leaves a wedge the fill has already
                                    wiped clean, while one ending past it paints a stub into the
                                    body. Cutting the overshoot on the clip gives a flat, full width
                                    entry on exactly the right line and neither artifact */}
                                <path className="stroke-medgrayoffset fill-none"
                                    d="M -1.5,-4 L 25,26 L 51.5,-4"
                                    stroke-width="4"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </div>,
                        document.body
                    )}
                </>
            ) : children}
        </Fragment>
    );
}
