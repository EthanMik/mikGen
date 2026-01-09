import { useEffect } from "react";
import { useFileFormat, type FileFormat } from "./useFileFormat";
import { useFormat } from "./useFormat";
import { useField } from "./useField";
import { globalDefaultsStore } from "../core/DefaultConstants";
import { usePath } from "./usePath";
import { robotConstantsStore } from "../core/Robot";
import { useCommand } from "./useCommands";

export function useFileOpenSync() {
    const [ fileFormat, ] = useFileFormat();

    const [ format , setFormat ] = useFormat();
    const [ , setField ] = useField();
    const [ , setPath ] = usePath();
    const [ , setCommands ] = useCommand(); 

    useEffect(() => {
        if (fileFormat === null || fileFormat === undefined) return;

        const file = fileFormat as FileFormat;

        setFormat(file.format);
        setField(file.field);
        setPath(file.path);
        setCommands(file.commands);
        robotConstantsStore.merge(file.robot);
        globalDefaultsStore.merge( { [format]: file.defaults })


    }, [fileFormat])

}