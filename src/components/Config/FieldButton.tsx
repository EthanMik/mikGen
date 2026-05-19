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

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
        new Set(fieldMap.filter(c => c.key === "separator").map(c => c.name))
    );

    const toggleSection = (name: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
    };

    let currentSection = "";

    return (
        <ConfigButtonTemplate title="Field" onOpen={handleOpen} onClose={handleClose}>
            {fieldMap.map((c, i) => {
                if (c.key === "separator") {
                    currentSection = c.name;
                    const sectionHasChildren = fieldMap[i + 1]?.key !== "separator" && i + 1 < fieldMap.length;
                    return (
                        <Separator
                            key={`sep-${c.name}`}
                            name={c.name}
                            onClick={sectionHasChildren ? () => toggleSection(c.name) : undefined}
                            isCollapsed={collapsedSections.has(c.name)}
                        />
                    );
                }
                if (collapsedSections.has(currentSection)) return null;
                return (
                    <button
                        key={c.key}
                        type="button"
                        className={`flex items-center justify-between w-full px-2 py-1 bg-medgray hover:brightness-92 cursor-pointer rounded-sm ${fieldKey === c.key ? "bg-medlightgray" : ""}`}
                        onClick={() => handleClickItem(c.key)}
                    >
                        <span className="text-[14px]">{c.name}</span>
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
                );
            })}
        </ConfigButtonTemplate>
    );
}
