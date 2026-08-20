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

/** A row with a node of its own, and a turn or wait that draws on the node behind it. */
const drive = (selected: boolean) => ({ selected, pose: { x: 10, y: 10 } });
const rider = (selected: boolean) => ({ selected, pose: { x: null, y: null } });

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

    it("carries a turn up with the node it draws on", () => {
        // The turn has no node of its own, so lifting the drive it sits on would bury it
        const order = selectedLastOrder([drive(true), rider(false), drive(false)]);
        expect(order).toEqual([2, 0, 1]);
    });

    it("carries every rider on a lifted node, turn or wait alike", () => {
        const order = selectedLastOrder([drive(true), rider(false), rider(false), drive(false)]);
        expect(order).toEqual([3, 0, 1, 2]);
    });

    it("leaves a turn where it is when the node it draws on is not lifted", () => {
        const order = selectedLastOrder([drive(false), rider(false), drive(true)]);
        expect(order).toEqual([0, 1, 2]);
    });

    it("does not lift a selected turn above a drive it does not sit on", () => {
        const order = selectedLastOrder([drive(false), rider(true), drive(true)]);
        expect(order).toEqual([0, 1, 2]);
    });

    it("keeps a selected turn above its own lifted node", () => {
        const order = selectedLastOrder([drive(true), rider(true)]);
        expect(order).toEqual([0, 1]);
    });

    it("keeps riders in path order when several share one lifted node", () => {
        const order = selectedLastOrder([drive(true), rider(true), rider(false)]);
        expect(order).toEqual([0, 1, 2]);
    });

    it("lifts a rider with no node behind it on its own selection alone", () => {
        expect(selectedLastOrder([rider(true), drive(false)])).toEqual([1, 0]);
    });

    it("lifts a segment whose bezier control is selected", () => {
        const withControl = [
            { selected: false, controls: [{ selected: true }] },
            { selected: false },
        ];
        expect(selectedLastOrder(withControl)).toEqual([1, 0]);
    });
});
