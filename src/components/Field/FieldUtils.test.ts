import { describe, it, expect, vi } from "vitest";

// FieldUtils pulls in useFileFormat, which reads localStorage at module load
vi.hoisted(() => {
    const store = new Map<string, string>();
    globalThis.localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v); },
        removeItem: (k: string) => { store.delete(k); },
        clear: () => { store.clear(); },
        key: (i: number) => [...store.keys()][i] ?? null,
        get length() { return store.size; },
    } as Storage;
});

import { insertIndexAfterSelection, selectedLastOrder } from "./FieldUtils";

const segs = (...selected: boolean[]) => selected.map(s => ({ selected: s }));

describe("insertIndexAfterSelection", () => {
    it("inserts after the last selected segment, not the first", () => {
        expect(insertIndexAfterSelection(segs(false, false, false, true, true))).toBe(5);
    });

    it("inserts after a selected range in the middle", () => {
        expect(insertIndexAfterSelection(segs(false, true, true, false, false))).toBe(3);
    });

    it("appends at the end when nothing is selected", () => {
        expect(insertIndexAfterSelection(segs(false, false, false))).toBe(3);
    });

    it("returns 0 for an empty path", () => {
        expect(insertIndexAfterSelection([])).toBe(0);
    });
});

describe("selectedLastOrder", () => {
    it("moves a selected segment above one that comes after it", () => {
        expect(selectedLastOrder(segs(true, false))).toEqual([1, 0]);
    });

    it("keeps relative order within the selected and unselected groups", () => {
        expect(selectedLastOrder(segs(false, true, false, true, false))).toEqual([0, 2, 4, 1, 3]);
    });

    it("lifts a segment whose bezier control is selected", () => {
        const withControl = [
            { selected: false, controls: [{ selected: true }] },
            { selected: false },
        ];
        expect(selectedLastOrder(withControl)).toEqual([1, 0]);
    });
});
