import { useRef } from "react";
import { useFormat, type Format } from "../../hooks/useFileFormat";
import { changeFormat } from "../../simulation/FormatDefinition";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckButton } from "../Util/CheckButton";

type PathFormats = {
    name: string,
    format: Format,
}

const FORMATS: PathFormats[] = [
    { name: "mikLib v2.2.0", format: "mikLib" },
    { name: "LemLib v0.5.6", format: "LemLib" },
    // { name: "ReveilLib v2.1.0", format: "ReveilLib" },
    // { name: "JAR-Template", format: "JAR-Template" },
];

export default function FormatButton() {
    const [format] = useFormat();
    const prevFormatRef = useRef<Format>(format);

    const handleClickItem = (newFormat: Format) => {
        const changed = prevFormatRef.current !== newFormat;
        changeFormat(newFormat);
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
