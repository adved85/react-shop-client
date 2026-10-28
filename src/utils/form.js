export const isInvalid = (errors, field) => {
    return errors[field] ? "is-invalid" : "";
};

// Laravel 422 errors ({ field: [messages] }) → react-hook-form field errors.
export const applyServerErrors = (error, setError) => {
    const fieldErrors = error.response?.data?.errors;
    if (fieldErrors) {
        Object.entries(fieldErrors).forEach((fe) => {
            const [fieldName, fieldMessages] = fe;
            setError(fieldName, { type: "server", message: fieldMessages[0] });
        });
    }
}