import { createContext, useState } from "react";
import { getContext } from "./contextHelpers";
import { logout as logoutAdminApi } from "../../services/authAdmin.service";

// admin context + provider
export const AdminContext = createContext(null);

export const AdminContextProvider = ({children}) => {
    const adminStorage = localStorage.getItem("adminStorage");
    const [admin, setAdmin] = useState(adminStorage ? JSON.parse(adminStorage) : null);

    const login = (admin) => {
        setAdmin(admin)
    }
    const logout = async () => {
        try {
            await logoutAdminApi();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            localStorage.removeItem("adminStorage");
            setAdmin(null);
        }
    }

    return <AdminContext.Provider value={{admin, login, logout}}>
        {children}
    </AdminContext.Provider>
};

export function useAdmin() {
    return getContext(AdminContext, "useAdmin", "AdminContextProvider");
}