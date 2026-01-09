import { createSharedState } from "../core/SharedState";
import type { Path } from "../core/Types/Path";

const saved = localStorage.getItem("path");
const initialData = false ? JSON.parse(saved) : { 
    name: "",
    segments: [] 
};

export const usePath = createSharedState<Path>(initialData);