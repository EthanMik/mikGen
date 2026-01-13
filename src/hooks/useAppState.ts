import { createSharedState } from "../core/SharedState";
import { DEFAULT_FORMAT, type FileFormat } from "./useFileFormat";

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;

export const useAppState = createSharedState<FileFormat>(initialData);