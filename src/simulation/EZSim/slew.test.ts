import { describe, it, expect } from "vitest";
import { slew } from "./slew";

describe("slew", () => {
    it("stays finite for a zero-length move", () => {
        const s = new slew(30, 5);
        s.initialize(true, 110, 0, 0);
        s.initialize(true, 110, 0, 0);
        expect(Number.isFinite(s.iterate(0))).toBe(true);
    });

    it("stays finite when the slew distance is 0", () => {
        const s = new slew(30, 0);
        s.initialize(true, 110, 24, 0);
        s.initialize(true, 110, 24, 0);
        expect(Number.isFinite(s.iterate(0))).toBe(true);
    });

    it("still ramps on a normal move", () => {
        const s = new slew(30, 5);
        s.initialize(true, 110, 24, 0);
        s.initialize(true, 110, 24, 0);
        const out = s.iterate(0);
        expect(Number.isFinite(out)).toBe(true);
        expect(out).toBeGreaterThan(0);
    });
});
