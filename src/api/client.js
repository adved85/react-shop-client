import axios from "axios";
import { toast } from "react-toastify";
import { env, commonErrorCodes, retryErrorCodes } from "../config/env";
import { ENDPOINTS } from "./endpoints";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const ADMIN_AUTH_ENDPOINTS = Object.values(ENDPOINTS.adminAuth);

// Only retried when idempotent: resending a POST can create a second order.
const RETRYABLE_METHODS = ["get", "head", "options"];

// Request and response bodies carry passwords and tokens, so they are only
// printed by the dev server. Vite compiles import.meta.env.DEV to `false` in a
// production build, which drops these calls from the bundle entirely.
function debug(...args) {
    if (import.meta.env.DEV) {
        console.log(...args);
    }
}

// What an error log may safely show. Never log the axios error itself: its
// `config.data` is the raw request body — on a failed login, the password.
function describeError(error) {
    return {
        status: error.response?.status,
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        message: error.message,
    };
}

function getAdminToken() {
    const adminStorage = localStorage.getItem("adminStorage");
    return adminStorage ? JSON.parse(adminStorage).token : null;
}

export const api = axios.create({
    baseURL: env.apiUrl,
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use(
    (config) => {
        const token = getAdminToken();

        // set header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        debug('Request:', {
            method: config.method.toUpperCase(),
            url: config.url,
            data: config.data || 'No data',
        });

        // Axios does this by default
        if (config.data && typeof config.data !== "string") {
            config.data = JSON.stringify(config.data);
        }

        return config;
    },
    (error) => {
        console.error("Request Error:", describeError(error));
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    // response => response,
    response => {
        const responseData = extractNestedResponseData(response);

        debug('Response:', {
            status: response.status,
            data: responseData,
            time: new Date().toLocaleTimeString(),
        });

        return responseData;
        // return response;
    },
    async (error) => {
        const { response, config } = error;

        if (!response) {
            toast.error("Network Error: Please, check your internet connection.");
            return Promise.reject(error); // pass error to .catch()
        }

        if (response.status === 401 && !ADMIN_AUTH_ENDPOINTS.includes(config?.url)) {
            localStorage.removeItem("adminStorage");
            window.location.href = "/admin/login";
        }

        // Returned, not fired off: the caller receives the retry's outcome
        // instead of the original failure. A retry that fails comes back
        // through this same handler, which is what bounds it at MAX_RETRIES.
        if (shouldRetry(error)) {
            config._retryCount = (config._retryCount || 0) + 1;
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return api(config);
        }

        if (commonErrorCodes.includes(response.status)) {
            toast.error(`Error ${response.status}: ${response.data.message}`);
        }

        console.error('Response Error:', describeError(error));
        return Promise.reject(error); // pass error to .catch()
    }

);

function shouldRetry({ response, config }) {
    return Boolean(config)
        && RETRYABLE_METHODS.includes((config.method || "get").toLowerCase())
        && retryErrorCodes.includes(response.status)
        && (config._retryCount || 0) < MAX_RETRIES;
}

function extractNestedResponseData(response) {
    // extract nested data
    if (response.data && response.data.data) {

        return response.data.data;
    }
    return response.data;
}