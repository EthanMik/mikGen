import { defaultRobotConstants, type RobotConstants } from "../core/Robot"
import type { Path } from "../core/Types/Path"
import { FORMAT_REGISTRY, mergeFormatDef, type FormatDef } from "../simulation/FormatDefinition"
import type { Format } from "../simulation/FormatDefinition"

export type FieldType =
    "pushback-v5-match" |
    "pushback-v5-skills" |
    "pushback-vexu-match" |

    "override-v5-match" |
    "override-v5-skills" |
    "override-vexu-match" |
    "override-vexu-skills" |

    "highstakes-v5-match" |
    "highstakes-v5-skills" |
    "highstakes-vexu-match" |
    "highstakes-vexu-skills" |

    "empty" | "separator";

export const VALID_FIELDS = new Set<FieldType>([
    "pushback-v5-match", "pushback-v5-skills", "pushback-vexu-match",
    "override-v5-match", "override-v5-skills", "override-vexu-match", "override-vexu-skills",
    "highstakes-v5-match", "highstakes-v5-skills", "highstakes-vexu-match", "highstakes-vexu-skills",
    "empty", "separator",
]);

export type FileFormat = {
    format: Format,
    field: FieldType,
    formatDef: FormatDef<Format>,
    path: Path,
    robot: RobotConstants
}

export const DEFAULT_FIELD_KEY: FieldType = "override-v5-match";

export const DEFAULT_FORMAT: FileFormat = {
    format: "mikLib",
    field: DEFAULT_FIELD_KEY,
    formatDef: FORMAT_REGISTRY["mikLib"] as FormatDef<Format>,
    path: { segments: [], name: "mikLib Path" },
    robot: defaultRobotConstants,
}

function loadValidatedAppState(): FileFormat {
    const saved = localStorage.getItem("appState");
    if (!saved) return DEFAULT_FORMAT;

    try {
        const parsed = JSON.parse(saved);
        console.log(parsed);
        const format: Format = parsed.format ?? DEFAULT_FORMAT.format;
        return {
            format,
            field: parsed.field ?? DEFAULT_FORMAT.field,
            formatDef: mergeFormatDef(FORMAT_REGISTRY[format] as FormatDef<Format>, parsed.formatDef ?? parsed.defaults),
            path: (parsed.path && Array.isArray(parsed.path.segments))
                ? parsed.path
                : DEFAULT_FORMAT.path,
            robot: parsed.robot ?? DEFAULT_FORMAT.robot,
        };
    } catch {
        return DEFAULT_FORMAT;
    }
}

export const VALIDATED_APP_STATE = loadValidatedAppState();
