import { useRef } from "react";
import { changeFormat, mergeRobot, useFormat, type Format } from "../../hooks/useFileFormat";

import { saveSnapshot } from "../../core/Undo/UndoHistory";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckButton } from "../Util/CheckButton";
import { isHolonomicFormat } from "../../simulation/FormatDefinition";
import Section from "../Util/Section";
import Tooltip from "../Util/Tooltip";
import lemlibLogo from "../../assets/icons/formats/lemlib.png"
import mikLibLogo from "../../assets/icons/formats/mikLib.ico"
import jarLogo from "../../assets/icons/formats/jar.svg"
import revLogo from "../../assets/icons/formats/rev.svg"
import ezLogo from "../../assets/icons/formats/ez.ico"
import holoLogo from "../../assets/icons/formats/holo.svg"

type PathFormats = {
    name: string | "section",
    format?: Format,
    src?: string;
    tooltip?: string;
}

const FORMATS: PathFormats[] = [
    { name: "mikLib v2.3.0", format: "mikLib", src: mikLibLogo},
    { name: "mikLib-Holonomic", format: "mikLib Holonomic", tooltip: "Swaps drivetrain to holonomic", src: holoLogo },
    { name: "Section" },
    { name: "LemLib v0.5.6", format: "LemLib", src: lemlibLogo },
    { name: "JAR-Template", format: "JAR-Template", src: jarLogo },
    { name: "EZ-Template v3.2.2", format: "EZ-Template", src: ezLogo },
    { name: "Section" },
    { name: "ReveilLib v4.0", format: "ReveilLib", src: revLogo },
    { name: "ReveilLib-Holonomic", format: "ReveilLib Holonomic", tooltip: "Swaps drivetrain to holonomic", src: holoLogo }
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
                            <ConfigCheckButton key={c.format} src={c.src} checked={format === c.format} setChecked={() => handleClickItem(c.format)} name={c.name} />
                        </Tooltip>
                    }
                </>
            ))}
        </ConfigButtonTemplate>
    );
}
