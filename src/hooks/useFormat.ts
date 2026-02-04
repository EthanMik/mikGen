import { useSyncExternalStore } from "react";
import { createStore } from "../core/Store";
import { VALIDATED_APP_STATE } from "./useFileFormat";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib" | "RW-Template"

export const formatStore = createStore<Format>(VALIDATED_APP_STATE.format);

export function useFormat(): [Format, (f: Format) => void] {
  const format = useSyncExternalStore(
    formatStore.subscribe,
    formatStore.getState,
    formatStore.getState
  );
  return [format, formatStore.setState];
}