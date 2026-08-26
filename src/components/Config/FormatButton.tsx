import { useRef } from "react";
import { changeFormat, mergeRobot, useFormat, type Format } from "../../hooks/useFileFormat";

import { saveSnapshot } from "../../core/Undo/UndoHistory";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckButton } from "../Util/CheckButton";
import { isHolonomicFormat } from "../../simulation/FormatDefinition";

type PathFormats = {
    name: string,
    format: Format,
}

const FORMATS: PathFormats[] = [
    { name: "mikLib v2.3.0", format: "mikLib" },
    { name: "LemLib v0.5.6", format: "LemLib" },
    { name: "JAR-Template", format: "JAR-Template" },
    { name: "EZ-Template v3.2.2", format: "EZ-Template" },
    // { name: "ReveilLib v4.0", format: "ReveilLib" },
];

export default function FormatButton() {
    const [format] = useFormat();
    const prevFormatRef = useRef<Format>(format);

    const handleClickItem = (newFormat: Format) => {
        const changed = prevFormatRef.current !== newFormat;
        changeFormat(newFormat);
        mergeRobot({ holonomicRobot: isHolonomicFormat(newFormat) });
        if (changed) saveSnapshot();
        prevFormatRef.current = newFormat;
    };

    return (
        <ConfigButtonTemplate title="Format">
            {FORMATS.map((c) => (
                <ConfigCheckButton key={c.format} checked={format === c.format} setChecked={() => handleClickItem(c.format)} name={c.name}/>
            ))}
        </ConfigButtonTemplate>
    );
}
