import { useRef } from "react";
import { changeFormat, mergeRobot, useFormat, type Format } from "../../hooks/useFileFormat";

import { saveSnapshot } from "../../core/Undo/UndoHistory";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckButton } from "../Util/CheckButton";
import { isHolonomicFormat } from "../../simulation/FormatDefinition";
import Section from "../Util/Section";
import Tooltip from "../Util/Tooltip";

type PathFormats = {
    name: string | "section",
    format?: Format,
    tooltip?: string
}

const FORMATS: PathFormats[] = [
    { name: "mikLib v2.3.0", format: "mikLib" },
    { name: "mikLib-Holonomic", format: "mikLib Holonomic", tooltip: "Swaps drivetrain to holonomic" },
    { name: "Section" },
    { name: "LemLib v0.5.6", format: "LemLib" },
    { name: "JAR-Template", format: "JAR-Template" },
    { name: "EZ-Template v3.2.2", format: "EZ-Template" },
    { name: "Section" },
    { name: "ReveilLib v4.0", format: "ReveilLib" },
    { name: "ReveilLib-Holonomic", format: "ReveilLib Holonomic", tooltip: "Swaps drivetrain to holonomic" }
];

export default function FormatButton() {
    const [format] = useFormat();
    const prevFormatRef = useRef<Format>(format);

    const handleClickItem = (newFormat: Format | undefined) => {
        if (newFormat === undefined) return;
        const changed = prevFormatRef.current !== newFormat;
        if (!changed) return;
        changeFormat(newFormat);
        mergeRobot({ holonomicRobot: isHolonomicFormat(newFormat) });
        saveSnapshot();
        prevFormatRef.current = newFormat;
    };

    return (
        <ConfigButtonTemplate title="Format">
            {FORMATS.map((c) => (
                <>
                    {c.name === "Section" && <Section />}
                    {c.name !== "Section" &&
                        <Tooltip label={c.tooltip} placement={"right"}>
                            <ConfigCheckButton key={c.format} checked={format === c.format} setChecked={() => handleClickItem(c.format)} name={c.name} />
                        </Tooltip>
                    }
                </>
            ))}
        </ConfigButtonTemplate>
    );
}
