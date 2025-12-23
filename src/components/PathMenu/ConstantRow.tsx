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
  input?: NumberInputSettings;
};

type ConstantRowProps = {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  input?: NumberInputSettings;
};

export default function ConstantRow({
    label,
    value,
    onChange,
    input,
} : ConstantRowProps) {
    return (        
        <div className="flex flex-row items-center 
            justify-between h-[30px] ml-5 pl-2 pr-2"
        >
            <span className="w-20">{label} </span>
            <NumberInput 
                width={55} 
                height={30}
                fontSize={16}
                value={value}
                setValue={onChange}
                bounds={input?.bounds ?? [0, 100]}
                stepSize={input?.stepSize ?? 1}
                roundTo={input?.roundTo ?? 5}
            />
        </div>
    );
}