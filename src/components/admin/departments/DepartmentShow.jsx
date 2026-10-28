import SpinnerGrow from "../../common/SpinnerGrow";
import Breadcrumb from "../../common/Breadcrumb";
import { useParams } from 'react-router-dom';

import { showDepartment } from "../../../api/adminDepartments";
import { useEffect, useState } from "react";

// Turns a department into [label, value] rows for the details table.
const prepareTableData = (data) =>
    Object.entries(data || {}).map(([key, value]) => {
        if (key === "in_use") return [key, value ? "yes" : "no"];
        if (key === "parent_id") return ["parent", value || "no parent"];
        return [key, value];
    });

const DepartmentShow = () => {
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverMessage, setServerMessage] = useState("");
    const { id } = useParams();

    useEffect(() => {
        const load = async () => {
            try {
                const response = await showDepartment(id);

                setDepartment(prepareTableData(response));

            } catch (error) {
                setServerMessage(error.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    return (
        <div className="row">
            <div className="col-md-12 mb-3">
                <Breadcrumb />
            </div>

            {
                loading ? <SpinnerGrow /> :

                    (<div className="col-md-12">
                        <div className="card shadow">
                            <div className="card-body p-4">
                                {
                                    !department ? <pre>{serverMessage}</pre> :
                                        (<table className="table table-sm mb-0">
                                            <tbody>
                                                {department.map(([k, v]) => (
                                                    <tr key={k}>
                                                        <th scope="row" style={{ width: "120px" }}>{k}</th>
                                                        <td>{v}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>)
                                }
                            </div>
                        </div>
                    </div>)

            }
        </div>

    )
}

export default DepartmentShow
