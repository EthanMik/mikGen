/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useSyncExternalStore } from "react";

type Listener = () => void;
type Updater<T> = T | ((prev: T) => T);

export type Store<T> = {
  getState: () => T;

  setState: (next: Updater<T>) => void;

  subscribe: (listener: Listener) => () => void;

  useStore: () => T;

  useSelector: <S>(selector: (s: T) => S, isEqual?: (a: S, b: S) => boolean) => S;
};

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const setState = (next: Updater<T>) => {
    const resolved = typeof next === "function" ? (next as (p: T) => T)(state) : next;
    if (Object.is(resolved, state)) return;
    state = resolved;
    for (const l of listeners) l();
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = () => useSyncExternalStore(subscribe, getState, getState);

  const useSelector = <S,>(
    selector: (s: T) => S,
    isEqual: (a: S, b: S) => boolean = Object.is
  ) => {
    const lastRef = useRef<{ has: boolean; value: S }>({ has: false, value: undefined as S });

    const getSnap = () => {
      const nextVal = selector(getState());
      if (lastRef.current.has && isEqual(lastRef.current.value, nextVal)) {
        return lastRef.current.value;
      }
      lastRef.current.has = true;
      lastRef.current.value = nextVal;
      return nextVal;
    };

    return useSyncExternalStore(subscribe, getSnap, getSnap);
  };

  return { getState, setState, subscribe, useStore, useSelector };
}

export function createObjectStore<T extends Record<string, any>>(initial: T) {
  const store = createStore<T>(initial);

  const merge = (patch: Partial<T> | ((prev: T) => Partial<T>)) => {
    store.setState(prev => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      return { ...prev, ...p };
    });
  };

  return { ...store, merge };
}
