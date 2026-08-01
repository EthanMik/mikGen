import { describe, it, expect } from "vitest";
import { clamp_max_slip, overturn_scaling, reduce_negative_180_to_180 } from "./Util";

describe("overturn_scaling", () => {
    it("leaves an output that fits inside the max alone", () => {
        expect(overturn_scaling(4, 3, 8)).toBe(4);
        expect(overturn_scaling(-4, 3, 8)).toBe(-4);
    });

    it("cuts the drive by whatever the pair draws past the max", () => {
        expect(overturn_scaling(6, 4, 8)).toBe(4);
        expect(overturn_scaling(-6, 4, 8)).toBe(-4);
    });

    it("stops the cut at zero rather than reversing the drive", () => {
        // A turn on its own past the max, which used to leave a negative remainder and send the
        // robot away from its target while it was still turning towards it
        expect(overturn_scaling(4, 10, 8)).toBe(0);
        expect(overturn_scaling(-4, 10, 8)).toBe(0);
    });
});

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
