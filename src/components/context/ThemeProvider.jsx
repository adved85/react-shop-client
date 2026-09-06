import { useState } from "react";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }) => {

    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
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
