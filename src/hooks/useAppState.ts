import { createSharedState } from "../core/SharedState";
import { VALIDATED_APP_STATE, type FileFormat } from "./useFileFormat";

export const useAppState = createSharedState<FileFormat>(VALIDATED_APP_STATE);