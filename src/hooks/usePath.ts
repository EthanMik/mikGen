import { createSharedState } from "../core/SharedState";
import type { Path } from "../core/Types/Path";
import { DEFAULT_FORMAT } from "./useFileFormat";

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;

export const usePath = createSharedState<Path>(initialData.path);