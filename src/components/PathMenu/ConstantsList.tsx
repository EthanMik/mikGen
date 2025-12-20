import { useState } from "react";
import downArrow from "../../assets/down-arrow.svg";
import NumberInput from "../Util/NumberInput";

type ConstantProps = {
    name: string
}

function Constant({name} : ConstantProps) {
    const [ value, setValue ] = useState<number | null>(0);

    return (        
        <div className="flex flex-row items-center 
            justify-between h-[30px] ml-5 pl-2 pr-2"
        >
            <span className="w-20">{name} </span>
            <NumberInput 
                width={55} 
                height={30}
                fontSize={16}
                value={value}
                setValue={setValue}
                bounds={[0, 100]}
                stepSize={1}
                roundTo={3}
            />
        </div>
    );
}

type ConstantsListProps = {
    header: string,
}

export default function ConstantsList({
    header,
}: ConstantsListProps) {
    const [ open, setOpen ] = useState(false);
    const [ value, setValue ] = useState<number | null>(0);

    return (
        <div className="flex flex-col">
            <div className="flex items-center w-[410px] h-[30px] 
                rounded-lg justify-between"
            >
                <div className="flex pl-2 gap-2">
                    <button className="cursor-pointer" 
                        onClick={() => setOpen(!open)}>
                        { !open ? 
                            <img className="w-[12px] h-[12px] rotate-270" src={downArrow}/> : 
                            <img className="w-[12px] h-[12px]" src={downArrow}/>
                        }
                    </button>
                    <span>{header}</span>   
                </div>
                <div className="flex pr-5 gap-2">
                    <button className="bg-medlightgray hover:bg-medgray_hover px-2 rounded-sm">
                        <span className="text-verylightgray">
                            Set Default
                        </span>
                    </button>

                    <button className="bg-medlightgray hover:bg-medgray_hover px-2 rounded-sm">
                        <span className="text-verylightgray">
                            Reset
                        </span>
                    </button>

                </div>
            </div>


            {open && (
                <div className="grid grid-cols-2 min-w-0 gap-1 mt-1 w-[400px]">
                    <Constant name={"Drive kP"}/>
                    <Constant name={"Drive kI"}/>
                    <Constant name={"Drive kD"}/>
                    <Constant name={"Drive startI"}/>
                </div>

            )}
        </div>
    );
}