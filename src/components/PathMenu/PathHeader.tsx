import { useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import downArrow from "../../assets/down-arrow.svg";
import plus from "../../assets/plus.svg";
import copy from "../../assets/copy.svg";
import { convertPath } from "../../core/PathConversion";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import { mikLibFormat } from "../../formats/mikLibFormat";
import { usePath } from "../../hooks/usePath";
import AddSegmentButton from "./AddSegmentButton";

type PathConfigHeaderProps = {
  isOpen: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function PathConfigHeader({isOpen, setOpen} : PathConfigHeaderProps) {
  const [ path, setPath ] = usePath(); 
  const [ isEyeOpen, setEyeOpen ] = useState(false);
  const [ pathVisible, setPathVisibility ] = usePathVisibility();

  const handleOpenOnClick = () => {
    setOpen(prev => !prev);
  }

  const copyOnClick = () => {
    const format = new mikLibFormat();
    const out = convertPath(path, format);
    navigator.clipboard.writeText(out);
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
        Path
      </span>
        <div className="flex flex-row gap-[10px] items-center">
          <button 
            className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer 
                      rounded-sm hover:bg-medgray_hover active:scale-95 transition-normal duration-50"
            onClick={copyOnClick}
            >
            <img className="w-[25px] h-[25px] pr-[2px]"
              src={copy}
            />
          </button>

          <button className="cursor-pointer" 
              onClick={handleEyeOnClick}>
              <img className="w-[20px] h-[22px]"
                  src={isEyeOpen ? eyeClosed : eyeOpen}
          />
          </button>

          <button onClick={handleOpenOnClick}
          className="hover:bg-medgray_hover px-1 py-1 rounded-sm">
            {
            isOpen ? <img className={`w-[15px] h-[15px] rotate-180`}
              src={downArrow}
            /> :
            <img className={`w-[15px] h-[15px] rotate-0`}
              src={downArrow}
            />

            }
          </button>
          
          <AddSegmentButton/>
        
        </div>
    </div>
  );
}