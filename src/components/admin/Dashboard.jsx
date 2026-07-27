import React from "react";
import { useAdmin } from "../context/AdminContext";

const Dashboard = () => {

  const { logout } = useAdmin();

  return (
    <div>
      Here is Dashboard!
      <button className="btn btn-secondary" onClick={logout}>Logout</button>
    </div>
  )
}

export default Dashboard
