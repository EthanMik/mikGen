import { useRef } from "react";
import { useFormat, type Format } from "../../hooks/useFileFormat";
import { changeFormat } from "../../simulation/FormatDefinition";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import ConfigButtonTemplate from "./ConfigButtonTemplate";

type PathFormats = {
    name: string,
    format: Format,
}

const FORMATS: PathFormats[] = [
    { name: "mikLib v2.2.0", format: "mikLib" },
    { name: "LemLib v0.5.6", format: "LemLib" },
    { name: "ReveilLib v2.1.0", format: "ReveilLib" },
    { name: "JAR-Template", format: "JAR-Template" },
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
                <button
                    key={c.format}
                    className={`flex items-center justify-between px-2 py-1 bg-medgray hover:brightness-92 cursor-pointer rounded-sm ${format === c.format ? "bg-medlightgray" : ""}`}
                    onClick={() => handleClickItem(c.format)}
                >
                    <span className="text-[14px]">{c.name}</span>
                    {format === c.format && (
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
