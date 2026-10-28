import Breadcrumb from "../../common/Breadcrumb";
import { Link } from "react-router-dom";
// import Edit from "../../../assets/images/icons/edit.svg?react";
// import Trash from "../../../assets/images/icons/trash.svg?react";

  // const response = await departments();
  // console.log(response);

const CategoriesContent = () => {
  // const [_items, _setDepartments] = useState([]);
  // const [_loading, _setLoading] = useState(true);

  return (
    <div className="row">
      <div className="col-md-12 d-flex justify-content-between align-items-center mb-3">
        <Breadcrumb/>
        <Link to="" className="btn btn-primary">create</Link>
      </div>
      
      {/* <div className="col-md-12">
        <div className="card shadow">
          <div className="card-body p-4">

            <table className="table table-hover">
                <thead>
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
                  { loading ? (<tr><td colSpan={6}>Loading ....</td></tr>) : 
                  (items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.parent_id ?? "---"}</td>
                      <td>{item.order}</td>
                      <td>
                        {item.in_use ? (<span className="badge rounded-circle bg-success">1</span>) : 
                        (<span className="badge rounded-circle bg-warning">0</span>)}
                        
                        
                      </td>
                      <td>
                        <Link className="btn btn-link text-info fs-5 p-0"><Edit/></Link>
                        <Link className="btn btn-link text-danger fs-6 p-0 ms-2"><Trash/></Link>
                      </td>
                    </tr>
                  )))
                  }
                </tbody>

            </table>
          </div>
          <div className="card-footer">
            pagination here
          </div>
        </div>
      </div> */}

    </div>
  )
}

export default CategoriesContent
