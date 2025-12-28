import { useEffect, useRef, useState, useCallback } from "react";
import { clamp, trimZeros } from "../../core/Util";

type NumberInputProps = {
  fontSize: number;
  width: number;
  height: number;
  value: number | null;
  setValue: (value: number | null) => void;
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
  bounds,
  stepSize = 1,
  roundTo = 2,
}: NumberInputProps) {
  const [edit, setEdit] = useState<string | null>(null);
  const displayRef = useRef("");
  const [isHovering, setIsHovering] = useState(false);

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

  const stepInput = useCallback((stepDirection: Direction) => {
      if (value === null) return;

      const next =
        stepDirection === 1 ? value + stepSize : value - stepSize;

      const clamped = clamp(next, bounds[0], bounds[1]);
      if (clamped === undefined) return;

      setValue(clamped);
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

  return (
    <input
      ref={inputRef}
      className="bg-blackgray w-[80px] h-[40px]
        outline-2 outline-transparent rounded-lg text-center text-white
        hover:outline-lightgray"
      style={{
        fontSize: `${fontSize}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      type="text"
      value={displayRef.current}
      onChange={handleChange}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}
