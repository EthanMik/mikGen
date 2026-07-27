import { createStore } from "./Store";

/**
 * A module-level value every caller shares, exposed as a `[value, setValue]` pair.
 * Backed by createStore, so the same hook also carries getState/setState/subscribe/useSelector
 * for callers that need to read or write outside React, or subscribe to one derived field.
 */
export function createSharedState<T>(initialValue: T) {
  const store = createStore(initialValue);

  const useSharedState = () => [store.useStore(), store.setState] as const;

  return Object.assign(useSharedState, store);
}
