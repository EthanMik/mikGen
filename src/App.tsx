import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { viewModeStore } from "./hooks/useViewMode";
import "./App.css";
import PathConfig from "./components/PathMenu/PathConfig";
import PathSimulator from "./components/PathSimulator";
import ControlConfig from "./components/ControlConfig";
import Config from "./components/Config/Config";
import { clamp, CONFIG_W, FIELD_IMG_DIMENSIONS } from "./core/Util";
import Field from "./components/Field/Field";
import { ScaleContext } from "./contexts/ScaleContext";
import { fileFormatStore } from "./hooks/useFileFormat";
import { useFieldImg } from "./hooks/useFieldImg";
import { invalidateSvgCtm } from "./components/Field/FieldUtils";
import HoverButton from "./components/Util/HoverButton";
import threeDots from "./assets/three-dots.svg";
import lines from "./assets/lines.svg";
import marker from "./assets/marker.svg";
import homeButton from "./assets/home.svg";

// Everything on screen sits on one 8px grid: the window edges, the gaps between the
// config panel, field, simulator and the right hand panels
const EDGE = 8;
// button size plus a gap on both sides, so the floating popout buttons stack on the same grid
const BUTTON_STEP = 33 + EDGE;
// Below this width the side panels never fit next to the field, so the layout collapses no matter
// which view mode is selected
const MOBILE_W = 700;
// A viewport smaller than this on either axis cannot show the field at a comfortable scale, so the
// floor gives way rather than letting the content overflow and get clipped. Height matters on its
// own: a phone held in landscape is wide but far too short for the normal floor.
const MOBILE_H = 600;
// Only the collapsed layout holds this floor, because there the field widens into a pannable canvas
// instead of being cut off. With the panels up there is nothing to pan, so the fit wins outright
const MIN_SCALE = 0.75;
const MIN_SCALE_MOBILE = 0.25;
// Natural width of the popout panels, used to shrink them onto a narrow screen
const POPOUT_W = 500;

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

  // Selecting the boolean instead of the rectangle keeps a pan or zoom from re-rendering the
  // whole app (Config, PathConfig and its rows, ControlConfig, PathSimulator) on every frame
  const isFieldPanned = useFieldImg.useSelector(
    img => img.x !== 0 || img.y !== 0 || img.w !== FIELD_IMG_DIMENSIONS.w || img.h !== FIELD_IMG_DIMENSIONS.h
  );

  const [scale, setScale] = useState(1);
  const [popoutScale, setPopoutScale] = useState(0.85);
  const [showConfig, setShowConfig] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(FIELD_IMG_DIMENSIONS.w);
  const fullyCollapsed = !showConfig && !showRightPanel;
  const [configPopout, setConfigPopout] = useState(false);
  const [pathConfigPopout, setPathConfigPopout] = useState(false);
  const [controlConfigPopout, setControlConfigPopout] = useState(false);
  const computeRef = useRef<() => void>(() => {});

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
      // Anything that resizes or rescales the layout moves the field svg on screen
      invalidateSvgCtm();
      const mode = viewModeStore.getState();
      const prev = content.style.transform;
      content.style.transform = "scale(1)";

      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;

      const fw = fieldRef.current?.scrollWidth ?? 0;
      const rw = rightPanelRef.current?.scrollWidth ?? 0;
      if (fw > 0) cachedFieldW.current = fw;
      if (rw > 0) cachedRightW.current = rw;

      // A phone cannot fit the side panels at any scale worth reading, so the collapsed layout wins
      // over an explicitly chosen view mode rather than letting "standard" push them back on screen
      const forceCollapse = vw < MOBILE_W;

      const autoConfig = vw - EDGE * 2 > cachedFieldW.current + cachedRightW.current;
      const autoRight = vw - EDGE * 2 > cachedFieldW.current + 250;
      const nextShowConfig = forceCollapse ? false : mode === "standard" ? true : (mode === "collapsed-config" || mode === "fully-collapsed" ? false : autoConfig);
      const nextShowRight = forceCollapse ? false : mode === "standard" ? true : (mode === "collapsed-list" || mode === "fully-collapsed" ? false : autoRight);
      setShowConfig(nextShowConfig);
      setShowRightPanel(nextShowRight);

      // The popouts are POPOUT_W wide and hang off the right edge, so on a narrow screen they have
      // to shrink past the desktop 0.85 or they run off the side
      setPopoutScale(Math.min(0.85, (vw - EDGE * 2 - BUTTON_STEP) / POPOUT_W));

      const cw = content.scrollWidth;
      const ch = content.scrollHeight;

      content.style.transform = prev;

      if (cw <= 0 || ch <= 0) return;

      const padding = EDGE * 2;
      const fullyCollapsedNext = !nextShowConfig && !nextShowRight;

      if (fullyCollapsedNext) {
        // Fit against the field's natural width rather than the measured cw: cw grows with
        // canvasWidth, which this branch sets, so measuring it here would feed back on itself
        const baseW = FIELD_IMG_DIMENSIONS.w;
        const minScale = vw < MOBILE_W || vh < MOBILE_H ? MIN_SCALE_MOBILE : MIN_SCALE;
        const s = clamp(Math.min((vw - padding) / baseW, (vh - padding) / ch), minScale, 2);
        setScale(s);
        // Widening the svg past the field image gives extra room to pan into; narrowing it past
        // the image would crop the field instead of shrinking it, which is what breaks on a phone
        setCanvasWidth(Math.max(baseW, Math.round(vw / s)));
      } else {
        const totalCw = (nextShowConfig ? CONFIG_W + EDGE : 0) + cw;
        const fit = Math.min((vw - padding) / totalCw, (vh - padding) / ch);
        // Nothing pans or reflows here, so a scale above the fit is content hanging off the
        // window rather than content at a comfortable size: a window that needs less than
        // MIN_SCALE has no room for the panels at MIN_SCALE either. The floor gives way to the
        // fit instead of clipping, and only the mobile floor is left to stop it reaching zero
        setScale(clamp(fit, MIN_SCALE_MOBILE, 2));
        setCanvasWidth(FIELD_IMG_DIMENSIONS.w);
      }
    };

    computeRef.current = compute;
    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(viewport);
    ro.observe(content);

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", invalidateSvgCtm, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", invalidateSvgCtm, true);
    };
  }, []);

  useEffect(() => {
    return viewModeStore.subscribe(() => computeRef.current());
  }, []);

  return (
    <ScaleContext.Provider value={scale}>
      <div ref={viewportRef} className={`w-screen h-dvh overflow-hidden${fullyCollapsed ? " flex items-center justify-center" : ""}`}>

        <HoverButton
          src={threeDots}
          onClick={() => setConfigPopout(v => !v)}
          className={`fixed top-2 left-2 z-50 w-[33px] h-[33px]${showConfig ? " hidden" : ""}`}
          imgClassName="w-5 h-5"
        />
        <div
          className="fixed flex flex-col"
          style={
            !showConfig && !configPopout
              ? { display: "none" }
              : showConfig
              ? { top: `${EDGE}px`, left: `${EDGE}px`, transform: `scale(${scale})`, transformOrigin: "top left", zIndex: 10 }
              : { top: `${EDGE + BUTTON_STEP}px`, left: `${EDGE}px`, transform: "scale(0.85)", transformOrigin: "top left", height: `calc((100dvh - ${EDGE * 2 + BUTTON_STEP}px) / 0.85)`, zIndex: 50 }
          }
        >
          <Config fillHeight={!showConfig} />
        </div>

        {!showRightPanel && (
          <>
            <HoverButton
              src={lines}
              onClick={() => setPathConfigPopout(v => !v)}
              className="fixed top-2 right-2 z-50 w-[33px] h-[33px]"
              imgClassName="w-5 h-5"
            />
            <HoverButton
              src={marker}
              onClick={() => setControlConfigPopout(v => !v)}
              className="fixed right-2 z-50 w-[33px] h-[33px]"
              style={{ top: `${EDGE + BUTTON_STEP}px` }}
              imgClassName="w-5 h-5"
            />
            {isFieldPanned && (
              <HoverButton
                src={homeButton}
                onClick={() => useFieldImg.setState(FIELD_IMG_DIMENSIONS)}
                className="fixed right-2 z-50 w-[33px] h-[33px]"
                style={{ top: `${EDGE + BUTTON_STEP * 2}px` }}
                imgClassName="w-5 h-5"
              />
            )}
            <div
              className="fixed right-2 z-50 flex flex-col gap-2"
              style={{ top: `${EDGE + BUTTON_STEP * (isFieldPanned ? 3 : 2)}px`, transform: `scale(${popoutScale})`, transformOrigin: "top right" }}
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
          style={{ transform: `scale(${scale})`, transformOrigin: fullyCollapsed ? "center" : "top left", marginLeft: fullyCollapsed ? undefined : showConfig ? `${EDGE + (CONFIG_W + EDGE) * scale}px` : `${EDGE}px`, marginTop: fullyCollapsed ? undefined : `${EDGE}px` }}
          className="inline-flex w-max h-max"
        >
          <div className="inline-flex">
            <div ref={fieldRef} className={`flex flex-col gap-2${fullyCollapsed ? " items-center" : ""}`}>
              <Field showRightPanel={showRightPanel} canvasWidth={canvasWidth} />
              <PathSimulator />
            </div>
            {showRightPanel && (
              <div ref={rightPanelRef} className="flex flex-col gap-2 pl-2">
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
