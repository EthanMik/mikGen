import { useState } from "react";
import Slider from "./Slider";

export default function PathConfig() {
    const [value, setValue] = useState<number>(0);

    return (
        <div className="flex lr-5 bg-medgray w-[500px] h-[650px] rounded-lg">
            <div className="pt-10">
                <Slider 
                    sliderWidth={250}
                    sliderHeight={5}
                    knobHeight={16}
                    knobWidth={16}
                    value={value} 
                    setValue={setValue}
                />
            </div>
        </div>
    );  
}