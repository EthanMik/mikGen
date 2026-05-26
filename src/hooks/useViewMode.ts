import { createStore } from "../core/Store";

export type ViewMode = "automatic" | "standard" | "collapsed-config" | "collapsed-list" | "fully-collapsed";

const viewModeStore = createStore<ViewMode>("automatic");

export function useViewMode() {
    return [viewModeStore.useStore(), viewModeStore.setState] as const;
}

export { viewModeStore };
