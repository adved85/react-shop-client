import { Link } from "react-router-dom";
import { getDepartments, destroyDepartment } from "../../../api/adminDepartments";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Breadcrumb from "../../common/Breadcrumb";
import DepartmentRows from "./DepartmentRows";
import TableSpinnerRow from "../../common/table/TableSpinnerRow";

const DepartmentsContent = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDepartments()
    .then(setDepartments)
    .catch(() => {}) // the interceptor already showed a toast
    .finally(() => setLoading(false));
  }, []); // [] runs once, when the component mounts

  const deleteDepartment = async (item) => {

    const confirmation = `Delete "${item.name}"?`;

    if (window.confirm(confirmation)) {
      try {
        setLoading(true);
        await destroyDepartment(item.id);
        const message = `${item.name} deleted!`;
        toast.success(message, {
          autoClose: 1000,
        });

        setDepartments(prev => prev.filter(d => d.id !== item.id));

      } catch {
        // the interceptor already showed a toast
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="row">

      <div className="col-md-12 d-flex justify-content-between align-items-center mb-3">
        <Breadcrumb />
        <Link to="/admin/departments/create" state={{ data: departments }} className="btn btn-primary">Create</Link>
      </div>

      <div className="col-md-12">
        <div className="card shadow">
          <div className="card-body p-4">

            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Parent</th>
                  <th>Order</th>
                  <th>In Use</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (<TableSpinnerRow />) :
                  (<DepartmentRows data={departments} onDelete={deleteDepartment} />)
                }
              </tbody>

            </table>
          </div>
          <div className="card-footer">
            <p className="fst-italic ms-3 text-decoration-underline">Total: {departments.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentsContent
