import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { clamp, trimZeros } from "../../core/Util";

type NumberInputProps = {
  fontSize: number;
  width: number;
  height: number;
  value: number | null;
  units?: string;
  setValue: (value: number | null) => void;
  addToHistory?: (value: number) => void;
  bounds: [number, number];
  stepSize: number;
  roundTo: number;
};

type Direction = -1 | 1;

export default function NumberInput({
  fontSize,
  width,
  height,
  value,
  setValue,
  addToHistory,
  bounds,
  units = "",
  stepSize = 1,
  roundTo = 2,
}: NumberInputProps) {
  const [edit, setEdit] = useState<string | null>(null);
  const displayRef = useRef("");
  const [isHovering, setIsHovering] = useState(false);

  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelW, setLabelW] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  displayRef.current = edit !== null ? edit : displayRef.current;

  const resetValue = () => {
    const val: number | null = value;
    const num = val === null ? "" : trimZeros(val.toFixed(roundTo));
    displayRef.current = num;
    setEdit(num);
  };

  useEffect(() => {
    resetValue();
  }, [value]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevClampedNum = useRef<number | null>(value);

  const addToHistoryCheck = (value: number | null ) => {
    if (prevClampedNum.current !== value && value !== null) {
      addToHistory?.(value);
    }
    prevClampedNum.current = value;
  }

  const stepInput = useCallback((stepDirection: Direction) => {
      if (value === null) return;

      const next =
      stepDirection === 1 ? value + stepSize : value - stepSize;
      
      const clamped = clamp(next, bounds[0], bounds[1]);
      if (clamped === undefined) return;
      
      setValue(clamped);

      if (timerRef.current) clearTimeout(timerRef.current);
  
      timerRef.current = setTimeout(() => {
        addToHistoryCheck(clamped);
      }, 400);

    },    
    [value, stepSize, bounds, setValue]
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isHovering) return;

      if (e.cancelable) e.preventDefault();
      e.stopPropagation();

      if (e.deltaY < 0) stepInput(1);
      else if (e.deltaY > 0) stepInput(-1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isHovering, stepInput]);

  const executeValue = () => {
    if (edit === null) return;

    if (edit === "") {
      setValue(null);
      return;
    }

    if (!isFinite(Number(edit))) {
      resetValue();
      return;
    }

    const num = parseFloat(edit);
    const clampNum = clamp(num, bounds[0], bounds[1]);
    if (clampNum === undefined) return;

    setValue(clampNum);
    addToHistoryCheck(clampNum);

    displayRef.current = trimZeros(clampNum.toFixed(roundTo));
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setEdit(evt.target.value);
  };

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === "Enter") {
      executeValue();
      evt.currentTarget.blur();
    }
    if (evt.key === "ArrowUp") stepInput(1);
    if (evt.key === "ArrowDown") stepInput(-1);
  };

  const handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    executeValue();
    evt.currentTarget.blur();
  };

  const stroke = 2;
  const radius = 6;

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;

    const update = () => setLabelW(el.getBoundingClientRect().width);

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [units]);

  const notchWidth = units !== "" ? labelW + 2  : 0;
  const notchRight = 6;

  function buildNotchedRoundedRectPath(W: number, H: number) {
    const sw = stroke;
    const ox = sw / 2;
    const oy = sw / 2;

    const w = Math.max(0, W - sw);
    const h = Math.max(0, H - sw);

    const r = Math.min(radius, w / 2, h / 2);

    const left = ox;
    const top = oy;
    const right = ox + w;
    const bottom = oy + h;

    let gapEnd = w - notchRight;
    let gapStart = gapEnd - notchWidth;

    const minX = r;
    const maxX = w - r;
    gapStart = Math.max(minX, Math.min(gapStart, maxX));
    gapEnd = Math.max(minX, Math.min(gapEnd, maxX));

    return [
      `M ${left + gapEnd} ${top}`,
      `L ${right - r} ${top}`,
      `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
      `L ${right} ${bottom - r}`,
      `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
      `L ${left + r} ${bottom}`,
      `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
      `L ${left} ${top + r}`,
      `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
      `L ${left + gapStart} ${top}`,
    ].join(" ");
  }

  return (
    <div className="relative inline-block group">
      <input
        ref={inputRef}
        className="bg-blackgray rounded-lg text-center text-white outline-none"
        style={{ fontSize: `${fontSize}px`, width: `${width}px`, height: `${height}px` }}
        type="text"
        value={displayRef.current}
        onChange={handleChange}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false)
          executeValue();
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <path
          d={buildNotchedRoundedRectPath(width, height)}
          fill="none"
          className="stroke-lightgray"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span
        ref={labelRef}
        className="
          text-[10px] pointer-events-none select-none
          absolute -top-1 right-4
          translate-x-2 -translate-y-1/3
          text-lightgray leading-none
          px-1 py-0.5 z-10
        "
      >
        {units}
      </span>
    </div>
  );
}
