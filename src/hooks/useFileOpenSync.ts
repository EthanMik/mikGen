/* eslint-disable @typescript-eslint/no-explicit-any */
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
        const file = fileFormat as FileFormat;
        console.log(file)
        
        if ('format' in file && file.format !== undefined) setFormat(file.format);
        if ('field' in file && file.field !== undefined) setField(file.field);
        if ('path' in file && file.path !== undefined) setPath(file.path);
        if ('commands' in file && file.commands !== undefined) setCommands(file.commands);
        if ('robot' in file && file.robot !== undefined) robotConstantsStore.merge(file.robot);
        if ('defaults' in file && file.defaults !== undefined) {
            const targetFormat = (file as FileFormat).format ?? format;
            globalDefaultsStore.merge({ [targetFormat]: (file as FileFormat).defaults } as any);
        }
    }, [fileFormat])
}