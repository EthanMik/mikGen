import { useEffect, useState } from "react";
import { useSegment } from "../hooks/useSegment";
import flipHorizontal from "../assets/flip-horizontal.svg";
import flipVertical from "../assets/flip-vertical.svg";
import { normalizeDeg } from "../core/Util";

type ControlInputProps = {
    getValue?: () => number | undefined;
    updateValue?: (value: number) => void;
    clampTo?: (value: number) => number;
}

function ControlInput({
    getValue,
    updateValue,
    clampTo,
}: ControlInputProps) {
    const { segment } = useSegment();

    const [ value, SetValue ] = useState<number>(0);
    const [ edit, setEdit ] = useState<string | null>(null);

    const display: string = edit !== null ? edit : value.toFixed(2);

    const resetValue = () => {
        const val: number | undefined = getValue?.();
        const num = val === undefined ? "" : val.toFixed(2); 

        setEdit(num);
    }

    useEffect(() => {
        resetValue();

    }, [segment.controls])

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEdit(evt.target.value)
    }

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (edit === null) return;
        
        if (evt.key === "Enter" || evt.key == "Tab") {
            const num: number = parseFloat(edit);
            if (!Number.isFinite(num)) return;

            const selectedControls = segment.controls.filter(c => c.selected);
            if (selectedControls.length > 1) {
                resetValue();
                return;

            } 

            const clampNum = clampTo?.(num);
            if (clampNum === undefined) return;
            updateValue?.(clampNum);

            SetValue(num);

            evt.currentTarget.blur();
        }
    }

    const cancel = () => {
        resetValue();
    }

    const handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        cancel();
        evt.currentTarget.blur();
    }

    return (
        <input 
            className="bg-blackgray w-[80px] h-[40px]
            outline-2 outline-transparent rounded-lg text-center text-white
            hover:outline-lightgray
            "
            
            style={{fontSize: '18px'}}
            type="text"
            value={ display }

            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    );
}

type MirrorDirection = "x" | "y";

type MirrorControlProps = {
    src: string
    mirrorDirection: MirrorDirection
}

function MirrorControl({
    src,
    mirrorDirection
}: MirrorControlProps) {
    const { setSegment } = useSegment(); 

    const mirrorX = () => {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.selected
                ? { ...control, heading: normalizeDeg(360 - control.heading), position: { ...control.position, x: -control.position.x, }, }
                : control
            ),
        }));
    }

    const mirrorY = () => {
        setSegment(prev => ({
            ...prev,
            controls: prev.controls.map(control =>
                control.selected
                ? { ...control, heading: normalizeDeg(180 - control.heading), position: { ...control.position, y: -control.position.y, }, }
                : control
            ),
        }));
    }

    const handleOnClick = () => {
        if (mirrorDirection === "x") {
            mirrorX();
        } else if (mirrorDirection === "y") {
            mirrorY();
        }
    }

    return (
        <button 
            className="flex items-center justify-center w-[40px] h-[40px] 
            rounded-lg bg-transparent hover:bg-medgray_hover border-none outline-none fill-white"
            onClick={handleOnClick}>
            <img 
                className="fill-white w-[30px] h-[30px]"
                src={src}   
            />
        </button>
    );
}

export default function ControlConfig() {
    const { segment, setSegment } = useSegment();

    const clampToField = (value: number) => {
        return Math.min(Math.max(value, -100), 100);
    }

    const getXValue = () => {
        const x: number | undefined = segment.controls.find(c => c.selected)?.position.x;
        return x
    }

    const getYValue = () => {
        const y: number | undefined = segment.controls.find(c => c.selected)?.position.y;
        return y
    }

    const getHeadingValue = () => {
        const heading: number | undefined = segment.controls.find(c => c.selected)?.heading;
        return heading;
    }

    const updateXValue = (newX: number) => {
        setSegment(prev => ({
                    ...prev,
                    controls: prev.controls.map(control =>
                        control.selected
                        ? { ...control, position: { ...control.position, x: newX, }, }
                        : control
                    ),
                }));
    }

    const updateYValue = (newY: number) => {
        setSegment(prev => ({
                    ...prev,
                    controls: prev.controls.map(control =>
                        control.selected
                        ? { ...control, position: { ...control.position, y: newY, }, }
                        : control
                    ),
                }));
    }

    const updateHeadingValue = (newHeading: number) => {
        setSegment(prev => ({
                    ...prev,
                    controls: prev.controls.map(control =>
                        control.selected
                        ? { ...control, heading: newHeading, }
                        : control
                    ),
                }));
    }
    
    return (
        <div className="flex flex-row items-center justify-center gap-[10px] bg-medgray w-[500px] h-[65px] rounded-lg">
            <span style={{ fontSize: 20 }}>X:</span>
            <ControlInput updateValue={updateXValue} getValue={getXValue} clampTo={clampToField}/>
            <span style={{ fontSize: 20 }}>Y:</span>
            <ControlInput updateValue={updateYValue} getValue={getYValue} clampTo={clampToField}/>
            <span style={{ fontSize: 20 }}>θ:</span>
            <div className="flex items-center flex-row gap-[15px]">
                <ControlInput updateValue={updateHeadingValue} getValue={getHeadingValue} clampTo={normalizeDeg}/>
                <MirrorControl mirrorDirection="x" src={flipHorizontal}/>
                <MirrorControl mirrorDirection="y" src={flipVertical}/>
            </div>
        </div>
    );
}