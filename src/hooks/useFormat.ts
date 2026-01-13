import { useSyncExternalStore } from "react";
import { createStore } from "../core/Store";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib";

export const formatStore = createStore<Format>("mikLib");

export function useFormat(): [Format, (f: Format) => void] {
  const format = useSyncExternalStore(
    formatStore.subscribe,
    formatStore.getState,
    formatStore.getState
  );
  return [format, formatStore.setState];
}