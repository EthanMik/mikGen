import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import PathConfig from "./components/PathMenu/PathConfig";
import PathSimulator from "./components/PathSimulator";
import ControlConfig from "./components/ControlConfig";
import Config from "./components/Config/Config";
import { clamp, FIELD_IMG_DIMENSIONS } from "./core/Util";
import Field from "./components/Field/Field";
import { ScaleContext } from "./contexts/ScaleContext";
import { fileFormatStore } from "./hooks/useFileFormat";
import { useFieldImg } from "./hooks/useFieldImg";
import HoverButton from "./components/util/HoverButton";
import threeDots from "./assets/three-dots.svg";
import lines from "./assets/lines.svg";
import marker from "./assets/marker.svg";
import homeButton from "./assets/home.svg";

export default function App() {
  const pathName = fileFormatStore.useSelector(s => s.path.name);

  useEffect(() => {
    document.title = pathName || "mikGen";
  }, [pathName]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const cachedFieldW = useRef(0);
  const cachedRightW = useRef(0);

  const [img, setImg] = useFieldImg();
  const isFieldPanned = img.x !== 0 || img.y !== 0 || img.w !== FIELD_IMG_DIMENSIONS.w || img.h !== FIELD_IMG_DIMENSIONS.h;

  const [scale, setScale] = useState(1);
  const [showConfig, setShowConfig] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [configPopout, setConfigPopout] = useState(false);
  const [pathConfigPopout, setPathConfigPopout] = useState(false);
  const [controlConfigPopout, setControlConfigPopout] = useState(false);

  useEffect(() => {
    if (showConfig) setConfigPopout(false);
  }, [showConfig]);

  useEffect(() => {
    if (showRightPanel) { setPathConfigPopout(false); setControlConfigPopout(false); }
  }, [showRightPanel]);

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

      const fw = fieldRef.current?.scrollWidth ?? 0;
      const rw = rightPanelRef.current?.scrollWidth ?? 0;
      if (fw > 0) cachedFieldW.current = fw;
      if (rw > 0) cachedRightW.current = rw;

      setShowConfig(vw - 16 > cachedFieldW.current + cachedRightW.current);
      setShowRightPanel(vw - 16 > cachedFieldW.current + 250);

      const cw = content.scrollWidth;
      const ch = content.scrollHeight;

      content.style.transform = prev;

      if (cw <= 0 || ch <= 0) return;

      const padding = 16;
      const s = Math.min((vw - padding) / cw, (vh - padding) / ch);

      setScale(clamp(s, 0.75, 2));
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
    <ScaleContext.Provider value={scale}>
      <div ref={viewportRef} className="w-screen h-screen overflow-hidden">

        {!showConfig && (
          <HoverButton
            src={threeDots}
            onClick={() => setConfigPopout(v => !v)}
            className="fixed top-[10px] left-[10px] z-50 w-[33px] h-[33px]"
            imgClassName="w-5 h-5"
          />
        )}
        {!showConfig && (
          <div
            className={`fixed top-[52px] left-[10px] z-50 flex flex-col ${configPopout ? "" : "hidden"}`}
            style={{ transform: "scale(0.85)", transformOrigin: "top left", height: "calc((100vh - 62px) / 0.85)" }}
          >
            <Config fillHeight />
          </div>
        )}

        {!showRightPanel && (
          <>
            <HoverButton
              src={lines}
              onClick={() => setPathConfigPopout(v => !v)}
              className="fixed top-[10px] right-[10px] z-50 w-[33px] h-[33px]"
              imgClassName="w-5 h-5"
            />
            <HoverButton
              src={marker}
              onClick={() => setControlConfigPopout(v => !v)}
              className="fixed top-[50px] right-[10px] z-50 w-[33px] h-[33px]"
              imgClassName="w-5 h-5"
            />
            {isFieldPanned && (
              <HoverButton
                src={homeButton}
                onClick={() => setImg(FIELD_IMG_DIMENSIONS)}
                className="fixed top-[90px] right-[10px] z-50 w-[33px] h-[33px]"
                imgClassName="w-5 h-5"
              />
            )}
            <div
              className="fixed right-[10px] z-50 flex flex-col gap-2"
              style={{ top: isFieldPanned ? "130px" : "97px", transform: "scale(0.85)", transformOrigin: "top right" }}
            >
              <div className={pathConfigPopout ? "" : "hidden"}>
                <PathConfig />
              </div>
              <div className={controlConfigPopout ? "" : "hidden"}>
                <ControlConfig />
              </div>
            </div>
          </>
        )}

        <div
          ref={contentRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
          className="inline-flex w-max h-max origin-top-left"
        >
          {showConfig && (
            <div className="pt-[10px] ml-[10px]">
              <Config />
            </div>
          )}

          <div className="inline-flex">
            <div ref={fieldRef} className="flex flex-col gap-[10px] ml-[4px] pt-[10px]">
              <Field showRightPanel={showRightPanel} />
              <PathSimulator />
            </div>

            {showRightPanel && (
              <div ref={rightPanelRef} className="flex flex-col gap-[10px] pt-[10px] pl-[10px]">
                <PathConfig />
                <ControlConfig />
              </div>
            )}
          </div>
        </div>
      </div>
    </ScaleContext.Provider>
  );
}
