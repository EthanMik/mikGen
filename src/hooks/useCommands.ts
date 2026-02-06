import type { Command } from "../core/Types/Command";
import { createSharedState } from "../core/SharedState";
import { VALIDATED_APP_STATE } from "./appStateDefaults";

export const useCommand = createSharedState<Command[]>(VALIDATED_APP_STATE.commands);