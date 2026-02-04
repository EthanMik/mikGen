import { useSyncExternalStore } from "react";
import { createStore } from "../core/Store";
import { VALIDATED_APP_STATE, type Format } from "./appStateDefaults";

export type { Format }

export const formatStore = createStore<Format>(VALIDATED_APP_STATE.format);

export function useFormat(): [Format, (f: Format) => void] {
  const format = useSyncExternalStore(
    formatStore.subscribe,
    formatStore.getState,
    formatStore.getState
  );
  return [format, formatStore.setState];
}