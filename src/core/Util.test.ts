import { describe, it, expect} from "vitest";
import { toInch, toPX } from "./Util";

describe("toPX", () => {
  it("Testing toPX", () => {
    const out = toPX(
      { x: -56, y: 43 },
      { x: -72, y: 72, w: 144, h: 144 },
      { x: 136, y: 175, w: 575, h: 575 }
    );
    expect(out.x).toBeCloseTo(199.9, 1);
    expect(out.y).toBeCloseTo(59.2, 1);
  });

  it("Testing toInch", () => {
    const out = toInch(
      { x: 111.8, y: -123.8},
      { x: -72, y: 72, w: 144, h: 144 },
      { x: 0, y: 0, w: 575, h: 575 }
    );
    expect(out.x).toBeCloseTo(-44, 1)
    expect(out.y).toBeCloseTo(41, 1)
  });
});