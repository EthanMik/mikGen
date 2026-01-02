/* eslint-disable @typescript-eslint/no-explicit-any */
import NumberInput from "../Util/NumberInput";

export type NumberInputSettings = {
  bounds?: [number, number];
  stepSize?: number;
  roundTo?: number;
};

export type ConstantField = {
  key: any;
  label: string;
  units?: string;
  input?: NumberInputSettings;
};

type ConstantRowProps = {
  label: string;
  units?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  input?: NumberInputSettings;
};

export default function ConstantRow({
    label,
    value,
    units = "",
    onChange,
    input,
} : ConstantRowProps) {
    return (        
        <div className="flex flex-row items-center 
            justify-between h-[30px] pr-2 pl-2 gap-1"
        >
            <span className="w-[100px]">{label} </span>
            <NumberInput 
                width={55} 
                height={30}
                fontSize={16}
                value={value}
                setValue={onChange}
                units={units}
                bounds={input?.bounds ?? [0, 100]}
                stepSize={input?.stepSize ?? 1}
                roundTo={input?.roundTo ?? 5}
            />
        </div>
    );
}