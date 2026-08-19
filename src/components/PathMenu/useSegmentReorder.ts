import React, { useEffect, useRef, useState } from "react";
import { fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { buildDraggingIds, moveSegments } from "./SegmentEdits";

// Matches the field's box select, so starting a drag feels the same everywhere
const DRAG_THRESHOLD = 5;
// A finger is never as still as a mouse; anything under this is still treated as a press
const TOUCH_SLOP = 10;
const LONG_PRESS_MS = 300;
// How close to the container edge a drag has to get before the list scrolls itself
const AUTOSCROLL_ZONE = 40;
const AUTOSCROLL_PX = 8;

/** Marks the wrapper elements the drop index is measured against. */
export const ROW_INDEX_ATTR = "data-segment-row";

/**
 * The gesture handlers a row binds, plus the flag it checks before treating a click as a select.
 * Handed out as one object with a stable identity, so a memoized row does not re-render on every
 * pointer move of somebody else's drag.
 */
export type SegmentReorder = {
    onPointerDown: (evt: React.PointerEvent<HTMLElement>, segmentId: string) => void;
    onPointerMove: (evt: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (evt: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (evt: React.PointerEvent<HTMLElement>) => void;
    /** True when the gesture that just ended was a drag, so the row can skip its select. */
    wasDragged: () => boolean;
};

type Pending = {
    pointerId: number;
    segmentId: string;
    element: HTMLElement;
    startX: number;
    startY: number;
    touch: boolean;
};

/**
 * Drag to reorder segments, driven by pointer events so one implementation serves both mouse and
 * touch. It replaces the native HTML5 drag and drop this list used to use, which mobile browsers
 * never fire at all.
 *
 * Activation differs by input because the same gesture means two things on a touch screen: a
 * mouse starts dragging as soon as it moves past a threshold, while a finger has to hold still for
 * a moment first, leaving a plain swipe free to scroll the list.
 */
export function useSegmentReorder(listRef: React.RefObject<HTMLDivElement | null>) {
    const [draggingIds, setDraggingIds] = useState<string[]>([]);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    const pending = useRef<Pending | null>(null);
    const active = useRef(false);
    // Read by the row's click handler to tell a drag apart from a select. Cleared on the next
    // press rather than on release, because the click arrives after pointerup.
    const didDrag = useRef(false);
    const overIndexRef = useRef<number | null>(null);
    // Mirrors draggingIds so the commit on pointerup does not depend on a render having landed
    const draggingIdsRef = useRef<string[]>([]);
    const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoScroll = useRef(0);
    const scrollDir = useRef(0);

    /**
     * Once a touch drag is armed the browser must not scroll, and touch-action alone cannot say
     * that: the rows have to stay pannable so an ordinary swipe still scrolls the list. A
     * non-passive touchmove that preventDefaults is the only way to revoke it after the fact, and
     * it works here because the long press means no scroll was ever in flight.
     */
    const blockScroll = useRef((e: TouchEvent) => { if (active.current) e.preventDefault(); });

    const stopAutoScroll = () => {
        if (autoScroll.current !== 0) cancelAnimationFrame(autoScroll.current);
        autoScroll.current = 0;
        scrollDir.current = 0;
    };

    const cleanup = () => {
        if (longPress.current !== null) clearTimeout(longPress.current);
        longPress.current = null;
        document.removeEventListener("touchmove", blockScroll.current);
        stopAutoScroll();
        pending.current = null;
        active.current = false;
        overIndexRef.current = null;
        draggingIdsRef.current = [];
        setDraggingIds([]);
        setOverIndex(null);
    };

    // Unmounting mid-drag has to drop the document listener and the raf loop; the ref keeps the
    // effect from re-registering every render just to see the latest closure
    const cleanupRef = useRef(cleanup);
    cleanupRef.current = cleanup;
    useEffect(() => () => cleanupRef.current(), []);

    /**
     * The insertion index the pointer is currently over, from row geometry rather than per-row
     * enter events: pointer capture routes every move to the row that started the drag, so the
     * rows underneath never hear about it. getBoundingClientRect is in screen space like clientY,
     * which keeps this correct under the app wide transform scale.
     */
    const indexAt = (clientY: number): number => {
        const rows = listRef.current?.querySelectorAll<HTMLElement>(`[${ROW_INDEX_ATTR}]`);
        if (!rows || rows.length === 0) return 1;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i].getBoundingClientRect();
            if (clientY < r.top + r.height / 2) return Math.max(i, 1);
        }
        return rows.length;
    };

    const tickAutoScroll = () => {
        const list = listRef.current;
        if (!list || scrollDir.current === 0 || !active.current) { stopAutoScroll(); return; }
        list.scrollTop += scrollDir.current * AUTOSCROLL_PX;
        autoScroll.current = requestAnimationFrame(tickAutoScroll);
    };

    const updateAutoScroll = (clientY: number) => {
        const list = listRef.current;
        if (!list) return;
        const r = list.getBoundingClientRect();
        const dir = clientY < r.top + AUTOSCROLL_ZONE ? -1
            : clientY > r.bottom - AUTOSCROLL_ZONE ? 1
                : 0;
        if (dir === scrollDir.current) return;
        scrollDir.current = dir;
        if (dir === 0) { stopAutoScroll(); return; }
        if (autoScroll.current === 0) autoScroll.current = requestAnimationFrame(tickAutoScroll);
    };

    const begin = (clientY: number) => {
        const p = pending.current;
        if (!p || active.current) return;
        if (longPress.current !== null) { clearTimeout(longPress.current); longPress.current = null; }

        active.current = true;
        didDrag.current = true;
        // Capture on the row so the drag survives the pointer leaving it, which it immediately does
        p.element.setPointerCapture(p.pointerId);
        if (p.touch) document.addEventListener("touchmove", blockScroll.current, { passive: false });

        const ids = buildDraggingIds(fileFormatStore.getState().path.segments, p.segmentId);
        draggingIdsRef.current = ids;
        setDraggingIds(ids);
        const idx = indexAt(clientY);
        overIndexRef.current = idx;
        setOverIndex(idx);
    };

    const onPointerDown = (evt: React.PointerEvent<HTMLElement>, segmentId: string) => {
        if (evt.button !== 0 || active.current) return;
        didDrag.current = false;

        const touch = evt.pointerType !== "mouse";
        pending.current = {
            pointerId: evt.pointerId,
            segmentId,
            element: evt.currentTarget,
            startX: evt.clientX,
            startY: evt.clientY,
            touch,
        };

        if (!touch) return;
        const holdY = evt.clientY;
        longPress.current = setTimeout(() => { longPress.current = null; begin(holdY); }, LONG_PRESS_MS);
    };

    const onPointerMove = (evt: React.PointerEvent<HTMLElement>) => {
        const p = pending.current;
        if (!p || evt.pointerId !== p.pointerId) return;

        if (!active.current) {
            const moved = Math.hypot(evt.clientX - p.startX, evt.clientY - p.startY);
            // A finger that moves before the hold completes is scrolling, not reordering
            if (p.touch) { if (moved > TOUCH_SLOP) cleanup(); return; }
            if (moved > DRAG_THRESHOLD) begin(evt.clientY);
            return;
        }

        const idx = indexAt(evt.clientY);
        if (idx !== overIndexRef.current) {
            overIndexRef.current = idx;
            setOverIndex(idx);
        }
        updateAutoScroll(evt.clientY);
    };

    const onPointerUp = (evt: React.PointerEvent<HTMLElement>) => {
        const p = pending.current;
        if (!p || evt.pointerId !== p.pointerId) return;

        const ids = draggingIdsRef.current;
        const to = overIndexRef.current;
        const wasActive = active.current;
        cleanup();

        if (!wasActive || to === null || ids.length === 0) return;
        let moved = false;
        updatePath(prev => {
            const next = moveSegments(prev, ids, to);
            moved = next !== prev;
            return next;
        });
        // A drag that lands the rows back where they started is not worth an undo step
        if (moved) saveSnapshot();
    };

    const onPointerCancel = (evt: React.PointerEvent<HTMLElement>) => {
        if (pending.current?.pointerId !== evt.pointerId) return;
        cleanup();
    };

    // The handlers close over refs and setState only, so the object can be filled in place rather
    // than rebuilt: rows keep the same prop across renders
    const reorder = useRef<SegmentReorder>({
        onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
        wasDragged: () => didDrag.current,
    }).current;
    reorder.onPointerDown = onPointerDown;
    reorder.onPointerMove = onPointerMove;
    reorder.onPointerUp = onPointerUp;
    reorder.onPointerCancel = onPointerCancel;

    return { draggingIds, overIndex, reorder };
}
