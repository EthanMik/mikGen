import { useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import clockClose from "../../assets/clock-close.svg";
import clockOpen from "../../assets/clock-open.svg";
import downArrow from "../../assets/down-arrow.svg";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import AddSegmentButton from "./AddSegmentButton";
import CopyPathButton from "./CopyPathButton";

type PathConfigHeaderProps = {
  name: string
  isOpen: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  isTelemetryOpen: boolean,
  onTelemetryToggle: () => void,
}

export default function PathConfigHeader({name, isOpen, setOpen, isTelemetryOpen, onTelemetryToggle} : PathConfigHeaderProps) {
  const [ isEyeOpen, setEyeOpen ] = useState(false);
  const [ , setPathVisibility ] = usePathVisibility();

  const handleOpenOnClick = () => {
    setOpen(prev => !prev);
  }

  const handleEyeOnClick = () => {
    setEyeOpen((eye) => {
      setPathVisibility(!eye);
      return !eye
    });
  }

  return (
    <div className="w-full flex flex-row items-center justify-between">
      <span className="block text-[20px]">
        {name}
      </span>
        <div className="flex flex-row gap-[10px] items-center">

          <CopyPathButton />

          <button className="cursor-pointer"
              onClick={handleEyeOnClick}>
              <img className="w-[20px] h-[22px]"
                  src={isEyeOpen ? eyeClosed : eyeOpen}
          />
          </button>

          <button className="cursor-pointer" onClick={onTelemetryToggle}>
              <img className="w-[20px] h-[22px]" src={isTelemetryOpen ? clockClose : clockOpen} />
          </button>

          <button onClick={handleOpenOnClick}
          className="hover:bg-medgray_hover px-1 py-1 rounded-sm">
            <img className={`w-[15px] h-[15px] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} src={downArrow} />
          </button>
          
          <AddSegmentButton/>
        
        </div>
    </div>
  );
}