import { createStore } from "../core/Store";
import { DEFAULT_FORMAT, VALIDATED_APP_STATE, type FileFormat, type FieldType } from "./appStateDefaults";
import type { Path } from "../core/Types/Path";
import type { Format } from "../simulation/FormatDefinition";
import type { RobotConstants } from "../core/Robot";
import pushbackVEXUMatchField from "../assets/pushback-match.png";
import pushbackSkillsField from "../assets/pushback-skills.png";
import pushbackV5MatchField from "../assets/pushback-matchv5.png";
import emptyField from "../assets/empty-field.png";

export type { FileFormat, FieldType, Format }
export { DEFAULT_FORMAT, VALIDATED_APP_STATE }

export const fileFormatStore = createStore<FileFormat>(VALIDATED_APP_STATE);

export function useFileFormat() {
    return [fileFormatStore.useStore(), fileFormatStore.setState] as const;
}

export function usePath() {
    const path = fileFormatStore.useSelector(s => s.path);
    const setPath = (next: Path | ((prev: Path) => Path)) =>
        fileFormatStore.setState(prev => ({
            ...prev,
            path: typeof next === "function" ? next(prev.path) : next,
        }));
    return [path, setPath] as const;
}

type FieldEntry = { key: FieldType; src: string; name: string };

export const fieldMap: FieldEntry[] = [
    { key: "v5-match", src: pushbackV5MatchField, name: "V5 Match Field" },
    { key: "v5-skills", src: pushbackSkillsField, name: "V5 Skills Field" },
    { key: "vexu-match", src: pushbackVEXUMatchField, name: "VEXU Match Field" },
    { key: "separator", src: "", name: "" },
    { key: "empty", src: emptyField, name: "Empty Field" },
];

export function getFieldSrcFromKey(key: string): string {
    return fieldMap.find(f => f.key === key)?.src ?? "";
}

export function useField() {
    const field = fileFormatStore.useSelector(s => s.field);
    const setField = (next: FieldType) =>
        fileFormatStore.setState(prev => ({ ...prev, field: next }));
    return [field, setField] as const;
}

export function useFormat() {
    const format = fileFormatStore.useSelector(s => s.format);
    const setFormat = (next: Format) =>
        fileFormatStore.setState(prev => ({ ...prev, format: next }));
    return [format, setFormat] as const;
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
