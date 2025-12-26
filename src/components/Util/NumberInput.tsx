import { useEffect, useRef, useState } from "react";
import { clamp } from "../../core/Util";

type NumberInputProps = {
    fontSize: number;
    width: number,
    height: number,
    value: number | null,
    setValue: (value: number | null) => void,
    bounds: [number, number],
    stepSize: number,
    roundTo: number,
}

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
    const [ edit, setEdit ] = useState<string | null>(null);
    const displayRef = useRef("");
    const [ isHovering, setIsHovering ] = useState(false);

    displayRef.current = edit !== null ? edit : displayRef.current;
    
    const resetValue = () => {    
        const val: number | null = value
        const num = val === null ? "" : trimZeros(val.toFixed(roundTo)); 
        displayRef.current = num;

        setEdit(num);
    }

    useEffect(() => {
        resetValue();

    }, [value])

    const trimZeros = (s: string) => s.replace(/\.0+$/u, "").replace(/(\.\d*?[1-9])0+$/u, "$1");

    const executeValue = () => {
        if (edit === null) return;
        console.log("edit is:", edit, ":");
        if (edit === "") {
            setValue(null);
            return;
        }

        if (!isFinite(Number(edit))) {
            resetValue();
            return;
        }
        const num: number = parseFloat(edit);
        
        displayRef.current = trimZeros(num.toFixed(roundTo));

        const clampNum = clamp(num, bounds[0], bounds[1])
        if (clampNum === undefined) return;
        setValue(clampNum);

        displayRef.current = trimZeros(clampNum.toFixed(roundTo));

    }

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEdit(evt.target.value)
    }

    type Direction = -1 | 1;

    const stepInput = (stepDirection: Direction) => {
        if (value === null) return;
        switch (stepDirection) {
            case 1:
                if (value + stepSize > bounds[1]) {
                    setValue(bounds[1]);
                } else {
                    setValue(value + stepSize);
                }
                return;
            case -1: 
                if (value - stepSize < bounds[0]) {
                    setValue(bounds[0]);
                } else {
                    setValue(value - stepSize);
                }
                return;
        }
    }

    const handleWheel = (evt: React.WheelEvent<HTMLInputElement>) => {
        if (!isHovering) return;

        evt.preventDefault();

        if (evt.deltaY < 0) stepInput(1);
        else if (evt.deltaY > 0) stepInput(-1);
    };

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {        
        if (evt.key === "Enter") {
            executeValue()
            evt.currentTarget.blur();
        }

        if (evt.key === "ArrowUp") stepInput(1);
        if (evt.key === "ArrowDown") stepInput(-1);
    }

    const handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        executeValue()
        evt.currentTarget.blur();
    }

    return (
        <input 
            className="bg-blackgray w-[80px] h-[40px]
            outline-2 outline-transparent rounded-lg text-center text-white
            hover:outline-lightgray
            "
            
            style={{
                fontSize: `${fontSize}px`,
                width: `${width}px`,
                height: `${height}px`
            }}
            type="text"
            value={ displayRef.current }

            onChange={handleChange}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    );
}
