import { useEffect } from "react";
import { useFormat } from "./useFormat";
import { usePath } from "./usePath";

export default function useLocalStorageSync() {
    const [path, setPath] = usePath();
    const [format, setFormat] = useFormat();

    useEffect(() => {
        localStorage.setItem("path", JSON.stringify(path));
    }, [path]);

    useEffect(() => {
        localStorage.setItem("format", JSON.stringify(format));
    }, [format]);

}