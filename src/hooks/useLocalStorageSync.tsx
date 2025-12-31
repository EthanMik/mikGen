import { useEffect } from "react";
import { useFormat } from "./useFormat";
import { usePath } from "./usePath";
import { useField } from "./useField";

export default function useLocalStorageSync() {
    const [path, setPath] = usePath();
    const [format, setFormat] = useFormat();
    const [ field, setField ] = useField();

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