import Breadcrumb from "../../common/Breadcrumb";
import { useForm } from "react-hook-form";

import { storeDepartment } from "../../../api/adminDepartments";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { isInvalid, applyServerErrors } from "../../../utils/form";


const DepartmentCreate = () => {
    const [disabled, setDisabled] = useState(false);
    const { register, handleSubmit, formState: { errors }, setError } = useForm();
    const navigate = useNavigate();
    const { state } = useLocation();
    const data = state?.data ?? [];

    const handleCreate = async (data) => {
        try {
            setDisabled(true);
            const response = await storeDepartment(data);
            const message = `${response.name} created!`;
            toast.success(message, {
                autoClose: 1000
            });

            navigate("/admin/departments");

        } catch (error) {
            applyServerErrors(error, setError);
        } finally {
            setDisabled(false);
        }
    }

    return (
        <div className="row">
            <div className="col-md-12 mb-3">
                <Breadcrumb />
            </div>

            <div className="col-md-12">
                <div className="card shadow">
                    <div className="card-body p-4">

                        <form onSubmit={handleSubmit(handleCreate)}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    {...register("name", {
                                        required: "Department name is required",
                                        minLength: {value: 2,  message: "Department name must be at least 2 characters"}
                                    })}
                                    className={`form-control ${isInvalid(errors, "name")}`}
                                    type="text" name="name" id="name" placeholder="Department name" />
                                {
                                    errors.name && <span className="invalid-feedback">{errors.name.message}</span>
                                }
                            </div>
                            <div className="mb-3">
                                <label htmlFor="parent_id" className="form-label">Parent Department</label>
                                <select
                                    {...register("parent_id")}
                                    className={`form-select ${isInvalid(errors, "parent_id")}`} name="parent_id" id="parent_id">
                                    <option value="" defaultValue>Select...</option>
                                    {
                                        data.map((item) => {
                                            return (<option value={item.id} key={item.slug}>{item.name}</option>)
                                        })
                                    }
                                </select>
                                {
                                    errors.parent_id && <span className="invalid-feedback">{errors.parent_id.message}</span>
                                }
                            </div>
                            <div className="form-check mb-3">
                                <input
                                    {...register("in_use")}
                                    className="form-check-input" type="checkbox" value="" name="in_use" id="in_use" />
                                <label className="form-check-label" htmlFor="in_use">In Use</label>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary btn-sm" disabled={disabled}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default DepartmentCreate
