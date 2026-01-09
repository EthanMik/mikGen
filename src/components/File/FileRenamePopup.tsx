import { useFormat } from "../../hooks/useFormat";
import { usePath } from "../../hooks/usePath";
import TextInput from "../Util/TextInput";
import enter from "../../assets/enter.svg";
import cross from "../../assets/cross.svg"
import type { SetStateAction } from "react";
import React, { useEffect, useRef, useState } from "react";

type FileRenamePopupProps = {
    onEnter: (text: string) => void;
    open: boolean;
    label: string;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function FileRenamePopup({
    label,
    onEnter,
    open,
    setOpen
}: FileRenamePopupProps) {
    const [ path,  ] = usePath();
    const [ format, ] = useFormat();
    
    const intialName = (path.name === "" || path.name === undefined || path.name === null) ? (format.slice(0, 3) + "Path") : path.name
    
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
                        fixed inset-0 z-30
                        bg-black/10 backdrop-blur-[7px]
                        grid place-items-center
                        overflow-x-hidden"
                    >
                    <div 
                        className="
                            relative
                            -translate-y-[15%]
                            bg-medgray_hover w-auto h-auto p-4
                            flex flex-col gap-2
                            shadow-xs shadow-blackgray
                            rounded-lg
                        "
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
                                {label}
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
                                    focus={true}
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