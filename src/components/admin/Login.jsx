import React from 'react';
import Layout from '../common/Layout';
import { useForm } from "react-hook-form";
// import { env } from '../../config/env';
import { login } from '../../services/authAdmin.service';
import { useNavigate } from "react-router";
import { useAdmin } from "../context/AdminContext";

import { useState } from "react";

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login: setAdminSession } = useAdmin();

    const handleLogin = async (data) => {
        console.log(data);
        setIsLoading(true);

        try {
            const resposeData = await login(data);
            console.log(resposeData);

            const { token, user: { email, name, id, system_role } } = resposeData;

            const adminData = {
                token,
                email,
                name,
                id,
                system_role,
            };

            localStorage.setItem("adminStorage", JSON.stringify(adminData));
            setAdminSession(adminData);
            navigate("/admin/dashboard");

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const isInvalid = (field) => {
        return errors[field] ? "is-invalid" : "";
    };

    // used for debug
    // console.log(errors); 
    // console.log(env);


    return (
        <Layout>
            <div className="container">

                <div className="row justify-content-center my-5">
                    <div className="col-md-5">
                        <div className="card shadow border-0">

                            <div className="card-body p-4" style={{'minHeight' : '310px'}}>
                                <h3>Admin Login / admin@admin.com / password</h3>

                                {isLoading ?
                                    <div className="spinner-grow text-secondary" role="status"></div>
                                    :
                                    <form onSubmit={handleSubmit(handleLogin)}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email address</label>
                                            <input
                                                {...register("email", {
                                                    required: "The email field is required",
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: "Invalid email address"
                                                    }
                                                })}
                                                className={`form-control ${isInvalid("email")}`}
                                                type="email" id="email" name="email" placeholder="admin@pure-wear.com" />

                                            {errors.email && <p className="text-danger">{errors?.email.message}</p>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="pass" className="form-label">Password</label>
                                            <input
                                                {
                                                ...register("password", {
                                                    required: "The password field is required",
                                                })
                                                }
                                                className={`form-control ${isInvalid("password")}`}
                                                type="password" id="pass" name="password" placeholder="Password" />
                                            {errors.password && <p className="text-danger">{errors?.password.message}</p>}
                                        </div>

                                        <div className="col-auto">
                                            {/* <button type="submit" className="btn btn-primary mb-3" onClick={handleLogin}>Login</button> */}
                                            <button type="submit" className="btn btn-primary mb-3">Login</button>
                                        </div>
                                    </form>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Login
