import { createContext, useContext } from "react";

export const ScaleContext = createContext(1);

export const useScale = () => useContext(ScaleContext);
