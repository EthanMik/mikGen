import { useState } from "react"

type ImageKey = {
    src: string,
    key: string | null
}

export type CycleImageButtonProps = {
    onKeyChange: (key: string | null) => void;
    imageKeys: [ImageKey, ImageKey, ...ImageKey[]]
    initialKey: string | null,
}

export default function CycleImageButton({
    imageKeys,
    initialKey,
    onKeyChange
}: CycleImageButtonProps) {
    
    const intitalIdx = imageKeys.map((k) => k.key).indexOf(initialKey);
    const [ keyIdx, setKeyIdx ] = useState<number>(intitalIdx ?? 0);

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
            className="flex item-center w-[20px] h-[20px]"
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