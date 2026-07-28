import { useCallback, useEffect, useRef } from "react";

/**
 * Same idea as queueFieldImg (useFieldImg.ts): fold high-frequency work into animation
 * frames. The leading edge runs immediately so a single change has zero added latency;
 * while the frame window is open the newest task replaces the pending one and runs at the
 * next frame, so the final state is never dropped.
 */
export function useRafThrottle() {
    const frameRef = useRef(0);
    const taskRef = useRef<(() => void) | null>(null);

    const openWindow = useCallback(function openWindow() {
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0;
            const task = taskRef.current;
            taskRef.current = null;
            // The window stays open while work keeps arriving, closing one idle frame after it stops
            if (task) {
                task();
                openWindow();
            }
        });
    }, []);

    const schedule = useCallback((task: () => void) => {
        if (frameRef.current === 0) {
            task();
            openWindow();
        } else {
            taskRef.current = task;
        }
    }, [openWindow]);

    useEffect(() => () => {
        if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        taskRef.current = null;
    }, []);

    return schedule;
}
