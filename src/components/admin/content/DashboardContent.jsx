import React from "react";

const DashboardContent = () => {
    return (
        <div className="row">
            <div className="col-md-4">
                <div className="card shadow">
                    <div className="card-body">
                        <h2>1</h2>
                        <span>Users</span>
                    </div>
                    <div className="card-footer">
                        <a href="#">View Users</a>
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card shadow">
                    <div className="card-body">
                        <h2>0</h2>
                        <span>Orders</span>
                    </div>
                    <div className="card-footer">
                        <a href="#">View Orders</a>
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card shadow">
                    <div className="card-body">
                        <h2>10</h2>
                        <span>Products</span>
                    </div>
                    <div className="card-footer">
                        <a href="#">View Products</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardContent
