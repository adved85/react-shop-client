import { createContext } from "react";
import { useSafeContext } from "./contextHelpers";

// Context + hook only; the provider is in ThemeProvider.jsx. Same split as
// AdminContext.js, and for the same Fast Refresh reason.
export const ThemeContext = createContext(null);

export function useTheme() {
    return useSafeContext(ThemeContext, "useTheme", "ThemeProvider");
}
