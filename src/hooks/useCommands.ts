import type { Command } from "../core/Types/Command";
import { createSharedState } from "../core/SharedState";
import { DEFAULT_FORMAT } from "./useFileFormat";

const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;

export const useCommand = createSharedState<Command[]>(initialData.commands);