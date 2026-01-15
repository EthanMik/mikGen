import { useSyncExternalStore } from "react";
import { createStore } from "../core/Store";
import { DEFAULT_FORMAT } from "./useFileFormat";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib";

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;

export const formatStore = createStore<Format>(initialData.format);

export function useFormat(): [Format, (f: Format) => void] {
  const format = useSyncExternalStore(
    formatStore.subscribe,
    formatStore.getState,
    formatStore.getState
  );
  return [format, formatStore.setState];
}