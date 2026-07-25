import { describe, it, expect } from "vitest";
import { getCurvature } from "./Util";
import { LemPose } from "./Pose";

describe("getCurvature", () => {
    it("reports no curvature when the pose and carrot coincide", () => {
        const out = getCurvature(new LemPose(10, 10, 0.5), new LemPose(10, 10, 0.5));
        expect(Number.isNaN(out)).toBe(false);
        expect(out).toBe(0);
    });

    it("still returns a finite curvature for a real arc", () => {
        const out = getCurvature(new LemPose(0, 0, 0), new LemPose(10, 10, 0));
        expect(Number.isFinite(out)).toBe(true);
        expect(out).not.toBe(0);
    });
});
