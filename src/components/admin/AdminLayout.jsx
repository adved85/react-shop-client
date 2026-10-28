import Layout from "../common/Layout";
import Sidebar from "../common/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {

  return (
    <Layout>
      <div className="container">
        <div className="row mt-5">
          <div className="col-md-3">
            <Sidebar />
          </div>
          <div className="col-md-9">
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminLayout
