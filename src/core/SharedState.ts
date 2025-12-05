import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function createSharedState<T>(initialValue: T) {
  let state = initialValue;
  const listeners = new Set<Dispatch<SetStateAction<T>>>();

  const setState: Dispatch<SetStateAction<T>> = (next) => {
    if (typeof next === "function") {
      const updater = next as (prev: T) => T;
      state = updater(state);
    } else {
      state = next;
    }

    for (const listener of listeners) {
      listener(state);
    }
  };

  const useSharedState = () => {
    const [localState, setLocalState] = useState<T>(state);

    useEffect(() => {
      listeners.add(setLocalState);
      return () => {
        listeners.delete(setLocalState);
      };
    }, []);

    return [localState, setState] as const;
  };

  return useSharedState;
}