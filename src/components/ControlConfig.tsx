import { useEffect, useState } from "react";
import flipHorizontal from "../assets/flip-horizontal.svg";
import flipVertical from "../assets/flip-vertical.svg";
import { normalizeDeg } from "../core/Util";
import { usePath } from "../hooks/usePath";

type ControlInputProps = {
    getValue?: () => number | null | undefined;
    updateValue?: (value: number) => void;
    clampTo?: (value: number) => number;
}

function ControlInput({
    getValue,
    updateValue,
    clampTo,
}: ControlInputProps) {
    const [ path, setPath ] = usePath();

    const [ value, SetValue ] = useState<number>(0);
    const [ edit, setEdit ] = useState<string | null>(null);

    const display: string = edit !== null ? edit : value.toFixed(2);

    const resetValue = () => {
        const val: number | null | undefined = getValue?.();
        const num = val === undefined || val === null ? "" : val.toFixed(2); 

        setEdit(num);
    }

    useEffect(() => {
        resetValue();

    }, [path.segments])

    const executeValue = () => {
        if (edit === null) return;

        const num: number = parseFloat(edit);
        if (!Number.isFinite(num)) return;

        const selectedControls = path.segments.filter(c => c.selected);
        if (selectedControls.length > 1) {
            resetValue();
            return;

        } 

        const clampNum = clampTo?.(num);
        if (clampNum === undefined) return;
        updateValue?.(clampNum);

        SetValue(num);

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
    const [ path, setPath ] = usePath();

    const mirrorX = () => {
        setPath(prev => ({
            ...prev,
            controls: prev.segments.map(control =>
                control.selected
                ? { ...control, pose: { angle: normalizeDeg(360 - control.pose.angle), x: -control.pose.x }, }
                : control
            ),
        }));
    }

    const mirrorY = () => {
        setPath(prev => ({
            ...prev,
            controls: prev.segments.map(control =>
                control.selected
                ? { ...control, pose: { angle: normalizeDeg(180 - control.pose.angle), y: -control.pose.y }, }
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
            className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer 
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
    const [ path, setPath ] = usePath(); 

    const clampToField = (value: number) => {
        return Math.min(Math.max(value, -100), 100);
    }

    const getXValue = () => {
        const x: number | null | undefined = path.segments.find(c => c.selected)?.pose.x;
        if (x === null) return null;
        return x
    }

    const getYValue = () => {
        const y: number | null | undefined = path.segments.find(c => c.selected)?.pose.y;
        if (y === null) return null;
        return y
    }

    const getHeadingValue = () => {
        const heading: number | null | undefined = path.segments.find(c => c.selected)?.pose.angle;
        if (heading === null) return null;
        return heading;
    }

    const updateXValue = (newX: number) => {
        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, x: newX, }, }
                        : control
                    ),
                }));
    }

    const updateYValue = (newY: number) => {
        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, y: newY, }, }
                        : control
                    ),
                }));
    }

    const updateHeadingValue = (newHeading: number) => {
        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, angle: newHeading, }, }
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