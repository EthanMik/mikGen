import { robotConstantsStore } from "../core/Robot";
import { formatDefStore } from "../simulation/FormatDefinition";
import { useField } from "./useField";
import { type FileFormat } from "./useFileFormat";
import { useFormat } from "./useFormat";
import { usePath } from "./usePath";


export function useGetFileFormat(): FileFormat {
    const [ format, ] = useFormat();
    const [ field ] = useField();
    const formatDef = formatDefStore.getState();
    const [ path, ] = usePath();
    const robot = robotConstantsStore.getState();
    
    const next = ({
        format: format,
        field: field,
        formatDef: formatDef,
        path: path,
        robot: robot,
    });

    return next;
}