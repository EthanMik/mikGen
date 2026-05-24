import { useCallback, useEffect, useRef } from "react";
import { fieldMap, useField, type FieldType } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";

const imageCache = new Set<string>();

function preloadImage(src: string) {
    if (!src || imageCache.has(src)) return;
    imageCache.add(src);
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {});
}

fieldMap.forEach(f => preloadImage(f.src));

type FieldSection = { name: string; items: typeof fieldMap };

const fieldSections = fieldMap.reduce<FieldSection[]>((acc, c) => {
    if (c.key === "separator") {
        acc.push({ name: c.name, items: [] });
    } else {
        acc[acc.length - 1]?.items.push(c);
    }
    return acc;
}, []);

type FieldItemProps = { name: string; selected: boolean; onClick: () => void };

function FieldItem({ name, selected, onClick }: FieldItemProps) {
    return (
        <button
            type="button"
            className={`flex items-center justify-between w-full px-2 py-1 bg-medgray hover:brightness-92 cursor-pointer rounded-sm ${selected ? "bg-medlightgray" : ""}`}
            onClick={onClick}
        >
            <span className="text-[14px]">{name}</span>
            {selected && (
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
}

export default function FieldButton() {
    const [fieldKey, setFieldKey] = useField();
    const fieldWhenMenuOpened = useRef<FieldType>(fieldKey);

    useEffect(() => {
        if (fieldKey === undefined) setFieldKey(fieldMap[0].key);
    }, [fieldKey, setFieldKey]);

    const handleOpen = useCallback(() => {
        fieldWhenMenuOpened.current = fieldKey;
    }, [fieldKey]);

    const handleClose = useCallback(() => {
        if (fieldKey !== fieldWhenMenuOpened.current) saveSnapshot();
    }, [fieldKey]);

    return (
        <ConfigButtonTemplate title="Field" onOpen={handleOpen} onClose={handleClose}>
            {fieldSections.map(section =>
                section.items.length > 0 ? (
                    <Section key={section.name} name={section.name} defaultCollapsed={section.name !== "Override"}>
                        {section.items.map(c => (
                            <FieldItem
                                key={c.key}
                                name={c.name}
                                selected={fieldKey === c.key}
                                onClick={() => setFieldKey(c.key)}
                            />
                        ))}
                    </Section>
                ) : (
                    <Section key={section.name} name={section.name} />
                )
            )}
        </ConfigButtonTemplate>
    );
}
