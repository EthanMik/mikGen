import { createSharedState } from "../core/SharedState";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib";

const saved = localStorage.getItem("format");
const initialData = saved ? JSON.parse(saved) : "mikLib";

export const useFormat = createSharedState<Format>(initialData)
