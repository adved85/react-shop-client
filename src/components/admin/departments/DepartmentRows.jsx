import { Link } from "react-router-dom";

import EmptyState from "../../common/EmptyState";
import TableMessageRow from "../../common/table/TableMessageRow";

import Edit from "../../../assets/images/icons/edit.svg?react";
import Trash from "../../../assets/images/icons/trash.svg?react";

const DepartmentRows = ({ data = [], onDelete = () => {} }) => {
    if (data.length === 0) return <TableMessageRow><EmptyState label="departments" /></TableMessageRow>;

    const parentName = (id) =>  {
        if (!id) {
            return "---";
        }
        const parent = data.find(({id: itemId}) => Number(itemId) === id);
        return parent?.name;
    }

    return data.map((item) => (
        <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{parentName(item.parent_id)}</td>
            <td>{item.order}</td>
            <td>
                {item.in_use ? (<span className="badge rounded-circle bg-success">1</span>) :
                    (<span className="badge rounded-circle bg-warning">0</span>)}
            </td>
            <td>
                <Link to={`/admin/departments/${item.id}/edit`} state={{ data }} className="btn btn-link text-info fs-5 p-0"><Edit /></Link>
                <button type="button" onClick={() => onDelete(item)} className="btn btn-link text-danger fs-6 p-0 ms-2"><Trash /></button>
            </td>
        </tr>
    ))
}

export default DepartmentRows
