import { useRef, useState, useLayoutEffect } from "react";

type TextInputProps = {
  fontSize: number;
  unitsFontSize: number;

  width: number;
  height: number;
  value: string;
  setValue: (value: string) => void;
  units?: string;
  focus?: boolean;
  setText?: (text: string) => void;
};

export default function TextInput({
  fontSize,
  unitsFontSize,
  width,
  height,
  value,
  focus,
  setValue,
  setText,
  units = "",
}: TextInputProps) {
  const [edit, setEdit] = useState<string>(value);
  const displayRef = useRef("");

  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelW, setLabelW] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  if (focus && inputRef.current !== null) {
    inputRef.current?.focus();
    focus = false;
  }

  displayRef.current = edit !== null ? edit : displayRef.current;
  setText?.(edit);

  const executeValue = () => {
    if (edit === null) return;

    setValue(edit);
    displayRef.current = edit;
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setText?.(evt.target.value);
    setEdit(evt.target.value);
  };

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === "Enter") {
      executeValue();
      evt.currentTarget.blur();
    }
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
        onKeyDown={handleKeyDown}
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
        style={ { fontSize: `${unitsFontSize}px `}}
        className={`
            pointer-events-none select-none
            absolute -top-1 right-4
            translate-x-2 -translate-y-1/3
            text-lightgray leading-none
            px-1 py-0.5 z-10
        `}
      >
        {units}
      </span>
    </div>
  );
}
