import { globalDefaultsStore } from "../core/DefaultConstants";
import { robotConstantsStore } from "../core/Robot";
import { useCommand } from "./useCommands";
import { useField } from "./useField";
import { type FileFormat } from "./useFileFormat";
import { useFormat } from "./useFormat";
import { usePath } from "./usePath";


export function useGetFileFormat(): FileFormat {
    const [ format, ] = useFormat();
    const [ field ] = useField();
    const defaults = globalDefaultsStore.getState()[format];
    const [ path, ] = usePath();
    const robot = robotConstantsStore.getState();
    const [ commands, ] = useCommand(); 
    
    const next = ({
        format: format,
        field: field,
        defaults: defaults,
        path: path,
        robot: robot,
        commands: commands
    });

    return next;
}