import { createSharedState } from "../core/SharedState";

const saved = localStorage.getItem("field");
const initialData = saved ? JSON.parse(saved) : "";

export const useField = createSharedState(initialData);