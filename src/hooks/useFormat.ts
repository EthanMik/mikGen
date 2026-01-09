import { useSyncExternalStore } from "react";
import { createStore } from "../core/Store";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib";

const saved = localStorage.getItem("format") as Format;
const initialData = saved ? JSON.parse(saved) : "mikLib";

export const formatStore = createStore<Format>(initialData);

export function useFormat(): [Format, (f: Format) => void] {
  const format = useSyncExternalStore(
    formatStore.subscribe,
    formatStore.getState,
    formatStore.getState
  );
  return [format, formatStore.setState];
}