import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_FIELD_KEY, FIELD_GROUPS, getFieldGroupId, useField, type FieldType } from "../../hooks/useFileFormat";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckButton } from "../Util/CheckButton";

const imageCache = new Set<string>();

function preloadImage(src: string) {
    if (!src || imageCache.has(src)) return;
    imageCache.add(src);
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {});
}

function preloadGroup(id: string) {
    FIELD_GROUPS.find(g => g.id === id)?.items.forEach(i => preloadImage(i.src));
}

export default function FieldButton() {
    const [fieldKey, setFieldKey] = useField();
    const fieldWhenMenuOpened = useRef<FieldType>(fieldKey);
    const activeGroup = getFieldGroupId(fieldKey);
    const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

    useEffect(() => {
        if (fieldKey === undefined) setFieldKey(DEFAULT_FIELD_KEY);
    }, [fieldKey, setFieldKey]);

    useEffect(() => {
        if (openGroup !== null) preloadGroup(openGroup);
    }, [openGroup]);

    const handleOpen = useCallback(() => {
        fieldWhenMenuOpened.current = fieldKey;
        setOpenGroup(getFieldGroupId(fieldKey));
    }, [fieldKey]);

    const handleClose = useCallback(() => {
        if (fieldKey !== fieldWhenMenuOpened.current) saveSnapshot();
    }, [fieldKey]);

    return (
        <ConfigButtonTemplate title="Field" onOpen={handleOpen} onClose={handleClose}>
            {FIELD_GROUPS.map(group => (
                <Section
                    key={group.id}
                    name={group.name}
                    collapsed={openGroup !== group.id}
                    onToggle={() => setOpenGroup(prev => (prev === group.id ? null : group.id))}
                    highlight={openGroup !== group.id && activeGroup === group.id}
                >
                    {group.items.map(c => (
                        <ConfigCheckButton
                            key={c.key}
                            name={c.name}
                            checked={fieldKey === c.key}
                            setChecked={() => setFieldKey(c.key)}
                        />
                    ))}
                </Section>
            ))}
        </ConfigButtonTemplate>
    );
}
