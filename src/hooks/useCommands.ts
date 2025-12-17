import type { Command } from "../core/Types/Command";
import { createSharedState } from "../core/SharedState";

export const useCommand = createSharedState<Command[]>([]);