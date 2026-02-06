import { createSharedState } from "../core/SharedState"
import { DEFAULT_FORMAT, VALIDATED_APP_STATE, type FileFormat } from "./appStateDefaults"

export type { FileFormat }
export { DEFAULT_FORMAT, VALIDATED_APP_STATE }

export const useFileFormat = createSharedState<FileFormat>(VALIDATED_APP_STATE);