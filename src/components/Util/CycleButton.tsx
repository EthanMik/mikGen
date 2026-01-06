import { useState } from "react"

type ImageKey = {
    src: string,
    key: string
}

type CycleImageButtonProps = {
    onKeyChange: (key: string) => void;
    imageKeys: [ImageKey, ImageKey, ...ImageKey[]]
}

export default function CycleImageButton({
    imageKeys,
    onKeyChange
}: CycleImageButtonProps) {
    
    const [ keyIdx, setKeyIdx ] = useState<number>(0);

    const handleNextCycle = () => {
        setKeyIdx(prev => {
            let newIdx = prev + 1;
            if (newIdx >= imageKeys.length) {
                newIdx = 0;
            }
            const newKey = imageKeys[newIdx].key
            onKeyChange(newKey);
            return newIdx;
        });
    }

    return (
        <div
            className="flex item-center w-[22px] h-[22px]"
        >
            {imageKeys.map((k, idx) => (
                <button 
                    className="cursor-pointer"
                    onClick={handleNextCycle}
                >
                    {keyIdx === idx && <img src={k.src}></img>}
                </button>
            ))}
        </div>
    )
}