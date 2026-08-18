import { useEffect, useState } from "react";

const QUERY = "(pointer: coarse)";

/**
 * True when the primary pointer is a finger rather than a mouse. Used to grow hit targets that are
 * comfortable to click but too small to land on with a fingertip.
 */
export function usePointerCoarse(): boolean {
    const [coarse, setCoarse] = useState(
        () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(QUERY);
        const onChange = () => setCoarse(mql.matches);
        mql.addEventListener("change", onChange);
        onChange();
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return coarse;
}
