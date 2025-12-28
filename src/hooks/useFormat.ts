import { createSharedState } from "../core/SharedState";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib";

export const useFormat = createSharedState<Format>("mikLib")
