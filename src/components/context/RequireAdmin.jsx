import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

export const RequireAdmin = ({ children }) => {

    const { admin } = useAdmin();

    if (!admin) {
        return <Navigate to="/admin/login" />
    }

    return children;
} 