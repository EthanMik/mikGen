import { useEffect, useRef, useState } from "react";
import { clamp } from "../../core/Util";

type ControlInputProps = {
    fontSize: number;
    width: number,
    height: number,
    value: number | null,
    setValue: (value: number | null) => void;
    bounds: [number, number]
}

export default function NumberInput({
    fontSize,
    width,
    height,
    value,
    setValue,
    bounds,
}: ControlInputProps) {
    const [ edit, setEdit ] = useState<string | null>(null);
    const displayRef = useRef("");

    displayRef.current = edit !== null ? edit : displayRef.current;
    
    const resetValue = () => {    
        const val: number | null = value
        const num = val === null ? "" : trimZeros(val.toFixed(2)); 
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
        
        displayRef.current = trimZeros(num.toFixed(2));

        const clampNum = clamp(num, bounds[0], bounds[1])
        if (clampNum === undefined) return;
        setValue(clampNum);

        displayRef.current = trimZeros(clampNum.toFixed(2));

    }

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEdit(evt.target.value)
    }

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {        
        if (evt.key === "Enter") {
            executeValue()
            evt.currentTarget.blur();
        }
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
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    );
}
