import flipHorizontal from "../assets/flip-horizontal.svg";
import flipVertical from "../assets/flip-vertical.svg";
import { normalizeDeg } from "../core/Util";
import { useFormat } from "../hooks/useFormat";
import { usePath } from "../hooks/usePath";
import NumberInput from "./Util/NumberInput";

type MirrorDirection = "x" | "y";

type MirrorControlProps = {
    src: string
    mirrorDirection: MirrorDirection
}

function MirrorControl({
    src,
    mirrorDirection
}: MirrorControlProps) {
    const [ , setPath ] = usePath();

    const mirrorX = () => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(c =>
                c.selected ? {
                    ...c, pose: {
                        ...c.pose, angle: normalizeDeg(360 - (c.pose.angle ?? 0)),
                        x: -(c.pose.x ?? 0)
                    }
                } : c
            )
        }));
    }

    const mirrorY = () => {
        setPath(prev => ({
            ...prev,
            segments: prev.segments.map(c =>
                c.selected ? {
                    ...c, pose: {
                        ...c.pose, angle: normalizeDeg(180 - (c.pose.angle ?? 0)),
                        y: -(c.pose.y ?? 0)
                    }
                } : c
            )
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
    const [ format ] = useFormat();

    const getXValue = (): number | null => {
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const x: number | null | undefined = path.segments.find(c => c.selected)?.pose.x;
        if (x === null || x === undefined) return null;
        return x
    }

    const getYValue = (): number | null => {
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const y: number | null | undefined = path.segments.find(c => c.selected)?.pose.y;
        if (y === null || y === undefined) return null;
        return y
    }

    const getHeadingValue = (): number | null => {
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return null;
        const heading: number | null | undefined = path.segments.find(c => c.selected)?.pose.angle;
        if (heading === null || heading === undefined) return null;
        return heading;
    }

    const updateXValue = (newX: number | null) => {
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return;

        const selectedSegment = path.segments.find(c => c.selected);
        if (selectedSegment === undefined) return;

        if (selectedSegment.kind === "angleSwing" || 
            selectedSegment.kind === "pointSwing" || 
            selectedSegment.kind === "angleTurn" || 
            selectedSegment.kind === "pointTurn"
        ) return;

        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, x: newX, }, }
                        : control
                    ),
                }));
    }

    const updateYValue = (newY: number | null) => {
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return

        const selectedSegment = path.segments.find(c => c.selected);
        if (selectedSegment === undefined) return;

        if (selectedSegment.kind === "angleSwing" || 
            selectedSegment.kind === "pointSwing" || 
            selectedSegment.kind === "angleTurn" || 
            selectedSegment.kind === "pointTurn"
        ) return;

        setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, pose: { ...control.pose, y: newY, }, }
                        : control
                    ),
                }));
    }

    const updateHeadingValue = (newHeading: number | null) => {
        const selectedCount = path.segments.filter(c => c.selected).length;
        if (selectedCount !== 1) return

        const selectedSegment = path.segments.find(c => c.selected);
        if (selectedSegment === undefined) return;

        if (newHeading === null && selectedSegment.kind !== "poseDrive") return;
        if (newHeading !== null) newHeading = normalizeDeg(newHeading);
        setPath(prev => {
                let kind = selectedSegment.kind;
                if (selectedSegment.kind === "poseDrive" && newHeading === null) {
                    kind = "pointDrive";
                }
                if (selectedSegment.kind === "pointDrive" && newHeading !== null) {
                    kind = "poseDrive";
                }

                return {
                    ...prev,
                    segments: prev.segments.map(control =>
                        control.selected
                        ? { ...control, 
                            pose: { ...control.pose, angle: newHeading, }, 
                            kind: kind
                        }
                        : control
                    ),
                }
            });
    }
    

    return (
        <div className="flex flex-row items-center justify-center gap-4 bg-medgray w-[500px] h-[65px] rounded-lg">
            <div className="flex items-center gap-2">
                <span style={{ fontSize: 20 }}>X</span>
                <NumberInput 
                    width={80}
                    height={40}
                    fontSize={18}
                    setValue={format === "ReveilLib" ? updateYValue : updateXValue } 
                    value={format === "ReveilLib" ? getYValue() : getXValue() } 
                    stepSize={1}
                    roundTo={2}
                    bounds={[-999, 999]}
                    units="in"
                />
            </div>
            <div className="flex items-center gap-2">
                <span style={{ fontSize: 20 }}>Y</span>
                <NumberInput 
                    width={80}
                    height={40}
                    fontSize={18}
                    stepSize={1}
                    roundTo={2}
                    setValue={format === "ReveilLib" ? updateXValue : updateYValue } 
                    value={format === "ReveilLib" ? getXValue() : getYValue() } 
                    bounds={[-999, 999]}
                    units="in"
                />
            </div>
            <div className="flex items-center gap-2">
                <span style={{ fontSize: 20 }}>θ</span>
                <NumberInput 
                    width={80}
                    height={40}
                    fontSize={18}
                    stepSize={5}
                    roundTo={2}
                    setValue={updateHeadingValue} 
                    value={getHeadingValue()} 
                    bounds={[-Infinity, Infinity]}
                    units="deg"
                />
            </div>
            
            <div className="flex items-center flex-row gap-[15px]">
                <MirrorControl mirrorDirection="x" src={flipHorizontal}/>
                <MirrorControl mirrorDirection="y" src={flipVertical}/>
            </div>
        </div>
    );
}