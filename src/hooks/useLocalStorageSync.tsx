import { useEffect } from "react";
import { useFormat } from "./useFormat";
import { usePath } from "./usePath";
import { useField } from "./useField";

export default function useLocalStorageSync() {
    const [ path, ] = usePath();
    const [ format, ] = useFormat();
    const [ field,  ] = useField();

    useEffect(() => {
        localStorage.setItem("path", JSON.stringify(path));
    }, [path]);

    useEffect(() => {
        localStorage.setItem("format", JSON.stringify(format));
    }, [format]);

    useEffect(() => {
        localStorage.setItem("field", JSON.stringify(field));
    }, [field]);

}