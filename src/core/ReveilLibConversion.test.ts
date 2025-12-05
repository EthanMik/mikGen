import { describe, it} from "vitest";
import { convertPath } from "./PathConversion";
import { Control, type Segment } from "./Path";
import { ReveilLibPathFormat } from "../formats/ReveilLibPathFormat";

describe.only("convertPath", () => {
  it("Testing convertPath", () => {
    const segment = new Control({x: 10, y: 20}, 10);
    const path: Segment = {controls: [segment]}

    const format = new ReveilLibPathFormat();
    const out = convertPath(path, format);

    console.log(out);
  });

});