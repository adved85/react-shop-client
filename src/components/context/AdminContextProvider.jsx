import { useState } from "react";
import { AdminContext } from "./AdminContext";
import { logout as logoutAdminApi } from "../../services/authAdmin.service";

// Provider only — the context object and the useAdmin hook live in
// AdminContext.js, see the note there.
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
