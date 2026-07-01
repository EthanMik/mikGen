import { describe, expect, it } from "vitest";
import { getCurvature, toLemPose } from "./LemLibSim/Util";
import type { LemPose } from "./LemLibSim/Pose";
import { clamp_max_slip } from "./mikLibSim/Util";

describe("maxSlip", () => {
  it("Testing getCurvature", () => {
    const x0 = 15;
    const y0 = 15;
    const theta = 90;

    const xf = 24;
    const yf = 24;

    const drift = 2;

    const pose: LemPose = toLemPose({
        x: x0, y: y0, angle: theta
    }, true, true);

    const carrot: LemPose = toLemPose({
        x: xf, y: yf, angle: null
    }, true, true);

    const radius = 1 / Math.abs(getCurvature(pose, carrot));
    const maxSlipSpeed = Math.sqrt(drift * radius * 9.8);

    const out = clamp_max_slip(0, x0, x0, theta, xf, yf, drift);

    console.log(maxSlipSpeed, "slip")
    console.log(out, "out")

    expect(maxSlipSpeed).toBeCloseTo(out)
  });

});