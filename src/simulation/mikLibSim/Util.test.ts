import { describe, it, expect } from "vitest";
import { clamp_max_slip, reduce_negative_180_to_180 } from "./Util";

describe("clamp_max_slip", () => {
    it("leaves the output alone when the robot is already on the target", () => {
        const out = clamp_max_slip(6, 24, 24, 0, 24, 24, 0.5);
        expect(Number.isNaN(out)).toBe(false);
        expect(out).toBe(6);
    });

    it("still clamps on a normal arc", () => {
        const out = clamp_max_slip(12, 0, 0, 0, 10, 10, 0.5);
        expect(Number.isFinite(out)).toBe(true);
        expect(Math.abs(out)).toBeLessThan(12);
    });
});

describe("reduce_negative_180_to_180", () => {
    it("wraps a normal angle", () => {
        expect(reduce_negative_180_to_180(270)).toBe(-90);
    });

    it("returns instead of hanging on a non-finite angle", () => {
        expect(reduce_negative_180_to_180(NaN)).toBe(0);
        expect(reduce_negative_180_to_180(Infinity)).toBe(0);
    });
});
