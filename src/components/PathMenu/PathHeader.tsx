import { useState } from "react";
import eyeOpen from "../../assets/eye-open.svg";
import eyeClosed from "../../assets/eye-closed.svg";
import downArrow from "../../assets/down-arrow.svg";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import AddSegmentButton from "./AddSegmentButton";
import CopyPathButton from "./CopyPathButton";

type PathConfigHeaderProps = {
  name: string
  isOpen: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function PathConfigHeader({name, isOpen, setOpen} : PathConfigHeaderProps) {
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