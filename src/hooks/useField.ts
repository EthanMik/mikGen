import { createSharedState } from "../core/SharedState";
import pushbackVEXUMatchField from "../assets/pushback-match.png";
import pushbackSkillsField from "../assets/pushback-skills.png";
import pushbackV5MatchField from "../assets/pushback-matchv5.png"
import emptyField from "../assets/empty-field.png";

export type FieldType = "v5-match" | "v5-skills" | "vexu-match" | "empty" | "separator"

export const useField = createSharedState<FieldType>("v5-match");

type Field = {
  key: FieldType;
  src: string;
  name: string;
};

export const fieldMap: Field[] = [
  { key: "v5-match", src: pushbackV5MatchField, name: "V5 Match Field"},
  { key: "v5-skills", src: pushbackSkillsField, name: "V5 Skills Field" },
  { key: "vexu-match", src: pushbackVEXUMatchField, name: "VEXU Match Field" },
  { key: "separator", src: "", name: "" },
  { key: "empty", src: emptyField, name: "Empty Field" },
];

export function getFieldSrcFromKey(key: string): string {
  const field = fieldMap.find(f => f.key === key);
  return field?.src || "";
}