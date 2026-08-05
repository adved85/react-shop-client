import React from "react";
import { useAdmin } from "../context/AdminContext";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {

    const { logout } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate("/admin/login");
    }

    return (
        <div className="card shadow sidebar mb-5">
            <div className="card-body p-5">
                <ul>
                    <li><Link to="/admin/dashboard">Dashboard</Link></li>
                    <li><Link to="/admin/categories">Categories</Link></li>
                    <li><Link to="/admin/brands">Brands</Link></li>
                    <li><Link to="/admin/brands">Products</Link></li>
                    <li><Link to="/admin/brands">Orders</Link></li>
                    <li><Link to="/admin/brands">Users</Link></li>
                    <li><Link to="/admin/brands">Shipping</Link></li>
                    <li><Link to="/admin/brands">Change Password</Link></li>
                    <li><a href="#" onClick={handleLogout}>Logout</a></li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar
