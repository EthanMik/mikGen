import { useCallback, useEffect, useRef, useState } from "react";
import { fieldMap, useField, type FieldType } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import Separator from "../Util/Separator";
import ConfigButtonTemplate from "./ConfigButtonTemplate";

const imageCache: { [key: string]: HTMLImageElement } = {};

async function preloadImage(src: string): Promise<HTMLImageElement> {
    if (!src) return new Image();

    if (imageCache[src]) {
        return imageCache[src];
    }

    const img = new Image();
    img.src = src;
    try {
        await img.decode();
        imageCache[src] = img;
    } catch {
        // do nothing
    }
    return img;
}

function usePreloadImagesOnMount(srcs: string[]) {
    const imgRefs = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        (async () => {
            imgRefs.current = await Promise.all(srcs.map(preloadImage));
        })();

        return () => {
            imgRefs.current = [];
        };
    }, []);
}

export default function FieldButton() {
    const [fieldKey, setFieldKey] = useField();
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const fieldWhenMenuOpened = useRef<FieldType>(fieldKey);

    usePreloadImagesOnMount(fieldMap.map((f) => f.src));

    useEffect(() => {
        if (fieldKey === undefined) {
            setFieldKey(fieldMap[0].key);
        }
    }, [fieldKey, setFieldKey]);

    const handleOpen = useCallback(() => {
        fieldWhenMenuOpened.current = fieldKey;
        if (!imagesLoaded) {
            Promise.all(fieldMap.map(f => preloadImage(f.src))).then(() => setImagesLoaded(true));
        }
    }, [fieldKey, imagesLoaded]);

    const handleClose = useCallback(() => {
        if (fieldKey !== fieldWhenMenuOpened.current) {
            saveSnapshot();
        }
    }, [fieldKey]);

    const handleClickItem = (key: FieldType) => {
        setFieldKey(key);
    };

    return (
        <ConfigButtonTemplate title="Field" onOpen={handleOpen} onClose={handleClose}>
            {fieldMap.map((c) => (
                c.key === "separator"
                    ? <Separator key={c.key} name={c.name} />
                    : <button
                        key={c.key}
                        type="button"
                        className={`flex items-center justify-between w-full px-2 py-1 hover:bg-medgray_hover cursor-pointer rounded-sm ${fieldKey === c.key ? "bg-medgray_hover" : ""}`}
                        onClick={() => handleClickItem(c.key)}
                    >
                        <span className="text-[16px]">{c.name}</span>
                        {fieldKey === c.key && (
                            <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
                                <path
                                    d="M1 6.5L5.66752 10.7433C6.11058 11.1461 6.8059 11.0718 7.15393 10.5846L14 1"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </button>
            ))}
        </ConfigButtonTemplate>
    );
}
