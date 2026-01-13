import React, { useMemo } from "react";

type ImageKey = {
    src: string;
    key: string | null;
};

export type CycleImageButtonProps = {
    imageKeys: [ImageKey, ImageKey, ...ImageKey[]];
    value: string | null; 
    onKeyChange: (key: string | null) => void;
};

export default function CycleImageButton({
    imageKeys,
    value,
    onKeyChange,
}: CycleImageButtonProps) {
    const keyToIdx = useMemo(() => {
        const m = new Map<string | null, number>();
        imageKeys.forEach((k, i) => m.set(k.key, i));
        return m;
    }, [imageKeys]);

    const idx = keyToIdx.get(value) ?? 0;
    const current = imageKeys[idx];

    const handleNextCycle = () => {
        const nextIdx = (idx + 1) % imageKeys.length;
        onKeyChange(imageKeys[nextIdx].key);
    };

    return (
        <button
            type="button"
            className="flex items-center w-[20px] h-[20px] cursor-pointer"
            onClick={handleNextCycle}
        >
        <img src={current.src} alt="" draggable={false} />
        </button>
    );
}