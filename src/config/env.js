export const env = {
    apiUrl: import.meta.env.VITE_API_URL,
}

export const commonErrorCodes = [400, 401, 403, 404, 409, 422, 429];
export const retryErrorCodes = [500, 503];
