import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import PathConfig from "./components/PathMenu/PathConfig";
import PathSimulator from "./components/PathSimulator";
import ControlConfig from "./components/ControlConfig";
import Config from "./components/Config/Config";
import useLocalStorageSync from "./hooks/useLocalStorageSync";
import { clamp } from "./core/Util";
import Field from "./components/Field/Field";
import { useFileOpenSync } from "./hooks/useFileOpenSync";

export default function App() {
  useLocalStorageSync();
  useFileOpenSync();

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const compute = () => {
      const prev = content.style.transform;
      content.style.transform = "scale(1)";
      content.style.transformOrigin = "top left";

      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;

      const cw = content.scrollWidth;
      const ch = content.scrollHeight;

      content.style.transform = prev;

      if (cw <= 0 || ch <= 0) return;

      const padding = 16;
      const s = Math.min((vw - padding) / cw, (vh - padding) / ch);

      setScale(clamp(s, 1, 1.5));
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(viewport);
    ro.observe(content);

    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  return (
    <div ref={viewportRef} className="w-screen h-screen">
      <div
        ref={contentRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        className="inline-flex w-max h-max origin-top-left"
      >
        <div className="flex flex-col gap-[10px] ml-[10px] pl-[10px] pt-[10px]">
          <Config />
          <Field />
          <PathSimulator />
        </div>

        <div className="flex flex-col gap-[10px] pt-[10px] pl-[10px]">
          <PathConfig />
          <ControlConfig />
        </div>
      </div>
    </div>
  );
}
