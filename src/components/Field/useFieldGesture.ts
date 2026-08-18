import React, { useRef } from "react";
import { clamp, FIELD_IMG_DIMENSIONS } from "../../core/Util";
import { queueFieldImg } from "../../hooks/useFieldImg";
import { pointerToSvg } from "./FieldUtils";

const MAX_IMG_SIZE = FIELD_IMG_DIMENSIONS.w * 3;

type Point = { clientX: number; clientY: number };

/**
 * Two finger pan and pinch zoom on the field.
 *
 * The mouse gets pan and zoom from the middle button, Space and the wheel, none of which a touch
 * screen has. This tracks every active pointer on the svg; the moment a second one lands the
 * gesture takes over, so a node drag that was already running is handed off rather than fighting
 * the pinch.
 */
export function useFieldGesture(onGestureStart: () => void) {
    const pointers = useRef(new Map<number, Point>());
    // Centroid and spread of the last frame, so each move applies a delta rather than an absolute
    const last = useRef<{ center: Point; dist: number } | null>(null);
    // A ref, not state: the pointerdown that starts the pinch has to see the flag flip within the
    // same handler so it can bail out of the tap and pan paths, which a state update is too late for
    const active = useRef(false);
    const frame = useRef(0);

    const stopFrame = () => {
        if (frame.current !== 0) cancelAnimationFrame(frame.current);
        frame.current = 0;
    };

    /** Centroid and spread of the two primary contacts, in client coordinates. */
    const measure = (): { center: Point; dist: number } | null => {
        const pts = [...pointers.current.values()];
        if (pts.length < 2) return null;
        const [a, b] = pts;
        return {
            center: { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 },
            // Floored so a fully pinched-together pair cannot divide by zero
            dist: Math.max(Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), 1),
        };
    };

    /** Returns true once the pinch owns the gesture, so the caller can skip its own handling. */
    const gestureDown = (evt: React.PointerEvent<SVGSVGElement>): boolean => {
        if (evt.pointerType === "mouse") return false;
        // The primary contact marks a brand new gesture, so anything still in the map is a pointer
        // whose release never arrived. Left behind, it would be measured against at a position the
        // finger left long ago.
        if (evt.isPrimary) pointers.current.clear();
        pointers.current.set(evt.pointerId, { clientX: evt.clientX, clientY: evt.clientY });
        if (pointers.current.size < 2) return active.current;

        // Let the caller tear down whatever the first finger started before the pinch moves anything
        if (!active.current) onGestureStart();
        last.current = measure();
        active.current = true;
        return true;
    };

    /**
     * Reads the pair once per frame, after every pointer in it has reported.
     *
     * A single finger movement delivers one pointermove per contact, so measuring inside the
     * handler would see one finger at its new position and the other still at its old one. That
     * phantom stretch and rebound reads as a zoom, and a straight two finger pan would slowly
     * scale the field as it moved.
     */
    const applyFrame = (svg: SVGSVGElement) => {
        frame.current = 0;
        const prev = last.current;
        const now = measure();
        if (!prev || !now) return;
        last.current = now;

        // Both centroids in svg units. Whatever field content sat under the old centroid has to end
        // up under the new one, which expresses the pan and the zoom anchor as a single constraint.
        const from = pointerToSvg(prev.center, svg);
        const to = pointerToSvg(now.center, svg);
        const zoom = now.dist / prev.dist;

        queueFieldImg((img) => {
            const newW = Math.max(100, img.w * zoom);
            const newH = newW / (img.w / img.h);
            if (newW >= MAX_IMG_SIZE || newH >= MAX_IMG_SIZE) return img;

            // Fraction of the field image that sat under the old centroid
            const fx = (from.x - img.x) / img.w;
            const fy = (from.y - img.y) / img.h;

            return {
                x: clamp(to.x - fx * newW, -9999, 9999),
                y: clamp(to.y - fy * newH, -9999, 9999),
                w: newW,
                h: newH,
            };
        });
    };

    const gestureMove = (evt: React.PointerEvent<SVGSVGElement>, svg: SVGSVGElement | null) => {
        if (!pointers.current.has(evt.pointerId)) return;
        pointers.current.set(evt.pointerId, { clientX: evt.clientX, clientY: evt.clientY });
        if (!svg || frame.current !== 0) return;
        frame.current = requestAnimationFrame(() => applyFrame(svg));
    };

    const gestureUp = (evt: React.PointerEvent<SVGSVGElement>) => {
        if (!pointers.current.delete(evt.pointerId)) return;
        if (pointers.current.size >= 2) {
            // A third finger lifting leaves two behind; rebase so the remaining pair does not jump
            last.current = measure();
            return;
        }
        stopFrame();
        last.current = null;
        // Stay latched until every finger is up, so the last one lifting cannot be read as a tap
        if (pointers.current.size === 0) active.current = false;
    };

    const cancelGesture = () => {
        stopFrame();
        pointers.current.clear();
        last.current = null;
        active.current = false;
    };

    return { isGesturing: () => active.current, gestureDown, gestureMove, gestureUp, cancelGesture };
}
