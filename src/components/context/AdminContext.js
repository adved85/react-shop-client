import { createContext } from "react";
import { useSafeContext } from "./contextHelpers";

// The context and its hook live apart from the provider component so that
// neither file exports both a component and a non-component — which is what
// Fast Refresh needs to hot-update this tree instead of reloading the page.
// The provider is in AdminContextProvider.jsx.
export const AdminContext = createContext(null);

export function useAdmin() {
    return useSafeContext(AdminContext, "useAdmin", "AdminContextProvider");
}
