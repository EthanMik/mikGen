import { useFormat } from "../../hooks/useFormat";
import { usePath } from "../../hooks/usePath";
import TextInput from "../Util/TextInput";
import enter from "../../assets/enter.svg";
import cross from "../../assets/cross.svg"
import type { SetStateAction } from "react";
import React, { useEffect, useRef, useState } from "react";

type FileRenamePopupProps = {
    onEnter: (text: string) => void;
    open: boolean
    setOpen: React.Dispatch<SetStateAction<boolean>>
}

export default function FileRenamePopup({
    onEnter,
    open,
    setOpen
}: FileRenamePopupProps) {
    const [ path,  ] = usePath();
    const [ format, ] = useFormat();
    
    const intialName = path.name === "" ? (format.slice(0, 3) + "Path") : path.name
    
    const [ text, setText ] = useState(intialName);
    
    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.key === "Enter") {
                onEnter(text)
                setOpen(false);
            }
            if (evt.key === "Escape") {
                setOpen(false);
            }

        }

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
        
    }, [])


    const handleOnEnter = () => {
        onEnter(text)
        setOpen(false);
    }

    return (    
        <React.Fragment>
            { open && 
                <div 
                    className="
                    fixed inset-0 w-screen h-screen bg-black/1 backdrop-blur-[7px] z-30 
                    overflow-x-hidden"
                >
                    <div 
                        className="
                            overflow-x-hidden
                            fixed top-1/2 left-1/2
                            -translate-y-[80%] -translate-x-1/2 origin-center
                            bg-medgray_hover w-auto h-auto pr-4 pl-4 pb-4 pt-4 z-48
                            flex justify-center items-center
                            shadow-xs shadow-blackgray
                            rounded-lg flex-col"
                        ref={popupRef}
                        >
                        <div className="flex flex-col gap-2 text-start ">
                            <button 
                                className="fixed right-2 top-2 px-0.5 py-0.5 rounded-sm hover:bg-blackgrayhover"
                                onClick={() => setOpen(false)}
                            >
                                <img 
                                    className="w-[25px] h-[25px]"
                                    src={cross}
                                >
                                </img>
                            </button>
                            <span className="text-[18px] text-white">
                                Download As:
                            </span>
        
                            <div className="flex flex-row gap-1">
                                <TextInput 
                                    fontSize={18}
                                    unitsFontSize={14}
                                    width={200}
                                    height={40}
                                    units=".txt"
                                    value={intialName}
                                    setValue={(text: string) => {
                                        onEnter(text);
                                        setOpen(false);
                                    }}
                                    setText={setText}
                                />
                                <button
                                    className="flex px-[5px] py-[5px] rounded-sm hover:bg-blackgrayhover"
                                    onClick={() => handleOnEnter()}
                                >
                                        
                                    <img 
                                        className="w-[30px] h-[30px]"
                                        src={enter}
                                    >
                                    </img>
                                </button>
        
                            </div>
                        </div>
                    </div>
                </div>
            }
        </React.Fragment>
    );
}