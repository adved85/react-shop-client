const EmptyState = ({ label = "", icon = "⚠️" }) => {
    const message = label ? `No ${label} found.` : "No data found.";
    return (
        <div className="d-flex justify-content-center">
            <span className="me-1">{icon}</span>
            <p className="text-secondary m-0">{message}</p>
        </div>
    )
}

export default EmptyState
