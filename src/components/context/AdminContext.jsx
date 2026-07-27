import { createContext, useState } from "react";
import { getContext } from "./contextHelpers";

// admin context + provider
export const AdminContext = createContext(null);

export const AdminContextProvider = ({children}) => {
    const adminStorage = localStorage.getItem("adminStorage");
    const [admin, setAdmin] = useState(adminStorage ? JSON.parse(adminStorage) : null);

    const login = (admin) => {
        setAdmin(admin)
    }
    const logout = () => {
        localStorage.removeItem("adminStorage");
        setAdmin(null);
    }

    return <AdminContext.Provider value={{admin, login, logout}}>
        {children}
    </AdminContext.Provider>
};

export function useAdmin() {
    return getContext(AdminContext, "useAdmin", "AdminContextProvider");
}