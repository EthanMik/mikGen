import { createStore } from "../core/Store";
import { DEFAULT_FORMAT, DEFAULT_FIELD_KEY, VALIDATED_APP_STATE, recastPath, type FileFormat, type FieldType } from "../core/FileSchema";
import type { Path } from "../core/Types/Path";
import type { Segment } from "../core/Types/Segment";
import { FORMAT_REGISTRY, type Format, type FormatDef } from "../simulation/FormatDefinition";
import type { RobotConstants } from "../core/Robot";

import pushbackIcon from "../assets/pushbackball.svg"
import highstakesIcon from "../assets/highstakesring.svg"
import overrideIcon from "../assets/overridecup.svg"


import pushbackVEXUMatchField from "../assets/pushback-match.png";
import pushbackSkillsField from "../assets/pushback-skills.png";
import pushbackV5MatchField from "../assets/pushback-matchv5.png";

import overrideVEXUMatchField from "../assets/VURC-Override-H2H-TopDownHighlighted-TileColor66_71@0.1.png";
import overrideVEXUSkillsField from "../assets/VURC-Override-Skills-TopDownHighlighted-TileColor66_71@0.1.png";
import overrideV5MatchField from "../assets/V5RC-Override-H2H-TopDownHighlighted-TileColor66_71@0.1.png";
import overrideV5SkillsField from "../assets/V5RC-Override-Skills-TopDownHighlighted-TileColor66_71@0.1.png";

import highstakesVEXUMatchField from "../assets/VURC-HighStakes-H2H-TopDownHighlighted-TileColor66_71@4.0.png";
import highstakesVEXUSkillsField from "../assets/VURC-HighStakes-Skills-TopDownHighlighted-TileColor66_71@4.0.png";
import highstakesV5MatchField from "../assets/V5RC-HighStakes-H2H-TopDownHighlighted-TileColor66_71@4.0.png";
import highstakesV5SkillsField from "../assets/V5RC-HighStakes-Skills-TopDownHighlighted-TileColor66_71@4.0.png";


import emptyField from "../assets/empty-field.png";

export type { FileFormat, FieldType, Format }
export { DEFAULT_FORMAT, DEFAULT_FIELD_KEY, VALIDATED_APP_STATE }

export const fileFormatStore = createStore<FileFormat>(VALIDATED_APP_STATE);

/**
 * Switches the whole file to another library, recasting every segment to the nearest kind that
 * format has and reseeding its constants. Lives here rather than in FormatDefinition so the
 * format registry never has to import app state, which would make the two modules circular.
 */
export function changeFormat(newFormat: Format) {
    const newFormatDef = FORMAT_REGISTRY[newFormat] as FormatDef<Format>;
    fileFormatStore.setState(prev => ({
        ...prev,
        format: newFormat,
        formatDef: newFormatDef,
        path: recastPath(newFormatDef, newFormat, prev.path),
    }));
}

export function useFileFormat() {
    return [fileFormatStore.useStore(), fileFormatStore.setState] as const;
}

export function usePath() {
    const path = fileFormatStore.useSelector(s => s.path);
    return [path, updatePath] as const;
}

export function updatePath(next: Path | ((prev: Path) => Path)) {
    fileFormatStore.setState(prev => ({
        ...prev,
        path: typeof next === "function" ? next(prev.path) : next,
    }));
}

// Selectors run for every subscriber on every store notification, so per-row segment lookups
// need to be O(1). The map is built once per segments array (arrays are immutable, identity
// implies membership) and shared by all rows.
const segmentIndexCache = new WeakMap<Segment[], Map<string, Segment>>();

export function selectSegmentById(s: FileFormat, id: string): Segment | undefined {
    let byId = segmentIndexCache.get(s.path.segments);
    if (!byId) {
        byId = new Map(s.path.segments.map(seg => [seg.id, seg]));
        segmentIndexCache.set(s.path.segments, byId);
    }
    return byId.get(id);
}

type FieldEntry = { key: FieldType; src: string; name: string };
type FieldGroup = { id: string; icon: string; name: string; items: FieldEntry[] };

export const FIELD_GROUPS: FieldGroup[] = [
    {
        id: "override", icon: overrideIcon, name: "Override", items: [
            { key: DEFAULT_FIELD_KEY, src: overrideV5MatchField, name: "V5 Match" },
            { key: "override-v5-skills", src: overrideV5SkillsField, name: "V5 Skills" },
            { key: "override-vexu-match", src: overrideVEXUMatchField, name: "VEXU Match" },
            { key: "override-vexu-skills", src: overrideVEXUSkillsField, name: "VEXU Skills" },
        ]
    },
    {
        id: "pushback", icon: pushbackIcon, name: "Push Back", items: [
            { key: "pushback-v5-match", src: pushbackV5MatchField, name: "V5 Match" },
            { key: "pushback-v5-skills", src: pushbackSkillsField, name: "V5 Skills" },
            { key: "pushback-vexu-match", src: pushbackVEXUMatchField, name: "VEXU Match" },
        ]
    },
    {
        id: "highstakes", icon: highstakesIcon, name: "High Stakes", items: [
            { key: "highstakes-v5-match", src: highstakesV5MatchField, name: "V5 Match" },
            { key: "highstakes-v5-skills", src: highstakesV5SkillsField, name: "V5 Skills" },
            { key: "highstakes-vexu-match", src: highstakesVEXUMatchField, name: "VEXU Match" },
            { key: "highstakes-vexu-skills", src: highstakesVEXUSkillsField, name: "VEXU Skills" },
        ]
    },
    {
        id: "misc",  icon: "", name: "Misc", items: [
            { key: "empty", src: emptyField, name: "Empty" },
        ]
    },
];

export const fieldMap: FieldEntry[] = FIELD_GROUPS.flatMap(g => g.items);

export function getFieldSrcFromKey(key: string): string {
    return fieldMap.find(f => f.key === key)?.src ?? "";
}

export function getFieldGroupId(key: FieldType): string {
    return FIELD_GROUPS.find(g => g.items.some(i => i.key === key))?.id ?? FIELD_GROUPS[0].id;
}

export function updateField(next: FieldType) {
    fileFormatStore.setState(prev => ({ ...prev, field: next }));
}

export function useField() {
    const field = fileFormatStore.useSelector(s => s.field);
    return [field, updateField] as const;
}

export function useFormat() {
    const format = fileFormatStore.useSelector(s => s.format);
    // Deliberately changeFormat, not a bare setter: format and formatDef must never disagree
    return [format, changeFormat] as const;
}

export function mergeRobot(patch: Partial<RobotConstants>) {
    fileFormatStore.setState(prev => ({
        ...prev,
        robot: { ...prev.robot, ...patch },
    }));
}

export function useFormatDef() {
    return fileFormatStore.useSelector(s => s.formatDef);
}

export function setFormatDef(next: FormatDef<Format>) {
    fileFormatStore.setState(prev => ({ ...prev, formatDef: next }));
}
