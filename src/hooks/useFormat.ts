import { useSyncExternalStore } from "react";

export type Format = "mikLib" | "ReveilLib" | "JAR-Template" | "LemLib";

const saved = localStorage.getItem("format");
const initialData = saved ? JSON.parse(saved) : "mikLib";

let state: Format = initialData;
const listeners = new Set<() => void>();

export const formatStore = {
  get: () => state,

  set: (next: Format) => {
    if (Object.is(next, state)) return;
    state = next;
    listeners.forEach((l) => l());
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// React hook wrapper
export function useFormat(): [Format, (f: Format) => void] {
  const format = useSyncExternalStore(
    formatStore.subscribe,
    formatStore.get,
    formatStore.get
  );
  return [format, formatStore.set];
}