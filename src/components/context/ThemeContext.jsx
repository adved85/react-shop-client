import { createContext, useState } from "react";
import { getContext } from "./contextHelpers";

// theme context + provider
export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {

    const [theme, setTheme] = useState("light");

    const toggleTheme = (color) => {
        setTheme(prev => prev === "light" ? "dark" : "light");
    }

    const value = {
        theme,
        toggleTheme,
        setTheme
    }

    return <ThemeContext.Provider value={value}>
        {children}
    </ThemeContext.Provider>
};

export function useTheme() {
    return getContext(ThemeContext, "useTheme", "ThemeProvider");
}